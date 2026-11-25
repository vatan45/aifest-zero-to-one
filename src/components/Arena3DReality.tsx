import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Gamepad2,
  Layers,
  Link2,
  Map as MapIcon,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  Sun,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  ProposalSummary,
  TrackDepartment,
  calculateTrackMetrics,
} from '../utils/hackathonModel';
import {
  CAMERA_PRESETS,
  CINEMATIC_TOUR_ORDER,
  CameraPresetId,
  LIGHTING_MOODS,
  LightingMoodId,
  OverlayModeId,
  RoofModeId,
  STANDING_DIRECTIONS,
  ViewPerspectiveMode,
  clampCameraPosition,
  computeCompassYawDeg,
  getEyeLevelViewForPreset,
  getStandingLookTarget,
  getTrackCameraView,
  getTrackEyeLevelView,
} from '../scene3d/arenaLayoutMath';
import {
  CharacterMotionState,
  ExplorerAreaConfig,
  ExplorerAreaId,
  ExplorerCameraPerspective,
  HOLOGRAM_TRIGGER_RADIUS_M,
  buildExplorerAreas,
  computeExplorerCamera,
  findNearbyHologramArea,
  stepCharacterMovement,
} from '../scene3d/explorerAreas';
import { createProceduralTexturePack } from '../scene3d/proceduralTextures';
import { ArenaSceneHandles, buildArenaScene } from '../scene3d/buildArenaScene';

interface Arena3DRealityProps {
  standalone?: boolean;
  tracks: TrackDepartment[];
  summary: ProposalSummary;
  onSelectTrack: (trackId: string) => void;
  onJumpToBlueprint: () => void;
  onOpenProposalDocs?: () => void;
  onOpenStandalone?: () => void;
}

type ExtendedViewMode = ViewPerspectiveMode | 'explorer';
type DockTabId = 'cameras' | 'explorer' | 'tracks' | 'environment';

// Module-scope reusable scratch vectors (zero GC in render/camera loop)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveDelta = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _rayMouse = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export default function Arena3DReality({
  standalone = false,
  tracks,
  summary,
  onSelectTrack,
  onJumpToBlueprint,
  onOpenProposalDocs,
  onOpenStandalone,
}: Arena3DRealityProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [activePresetId, setActivePresetId] = useState<CameraPresetId>('master-aerial');
  const [focusedTrackId, setFocusedTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ExtendedViewMode>('aerial');
  const [standingYawDeg, setStandingYawDeg] = useState<number>(235);
  const [standingSpotLabel, setStandingSpotLabel] = useState<string | null>(null);
  const [lightingMood, setLightingMood] = useState<LightingMoodId>('night-keynote');
  const [roofMode, setRoofMode] = useState<RoofModeId>('translucent');
  const [overlayMode, setOverlayMode] = useState<OverlayModeId>('tracks');
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [tourPlaying, setTourPlaying] = useState(false);
  const [dockTab, setDockTab] = useState<DockTabId>('cameras');
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [snapshotNotice, setSnapshotNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Playable Explorer Game state (1 playable character + 1 hologram point in every area)
  const explorerAreas = buildExplorerAreas(tracks);
  const [activeExplorerAreaId, setActiveExplorerAreaId] = useState<ExplorerAreaId>('stage-plaza');
  const [explorerPerspective, setExplorerPerspective] = useState<ExplorerCameraPerspective>('tpp');
  const [activeHologramArea, setActiveHologramArea] = useState<ExplorerAreaConfig | null>(null);
  const [showScreenBrief, setShowScreenBrief] = useState(false);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  const viewModeRef = useRef<ExtendedViewMode>('aerial');
  viewModeRef.current = viewMode;
  const activePresetIdRef = useRef<CameraPresetId>('master-aerial');
  activePresetIdRef.current = activePresetId;
  const focusedTrackIdRef = useRef<string | null>(null);
  focusedTrackIdRef.current = focusedTrackId;
  const activeExplorerAreaIdRef = useRef<ExplorerAreaId>('stage-plaza');
  activeExplorerAreaIdRef.current = activeExplorerAreaId;
  const explorerPerspectiveRef = useRef<ExplorerCameraPerspective>('tpp');
  explorerPerspectiveRef.current = explorerPerspective;
  const dismissedHologramIdRef = useRef<ExplorerAreaId | null>(null);
  const padInputRef = useRef({ forward: false, backward: false, left: false, right: false });
  const padDownTimeRef = useRef<number>(0);

  // Mutable scene & camera refs so React state changes never recreate the WebGL context
  const sceneApiRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    handles: ArenaSceneHandles;
    isSoftwareGl: boolean;
    requestRender: () => void;
    applyControlsPerspective: (mode: ExtendedViewMode) => void;
    flyTo: (
      pos: { x: number; y: number; z: number },
      target: { x: number; y: number; z: number },
      fov: number,
      modeOverride?: ExtendedViewMode
    ) => void;
    lookInDirection: (yawDeg: number, pitchDeg?: number) => void;
    setAutoOrbitActive: (enabled: boolean) => void;
    enterExplorerArea: (
      areaId: ExplorerAreaId,
      walkToHologram?: boolean,
      perspectiveOverride?: ExplorerCameraPerspective
    ) => void;
    setExplorerCameraPerspective: (perspective: ExplorerCameraPerspective) => void;
    walkActiveCharacterToHologram: () => void;
    nudgeExplorerControl: (dir: 'forward' | 'backward' | 'left' | 'right') => void;
  } | null>(null);

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const onSelectTrackRef = useRef(onSelectTrack);
  onSelectTrackRef.current = onSelectTrack;

  const triggerFlyToPreset = useCallback(
    (presetId: CameraPresetId, stopTour = true, modeOverride?: ExtendedViewMode) => {
      if (stopTour) setTourPlaying(false);
      let effectiveMode = modeOverride ?? viewModeRef.current;
      if (effectiveMode === 'explorer') {
        effectiveMode = 'aerial';
        setViewMode('aerial');
        viewModeRef.current = 'aerial';
      }
      setActiveHologramArea(null);
      setShowScreenBrief(false);
      setIsAutoWalking(false);
      sceneApiRef.current?.handles.setExplorerVisibility(null, false);
      const preset = CAMERA_PRESETS.find((p) => p.id === presetId) ?? CAMERA_PRESETS[0];
      setActivePresetId(preset.id);
      setFocusedTrackId(null);
      sceneApiRef.current?.handles.setSelectedTrack(null);

      if (effectiveMode === 'eye-level') {
        const eye = getEyeLevelViewForPreset(preset.id);
        setStandingYawDeg(eye.yawDeg);
        setStandingSpotLabel(eye.standingLabel);
        sceneApiRef.current?.flyTo(eye.position, eye.target, eye.fov, 'eye-level');
      } else {
        setStandingSpotLabel(null);
        sceneApiRef.current?.flyTo(preset.position, preset.target, preset.fov, 'aerial');
      }
    },
    []
  );

  const triggerFocusTrack = useCallback(
    (trackId: string | null, modeOverride?: ExtendedViewMode) => {
      setTourPlaying(false);
      let effectiveMode = modeOverride ?? viewModeRef.current;
      if (effectiveMode === 'explorer') {
        effectiveMode = 'aerial';
        setViewMode('aerial');
        viewModeRef.current = 'aerial';
      }
      setActiveHologramArea(null);
      setShowScreenBrief(false);
      setIsAutoWalking(false);
      sceneApiRef.current?.handles.setExplorerVisibility(null, false);
      setFocusedTrackId(trackId);
      sceneApiRef.current?.handles.setSelectedTrack(trackId);
      if (!trackId) {
        triggerFlyToPreset('master-aerial', true, effectiveMode);
        return;
      }
      const found = tracksRef.current.find((t) => t.id === trackId);
      if (found) {
        onSelectTrackRef.current(found.id);
        if (effectiveMode === 'eye-level') {
          const eye = getTrackEyeLevelView(found);
          setStandingYawDeg(eye.yawDeg);
          setStandingSpotLabel(eye.standingLabel);
          sceneApiRef.current?.flyTo(eye.position, eye.target, eye.fov, 'eye-level');
        } else {
          setStandingSpotLabel(null);
          const view = getTrackCameraView(found);
          sceneApiRef.current?.flyTo(view.position, view.target, view.fov, 'aerial');
        }
      }
    },
    [triggerFlyToPreset]
  );

  const triggerEnterExplorerArea = useCallback(
    (areaId: ExplorerAreaId, walkToHologram = false) => {
      setTourPlaying(false);
      setAutoOrbit(false);
      setViewMode('explorer');
      viewModeRef.current = 'explorer';
      setActiveExplorerAreaId(areaId);
      activeExplorerAreaIdRef.current = areaId;
      setDockTab('explorer');
      setStandingSpotLabel(null);
      setShowScreenBrief(false);
      sceneApiRef.current?.enterExplorerArea(areaId, walkToHologram, explorerPerspectiveRef.current);
    },
    []
  );

  const triggerSetExplorerPerspective = useCallback((nextPersp: ExplorerCameraPerspective) => {
    setExplorerPerspective(nextPersp);
    explorerPerspectiveRef.current = nextPersp;
    if (viewModeRef.current !== 'explorer') {
      setViewMode('explorer');
      viewModeRef.current = 'explorer';
      setDockTab('explorer');
      sceneApiRef.current?.enterExplorerArea(activeExplorerAreaIdRef.current, false, nextPersp);
      return;
    }
    sceneApiRef.current?.setExplorerCameraPerspective(nextPersp);
  }, []);

  const triggerWalkToHologram = useCallback(() => {
    setTourPlaying(false);
    setAutoOrbit(false);
    if (viewModeRef.current !== 'explorer') {
      triggerEnterExplorerArea(activeExplorerAreaIdRef.current, true);
      return;
    }
    sceneApiRef.current?.walkActiveCharacterToHologram();
  }, [triggerEnterExplorerArea]);

  const triggerSwitchViewMode = useCallback(
    (nextMode: ExtendedViewMode) => {
      if (nextMode === 'explorer') {
        triggerEnterExplorerArea(activeExplorerAreaIdRef.current, false);
        return;
      }
      setViewMode(nextMode);
      viewModeRef.current = nextMode;
      setTourPlaying(false);
      setActiveHologramArea(null);
      setShowScreenBrief(false);
      setIsAutoWalking(false);
      sceneApiRef.current?.handles.setExplorerVisibility(null, false);
      const currentTrack = focusedTrackIdRef.current;
      if (currentTrack) {
        triggerFocusTrack(currentTrack, nextMode);
      } else {
        triggerFlyToPreset(activePresetIdRef.current, true, nextMode);
      }
    },
    [triggerEnterExplorerArea, triggerFlyToPreset, triggerFocusTrack]
  );

  const triggerLookDirection = useCallback((yawDeg: number) => {
    const normalized = ((yawDeg % 360) + 360) % 360;
    setStandingYawDeg(normalized);
    setAutoOrbit(false);
    setTourPlaying(false);
    setActiveHologramArea(null);
    if (viewModeRef.current !== 'eye-level') {
      setViewMode('eye-level');
      viewModeRef.current = 'eye-level';
      const eye = getEyeLevelViewForPreset(activePresetIdRef.current);
      setStandingSpotLabel(eye.standingLabel);
      const directedTarget = getStandingLookTarget(eye.position, normalized, 3);
      sceneApiRef.current?.flyTo(eye.position, directedTarget, eye.fov, 'eye-level');
      return;
    }
    sceneApiRef.current?.lookInDirection(normalized, 3);
  }, []);

  // Guided Cinematic Tour cycling cleanly across all curated camera presets
  useEffect(() => {
    if (!tourPlaying) return;
    let stepIdx = Math.max(0, CINEMATIC_TOUR_ORDER.indexOf(activePresetId));
    const timer = window.setInterval(() => {
      stepIdx = (stepIdx + 1) % CINEMATIC_TOUR_ORDER.length;
      const nextId = CINEMATIC_TOUR_ORDER[stepIdx];
      triggerFlyToPreset(nextId, false);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [tourPlaying, activePresetId, triggerFlyToPreset]);

  // Sync lighting, roof, overlay, and auto-orbit state into the live Three.js scene
  useEffect(() => {
    const api = sceneApiRef.current;
    if (!api) return;
    api.handles.applyLightingMood(lightingMood);
    api.requestRender();
  }, [lightingMood]);

  useEffect(() => {
    const api = sceneApiRef.current;
    if (!api) return;
    api.handles.applyRoofMode(roofMode);
    api.requestRender();
  }, [roofMode]);

  useEffect(() => {
    const api = sceneApiRef.current;
    if (!api) return;
    api.handles.applyOverlayMode(overlayMode);
    api.requestRender();
  }, [overlayMode]);

  useEffect(() => {
    const api = sceneApiRef.current;
    if (!api) return;
    api.setAutoOrbitActive(autoOrbit);
  }, [autoOrbit]);

  // Mount WebGLRenderer + Three.js Bus Parking Arena once
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: isSoftwareGl,
      });
    } catch {
      setWebglError('WebGL is unavailable in this browser session.');
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initialW = Math.max(container.clientWidth, 320);
    const initialH = Math.max(container.clientHeight, 320);
    renderer.setSize(initialW, initialH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Mandatory studio environment reflections (RoomEnvironment PMREM on every device)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const masterPreset = CAMERA_PRESETS[0];
    const camera = new THREE.PerspectiveCamera(
      masterPreset.fov,
      initialW / initialH,
      0.5,
      1100
    );
    camera.position.set(
      masterPreset.position.x,
      masterPreset.position.y,
      masterPreset.position.z
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(masterPreset.target.x, masterPreset.target.y, masterPreset.target.z);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 6;
    controls.maxDistance = 320;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.65;
    controls.update();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTexturePack(
      tracksRef.current,
      summary.totalShowUp,
      maxAniso
    );
    const handles = buildArenaScene(scene, renderer, tracksRef.current, textures, isSoftwareGl);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Smooth camera transition, playable character states, & keyboard navigation
    let transitionActive = false;
    const goalPos = new THREE.Vector3().copy(camera.position);
    const goalTarget = new THREE.Vector3().copy(controls.target);
    let goalFov = camera.fov;
    let isAutoOrbit = false;
    const keysHeld = new Set<string>();
    let disposed = false;

    const characterStates = new Map<ExplorerAreaId, CharacterMotionState>();
    handles.explorerAreas.forEach((area) => {
      characterStates.set(area.id, {
        x: area.spawnPos.x,
        z: area.spawnPos.z,
        facingYawRad: area.spawnYawRad,
        walkCyclePhase: 0,
        isMoving: false,
      });
    });
    let autoWalkTarget: { x: number; z: number } | null = null;
    let openHologramId: ExplorerAreaId | null = null;
    const mountStartMs = performance.now();

    // On-demand coalesced rendering + software WebGL afterDraw fence pacing
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTimestamp = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const syncNearbyHologram = (charState: CharacterMotionState) => {
      const nearby = findNearbyHologramArea(
        charState,
        handles.explorerAreas,
        HOLOGRAM_TRIGGER_RADIUS_M
      );
      if (!nearby) {
        dismissedHologramIdRef.current = null;
        if (openHologramId !== null) {
          openHologramId = null;
          setActiveHologramArea(null);
        }
        return;
      }
      if (dismissedHologramIdRef.current === nearby.id) {
        if (openHologramId !== null) {
          openHologramId = null;
          setActiveHologramArea(null);
        }
        return;
      }
      if (openHologramId !== nearby.id) {
        openHologramId = nearby.id;
        setActiveHologramArea(nearby);
      }
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;
        const dt = Math.min(0.1, Math.max(0.008, (now - lastTimestamp) / 1000));
        lastTimestamp = now;
        const elapsedSec = (now - mountStartMs) / 1000;

        let needsFollowupFrame = false;

        // Playable Explorer Game Mode: auto-turning WASD steering + TPP/FPP follow camera + in-world 3D Hologram
        if (viewModeRef.current === 'explorer') {
          const areaId = activeExplorerAreaIdRef.current;
          const prevChar = characterStates.get(areaId);
          if (prevChar) {
            const pad = padInputRef.current;
            const moveInput = {
              forward: keysHeld.has('KeyW') || keysHeld.has('ArrowUp') || pad.forward,
              backward: keysHeld.has('KeyS') || keysHeld.has('ArrowDown') || pad.backward,
              left: keysHeld.has('KeyA') || keysHeld.has('ArrowLeft') || pad.left,
              right: keysHeld.has('KeyD') || keysHeld.has('ArrowRight') || pad.right,
              sprint: keysHeld.has('ShiftLeft') || keysHeld.has('ShiftRight'),
            };
            const manualPressed =
              moveInput.forward || moveInput.backward || moveInput.left || moveInput.right;
            if (manualPressed && autoWalkTarget) {
              autoWalkTarget = null;
              setIsAutoWalking(false);
            }

            const { next, reachedTarget, isTurning } = stepCharacterMovement(
              prevChar,
              moveInput,
              dt,
              autoWalkTarget
            );
            characterStates.set(areaId, next);
            handles.updateExplorerCharacter(
              areaId,
              next.x,
              next.z,
              next.facingYawRad,
              next.walkCyclePhase,
              next.isMoving
            );

            if (reachedTarget) {
              autoWalkTarget = null;
              setIsAutoWalking(false);
            }

            // Auto-follow & auto-turn camera with the explorer in both TPP and FPP (zero mouse needed!)
            if (next.isMoving || isTurning || reachedTarget) {
              transitionActive = false;
              const persp = explorerPerspectiveRef.current;
              const camGoal = computeExplorerCamera(next, persp);
              if (isSoftwareGl || persp === 'fpp') {
                camera.position.set(camGoal.position.x, camGoal.position.y, camGoal.position.z);
                controls.target.set(camGoal.target.x, camGoal.target.y, camGoal.target.z);
              } else {
                const followLambda = 11;
                camera.position.x = THREE.MathUtils.damp(camera.position.x, camGoal.position.x, followLambda, dt);
                camera.position.y = THREE.MathUtils.damp(camera.position.y, camGoal.position.y, followLambda, dt);
                camera.position.z = THREE.MathUtils.damp(camera.position.z, camGoal.position.z, followLambda, dt);
                controls.target.x = THREE.MathUtils.damp(controls.target.x, camGoal.target.x, followLambda, dt);
                controls.target.y = THREE.MathUtils.damp(controls.target.y, camGoal.target.y, followLambda, dt);
                controls.target.z = THREE.MathUtils.damp(controls.target.z, camGoal.target.z, followLambda, dt);
              }
              if (Math.abs(camera.fov - camGoal.fov) > 0.2) {
                camera.fov = camGoal.fov;
                camera.updateProjectionMatrix();
              }
              if (next.isMoving || isTurning) {
                needsFollowupFrame = true;
              }
            }

            syncNearbyHologram(next);
            handles.updateHologramState(
              openHologramId,
              { x: camera.position.x, z: camera.position.z },
              elapsedSec,
              isSoftwareGl
            );

            // Keep idle crystal/marker animation smooth on hardware GPUs
            if (!isSoftwareGl && (openHologramId !== null || autoWalkTarget !== null)) {
              needsFollowupFrame = true;
            }
          }
        } else {
          // Aerial / Eye View: keep hologram beacons facing camera
          handles.updateHologramState(
            null,
            { x: camera.position.x, z: camera.position.z },
            elapsedSec,
            isSoftwareGl
          );

          // Smooth keyboard flight (Aerial) or human-speed walking (Eye View 1.7m)
          if (keysHeld.size > 0) {
            transitionActive = false;
            camera.getWorldDirection(_forward);
            _forward.y = 0;
            if (_forward.lengthSq() > 1e-6) _forward.normalize();
            _right.crossVectors(_forward, _up).normalize();

            const isEye = viewModeRef.current === 'eye-level';
            const baseSpeed = isEye ? 7.5 : 34;
            const sprintSpeed = isEye ? 14.5 : 68;
            const moveSpeed =
              (keysHeld.has('ShiftLeft') || keysHeld.has('ShiftRight') ? sprintSpeed : baseSpeed) *
              dt;
            _moveDelta.set(0, 0, 0);
            if (keysHeld.has('KeyW') || keysHeld.has('ArrowUp'))
              _moveDelta.addScaledVector(_forward, moveSpeed);
            if (keysHeld.has('KeyS') || keysHeld.has('ArrowDown'))
              _moveDelta.addScaledVector(_forward, -moveSpeed);
            if (keysHeld.has('KeyD') || keysHeld.has('ArrowRight'))
              _moveDelta.addScaledVector(_right, moveSpeed);
            if (keysHeld.has('KeyA') || keysHeld.has('ArrowLeft'))
              _moveDelta.addScaledVector(_right, -moveSpeed);
            if (!isEye) {
              if (keysHeld.has('KeyE')) _moveDelta.y += moveSpeed * 0.6;
              if (keysHeld.has('KeyQ')) _moveDelta.y -= moveSpeed * 0.6;
            }

            camera.position.add(_moveDelta);
            controls.target.add(_moveDelta);
            const clamped = clampCameraPosition(camera.position, isEye ? 1.65 : 2.0);
            camera.position.set(clamped.x, clamped.y, clamped.z);
            if (!isEye) {
              controls.target.y = Math.max(0.5, Math.min(45, controls.target.y));
            }
            needsFollowupFrame = true;
          }
        }

        // Exponential damping glide for camera presets & track focus
        if (transitionActive) {
          if (isSoftwareGl) {
            camera.position.copy(goalPos);
            controls.target.copy(goalTarget);
            camera.fov = goalFov;
            camera.updateProjectionMatrix();
            transitionActive = false;
          } else {
            const lambda = 5.5;
            camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.x, lambda, dt);
            camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.y, lambda, dt);
            camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.z, lambda, dt);
            controls.target.x = THREE.MathUtils.damp(controls.target.x, goalTarget.x, lambda, dt);
            controls.target.y = THREE.MathUtils.damp(controls.target.y, goalTarget.y, lambda, dt);
            controls.target.z = THREE.MathUtils.damp(controls.target.z, goalTarget.z, lambda, dt);
            camera.fov = THREE.MathUtils.damp(camera.fov, goalFov, lambda, dt);
            camera.updateProjectionMatrix();

            const posErr = camera.position.distanceTo(goalPos);
            const tgtErr = controls.target.distanceTo(goalTarget);
            if (posErr < 0.25 && tgtErr < 0.25 && Math.abs(camera.fov - goalFov) < 0.15) {
              camera.position.copy(goalPos);
              controls.target.copy(goalTarget);
              camera.fov = goalFov;
              camera.updateProjectionMatrix();
              transitionActive = false;
            } else {
              needsFollowupFrame = true;
            }
          }
        }

        const minFloorY =
          viewModeRef.current === 'eye-level' ||
          (viewModeRef.current === 'explorer' && explorerPerspectiveRef.current === 'fpp')
            ? 1.65
            : 2.0;
        const clampedNow = clampCameraPosition(camera.position, minFloorY);
        camera.position.set(clampedNow.x, clampedNow.y, clampedNow.z);

        controls.autoRotate = !isSoftwareGl && isAutoOrbit && !transitionActive;
        const controlsMoved = controls.update();
        if ((controlsMoved && !isSoftwareGl) || (isAutoOrbit && !isSoftwareGl)) {
          needsFollowupFrame = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || needsFollowupFrame)) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    const applyControlsPerspective = (mode: ExtendedViewMode) => {
      if (mode === 'eye-level') {
        controls.minDistance = 0.05;
        controls.maxDistance = 0.55;
        controls.minPolarAngle = Math.PI * 0.25;
        controls.maxPolarAngle = Math.PI * 0.78;
        controls.rotateSpeed = -0.55;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotateSpeed = -0.75;
      } else if (mode === 'explorer') {
        const isFpp = explorerPerspectiveRef.current === 'fpp';
        controls.minDistance = isFpp ? 0.2 : 3.5;
        controls.maxDistance = isFpp ? 14 : 24;
        controls.minPolarAngle = 0.18;
        controls.maxPolarAngle = isFpp ? Math.PI * 0.75 : Math.PI / 2 - 0.05;
        controls.rotateSpeed = isFpp ? -0.45 : 0.85;
        controls.enablePan = false;
        controls.enableZoom = !isFpp;
        controls.autoRotateSpeed = 0.5;
      } else {
        controls.minDistance = 6;
        controls.maxDistance = 320;
        controls.minPolarAngle = 0.08;
        controls.maxPolarAngle = Math.PI / 2 - 0.03;
        controls.rotateSpeed = 1.0;
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.autoRotateSpeed = 0.65;
      }
    };

    const flyTo = (
      pos: { x: number; y: number; z: number },
      target: { x: number; y: number; z: number },
      fov: number,
      modeOverride?: ExtendedViewMode
    ) => {
      const effectiveMode = modeOverride ?? viewModeRef.current;
      applyControlsPerspective(effectiveMode);
      goalPos.set(pos.x, pos.y, pos.z);
      goalTarget.set(target.x, target.y, target.z);
      goalFov = fov;
      if (isSoftwareGl) {
        transitionActive = false;
        const minFloorY =
          effectiveMode === 'eye-level' ||
          (effectiveMode === 'explorer' && explorerPerspectiveRef.current === 'fpp')
            ? 1.65
            : 2.0;
        const clamped = clampCameraPosition(goalPos, minFloorY);
        camera.position.set(clamped.x, clamped.y, clamped.z);
        controls.target.copy(goalTarget);
        camera.fov = goalFov;
        camera.updateProjectionMatrix();
        controls.update();
        renderer.render(scene, camera);
        return;
      }
      transitionActive = true;
      lastTimestamp = performance.now();
      requestRender();
    };

    const enterExplorerArea = (
      areaId: ExplorerAreaId,
      walkToHologram = false,
      perspectiveOverride?: ExplorerCameraPerspective
    ) => {
      const persp = perspectiveOverride ?? explorerPerspectiveRef.current;
      explorerPerspectiveRef.current = persp;
      const area = handles.explorerAreas.find((a) => a.id === areaId) ?? handles.explorerAreas[0];
      let charState = characterStates.get(area.id);
      if (!charState) {
        charState = {
          x: area.spawnPos.x,
          z: area.spawnPos.z,
          facingYawRad: area.spawnYawRad,
          walkCyclePhase: 0,
          isMoving: false,
        };
        characterStates.set(area.id, charState);
      }
      handles.setActiveExplorerArea(area.id);
      handles.setExplorerVisibility(area.id, persp === 'fpp');
      dismissedHologramIdRef.current = null;

      // Sync track highlight when entering a track zone
      const matchingTrack = tracksRef.current.find((t) => t.id === area.id);
      setFocusedTrackId(matchingTrack ? matchingTrack.id : null);
      handles.setSelectedTrack(matchingTrack ? matchingTrack.id : null);

      if (walkToHologram && isSoftwareGl) {
        // Advance explorer smoothly to comfortable 3D hologram reading distance
        const approachDx = area.spawnPos.x - area.hologramPos.x;
        const approachDz = area.spawnPos.z - area.hologramPos.z;
        const approachLen = Math.hypot(approachDx, approachDz) || 1;
        const ux = approachDx / approachLen;
        const uz = approachDz / approachLen;
        const standDist = persp === 'fpp' ? 5.6 : 4.7;
        const stopX = area.hologramPos.x + ux * standDist;
        const stopZ = area.hologramPos.z + uz * standDist;
        const facingHolo = Math.atan2(-ux, -uz);

        const arrived: CharacterMotionState = {
          x: stopX,
          z: stopZ,
          facingYawRad: facingHolo,
          walkCyclePhase: 1.2,
          isMoving: false,
        };
        characterStates.set(area.id, arrived);
        handles.updateExplorerCharacter(area.id, arrived.x, arrived.z, arrived.facingYawRad, 1.2, false);
        autoWalkTarget = null;
        setIsAutoWalking(false);

        const camView = computeExplorerCamera(arrived, persp, 0, 6.8);
        const frameTarget = {
          x: area.hologramPos.x,
          y: persp === 'fpp' ? 2.95 : 2.85,
          z: area.hologramPos.z,
        };
        openHologramId = area.id;
        setActiveHologramArea(area);
        handles.updateHologramState(area.id, { x: camView.position.x, z: camView.position.z }, 2.0, true);
        flyTo(camView.position, frameTarget, camView.fov, 'explorer');
        return;
      }

      const camView = computeExplorerCamera(charState, persp, 0, 7.2);

      if (walkToHologram) {
        autoWalkTarget = { x: area.hologramPos.x, z: area.hologramPos.z };
        setIsAutoWalking(true);
      } else {
        autoWalkTarget = null;
        setIsAutoWalking(false);
      }

      syncNearbyHologram(charState);
      handles.updateHologramState(
        openHologramId,
        { x: camView.position.x, z: camView.position.z },
        (performance.now() - mountStartMs) / 1000,
        isSoftwareGl
      );
      flyTo(camView.position, camView.target, camView.fov, 'explorer');
    };

    const setExplorerCameraPerspective = (persp: ExplorerCameraPerspective) => {
      explorerPerspectiveRef.current = persp;
      const areaId = activeExplorerAreaIdRef.current;
      let charState = characterStates.get(areaId);
      if (!charState) return;
      handles.setExplorerVisibility(areaId, persp === 'fpp');

      // If standing too close to an active open hologram when entering FPP, step back gently for crisp framing
      const openArea = openHologramId
        ? handles.explorerAreas.find((a) => a.id === openHologramId)
        : null;
      if (persp === 'fpp' && openArea) {
        const dx = charState.x - openArea.hologramPos.x;
        const dz = charState.z - openArea.hologramPos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 5.3) {
          const ux = dist > 0.01 ? dx / dist : 0;
          const uz = dist > 0.01 ? dz / dist : 1;
          charState = {
            ...charState,
            x: openArea.hologramPos.x + ux * 5.6,
            z: openArea.hologramPos.z + uz * 5.6,
            facingYawRad: Math.atan2(-ux, -uz),
          };
          characterStates.set(areaId, charState);
          handles.updateExplorerCharacter(
            areaId,
            charState.x,
            charState.z,
            charState.facingYawRad,
            charState.walkCyclePhase,
            false
          );
        }
      }

      const camView = computeExplorerCamera(charState, persp, 0, 6.9);
      const target = openArea
        ? { x: openArea.hologramPos.x, y: persp === 'fpp' ? 2.95 : 2.85, z: openArea.hologramPos.z }
        : camView.target;
      handles.updateHologramState(
        openHologramId,
        { x: camView.position.x, z: camView.position.z },
        (performance.now() - mountStartMs) / 1000,
        isSoftwareGl
      );
      flyTo(camView.position, target, camView.fov, 'explorer');
    };

    const walkActiveCharacterToHologram = () => {
      enterExplorerArea(activeExplorerAreaIdRef.current, true, explorerPerspectiveRef.current);
    };

    const nudgeExplorerControl = (dir: 'forward' | 'backward' | 'left' | 'right') => {
      if (viewModeRef.current !== 'explorer') return;
      const areaId = activeExplorerAreaIdRef.current;
      const prevChar = characterStates.get(areaId);
      if (!prevChar) return;
      autoWalkTarget = null;
      setIsAutoWalking(false);
      const fakeInput = {
        forward: dir === 'forward',
        backward: dir === 'backward',
        left: dir === 'left',
        right: dir === 'right',
        sprint: false,
      };
      // Step a crisp single tap (0.2s turn ~26deg or ~1.5m step) and update camera automatically
      const { next } = stepCharacterMovement(prevChar, fakeInput, 0.2, null);
      characterStates.set(areaId, next);
      handles.updateExplorerCharacter(
        areaId,
        next.x,
        next.z,
        next.facingYawRad,
        next.walkCyclePhase,
        false
      );
      syncNearbyHologram(next);
      const camView = computeExplorerCamera(next, explorerPerspectiveRef.current, 0, 6.9);
      handles.updateHologramState(
        openHologramId,
        { x: camView.position.x, z: camView.position.z },
        (performance.now() - mountStartMs) / 1000,
        isSoftwareGl
      );
      flyTo(camView.position, camView.target, camView.fov, 'explorer');
    };

    const lookInDirection = (yawDeg: number, pitchDeg = 3) => {
      applyControlsPerspective('eye-level');
      const eyeNow = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      const nextTarget = getStandingLookTarget(eyeNow, yawDeg, pitchDeg);
      goalPos.set(eyeNow.x, eyeNow.y, eyeNow.z);
      goalTarget.set(nextTarget.x, nextTarget.y, nextTarget.z);
      goalFov = 70;
      if (isSoftwareGl) {
        transitionActive = false;
        controls.target.copy(goalTarget);
        camera.fov = goalFov;
        camera.updateProjectionMatrix();
        controls.update();
        renderer.render(scene, camera);
        return;
      }
      transitionActive = true;
      lastTimestamp = performance.now();
      requestRender();
    };

    const setAutoOrbitActive = (enabled: boolean) => {
      isAutoOrbit = enabled && !isSoftwareGl;
      if (isAutoOrbit) {
        transitionActive = false;
        requestRender();
      }
    };

    sceneApiRef.current = {
      renderer,
      scene,
      camera,
      controls,
      handles,
      isSoftwareGl,
      requestRender,
      applyControlsPerspective,
      flyTo,
      lookInDirection,
      setAutoOrbitActive,
      enterExplorerArea,
      setExplorerCameraPerspective,
      walkActiveCharacterToHologram,
      nudgeExplorerControl,
    };

    // Cancel scripted camera glide & tour immediately when user interacts manually
    const onControlStart = () => {
      transitionActive = false;
      setTourPlaying(false);
    };
    const onControlChange = () => {
      if (viewModeRef.current === 'eye-level') {
        const yaw = Math.round(computeCompassYawDeg(camera.position, controls.target));
        setStandingYawDeg(yaw);
      }
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    // Raycast click-to-select playable character, hologram info beacon, or track zone
    const raycaster = new THREE.Raycaster();
    let pointerDownX = 0;
    let pointerDownY = 0;

    const onPointerDown = (ev: PointerEvent) => {
      pointerDownX = ev.clientX;
      pointerDownY = ev.clientY;
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - pointerDownX, ev.clientY - pointerDownY) > 6) {
        return; // Ignore orbit drag
      }
      const rect = renderer.domElement.getBoundingClientRect();
      _rayMouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      _rayMouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_rayMouse, camera);
      const hits = raycaster.intersectObjects(handles.interactables, false);
      if (hits.length > 0) {
        // Priority 1: Clicked an interactive Hologram Info Point -> enter area & walk straight to Hologram!
        const holoHit = hits.find((h) => Boolean(h.object.userData.hologramAreaId));
        if (holoHit) {
          const hitAreaId = holoHit.object.userData.hologramAreaId as ExplorerAreaId;
          setViewMode('explorer');
          viewModeRef.current = 'explorer';
          setActiveExplorerAreaId(hitAreaId);
          activeExplorerAreaIdRef.current = hitAreaId;
          setDockTab('explorer');
          enterExplorerArea(hitAreaId, true);
          return;
        }

        // Priority 2: Clicked a Playable Explorer Character -> take control of that area's character!
        const explorerHit = hits.find((h) => Boolean(h.object.userData.explorerAreaId));
        if (explorerHit) {
          const hitAreaId = explorerHit.object.userData.explorerAreaId as ExplorerAreaId;
          setViewMode('explorer');
          viewModeRef.current = 'explorer';
          setActiveExplorerAreaId(hitAreaId);
          activeExplorerAreaIdRef.current = hitAreaId;
          setDockTab('explorer');
          enterExplorerArea(hitAreaId, false);
          return;
        }

        // Priority 3: Clicked a Track Zone or Overhead Gantry
        const hitTrackId = hits[0].object.userData.trackId as string | undefined;
        if (hitTrackId) {
          setFocusedTrackId(hitTrackId);
          setDockTab('tracks');
          handles.setSelectedTrack(hitTrackId);
          onSelectTrackRef.current(hitTrackId);
          const found = tracksRef.current.find((t) => t.id === hitTrackId);
          if (found) {
            if (viewModeRef.current === 'eye-level') {
              const eye = getTrackEyeLevelView(found);
              setStandingYawDeg(eye.yawDeg);
              setStandingSpotLabel(eye.standingLabel);
              flyTo(eye.position, eye.target, eye.fov, 'eye-level');
            } else {
              setViewMode('aerial');
              viewModeRef.current = 'aerial';
              setStandingSpotLabel(null);
              const view = getTrackCameraView(found);
              flyTo(view.position, view.target, view.fov, 'aerial');
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Keyboard shortcuts (WASD steer/walk, C swap TPP/FPP, G Explore, V Eye, 1-9/0 cameras, H HUD, Esc close brief, R reset)
    const onKeyDown = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (ev.code === 'Escape') {
        setShowScreenBrief(false);
        return;
      }
      if (ev.code === 'KeyH') {
        setHudCollapsed((prev) => !prev);
        return;
      }
      if (ev.code === 'KeyC' && viewModeRef.current === 'explorer') {
        const nextPersp: ExplorerCameraPerspective =
          explorerPerspectiveRef.current === 'tpp' ? 'fpp' : 'tpp';
        setExplorerPerspective(nextPersp);
        explorerPerspectiveRef.current = nextPersp;
        setExplorerCameraPerspective(nextPersp);
        return;
      }
      if (ev.code === 'KeyG') {
        setTourPlaying(false);
        setAutoOrbit(false);
        setViewMode('explorer');
        viewModeRef.current = 'explorer';
        setDockTab('explorer');
        enterExplorerArea(activeExplorerAreaIdRef.current, false, explorerPerspectiveRef.current);
        return;
      }
      if (ev.code === 'KeyV') {
        const nextMode: ExtendedViewMode =
          viewModeRef.current === 'eye-level' ? 'aerial' : 'eye-level';
        setViewMode(nextMode);
        viewModeRef.current = nextMode;
        setTourPlaying(false);
        setActiveHologramArea(null);
        setShowScreenBrief(false);
        openHologramId = null;
        handles.setExplorerVisibility(null, false);
        if (nextMode === 'eye-level') {
          const eye = getEyeLevelViewForPreset(activePresetIdRef.current);
          setStandingYawDeg(eye.yawDeg);
          setStandingSpotLabel(eye.standingLabel);
          flyTo(eye.position, eye.target, eye.fov, 'eye-level');
        } else {
          setStandingSpotLabel(null);
          const preset =
            CAMERA_PRESETS.find((p) => p.id === activePresetIdRef.current) ?? CAMERA_PRESETS[0];
          flyTo(preset.position, preset.target, preset.fov, 'aerial');
        }
        return;
      }
      if (ev.code === 'KeyR') {
        const master = CAMERA_PRESETS[0];
        setActivePresetId('master-aerial');
        setFocusedTrackId(null);
        setActiveHologramArea(null);
        setShowScreenBrief(false);
        openHologramId = null;
        handles.setExplorerVisibility(null, false);
        handles.setSelectedTrack(null);
        if (viewModeRef.current === 'eye-level') {
          const eye = getEyeLevelViewForPreset('master-aerial');
          setStandingYawDeg(eye.yawDeg);
          setStandingSpotLabel(eye.standingLabel);
          flyTo(eye.position, eye.target, eye.fov, 'eye-level');
        } else {
          setViewMode('aerial');
          viewModeRef.current = 'aerial';
          setStandingSpotLabel(null);
          flyTo(master.position, master.target, master.fov, 'aerial');
        }
        return;
      }
      if ((ev.key >= '1' && ev.key <= '9') || ev.key === '0') {
        const idx = ev.key === '0' ? 9 : Number(ev.key) - 1;
        const preset = CAMERA_PRESETS[idx];
        if (preset) {
          setTourPlaying(false);
          setActivePresetId(preset.id);
          setFocusedTrackId(null);
          setActiveHologramArea(null);
          openHologramId = null;
          handles.setSelectedTrack(null);
          if (viewModeRef.current === 'eye-level') {
            const eye = getEyeLevelViewForPreset(preset.id);
            setStandingYawDeg(eye.yawDeg);
            setStandingSpotLabel(eye.standingLabel);
            flyTo(eye.position, eye.target, eye.fov, 'eye-level');
          } else {
            setViewMode('aerial');
            viewModeRef.current = 'aerial';
            setStandingSpotLabel(null);
            flyTo(preset.position, preset.target, preset.fov, 'aerial');
          }
        }
        return;
      }

      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'KeyQ',
          'KeyE',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'ShiftLeft',
          'ShiftRight',
        ].includes(ev.code)
      ) {
        keysHeld.add(ev.code);
        requestRender();
      }
    };

    const onKeyUp = (ev: KeyboardEvent) => {
      keysHeld.delete(ev.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ResizeObserver keeps 3D viewport crisp on every desktop/mobile layout shift
    const resizeObserver = new ResizeObserver(() => {
      if (disposed || !container) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (isSoftwareGl) {
        renderer.render(scene, camera);
      } else {
        requestRender();
      }
    });
    resizeObserver.observe(container);

    // WebGL context loss / restoration safety
    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setWebglError('3D WebGL context was interrupted. Reloading graphics surface...');
    };
    const onContextRestored = () => {
      setWebglError(null);
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // Paint initial frame immediately so first render is never blank on mount
    renderer.render(scene, camera);
    container.setAttribute('data-scene-ready', 'true');

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      handles.dispose();
      textures.dispose();
      envTarget.dispose();
      renderer.dispose();
      sceneApiRef.current = null;
    };
  }, [summary.totalShowUp]);

  const handleCapturePng = () => {
    const api = sceneApiRef.current;
    if (!api) return;
    // Render synchronously immediately prior to reading drawing buffer
    api.renderer.render(api.scene, api.camera);
    const dataUrl = api.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    const tag = focusedTrackId ? `Track_${focusedTrackId}` : activePresetId;
    const filename = `CU_Zero_to_One_3D_${tag}_${lightingMood}.png`;
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSnapshotNotice(`Saved ${filename}`);
    window.setTimeout(() => setSnapshotNotice(null), 3500);
  };

  const handleCopy3DLink = async () => {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(cleanUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cleanUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopiedLink(true);
    setSnapshotNotice('Copied 3D Reality Tour link — ready to share');
    window.setTimeout(() => {
      setCopiedLink(false);
      setSnapshotNotice(null);
    }, 3200);
  };

  const activePreset =
    CAMERA_PRESETS.find((p) => p.id === activePresetId) ?? CAMERA_PRESETS[0];
  const focusedTrack = focusedTrackId
    ? tracks.find((t) => t.id === focusedTrackId) ?? null
    : null;
  const focusedTrackMetrics = focusedTrack ? calculateTrackMetrics(focusedTrack) : null;
  const activeExplorerArea =
    explorerAreas.find((a) => a.id === activeExplorerAreaId) ?? explorerAreas[0];

  const setWalkPad = (dir: 'forward' | 'backward' | 'left' | 'right', pressed: boolean) => {
    if (pressed) {
      padDownTimeRef.current = performance.now();
      padInputRef.current[dir] = true;
      sceneApiRef.current?.requestRender();
    } else {
      const wasPressed = padInputRef.current[dir];
      padInputRef.current[dir] = false;
      if (wasPressed && performance.now() - padDownTimeRef.current < 180) {
        sceneApiRef.current?.nudgeExplorerControl(dir);
      }
    }
  };

  const screenBriefArea = activeHologramArea ?? activeExplorerArea;

  return (
    <section
      aria-label="Interactive 3D Bus Parking Hackathon Arena"
      data-testid="arena-3d-viewport"
      data-standalone={standalone ? 'true' : 'false'}
      data-view-mode={viewMode}
      data-explorer-perspective={explorerPerspective}
      data-standing-yaw={Math.round(standingYawDeg)}
      data-camera-preset={activePresetId}
      data-lighting-mood={lightingMood}
      data-roof-mode={roofMode}
      data-overlay-mode={overlayMode}
      data-selected-track={focusedTrackId ?? 'all'}
      data-explorer-area={activeExplorerAreaId}
      data-active-hologram={activeHologramArea?.id ?? 'none'}
      data-screen-brief-open={showScreenBrief ? 'true' : 'false'}
      className={`relative w-full ${
        standalone ? 'h-screen' : 'h-[calc(100vh-4rem)]'
      } min-h-[600px] overflow-hidden bg-[#060D1A] select-none`}
    >
      {/* Dedicated Isolated WebGL Canvas Mount */}
      <div
        ref={canvasMountRef}
        data-testid="arena-3d-canvas-host"
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Graceful Fallback if WebGL is unavailable */}
      {webglError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B1219] p-6">
          <div className="max-w-md border border-white/15 bg-[#111B26] rounded-lg p-6 text-white text-center">
            <p className="font-serif text-xl font-semibold">3D Reality Viewport Paused</p>
            <p className="mt-2 text-sm text-slate-300">{webglError}</p>
            <button
              type="button"
              onClick={onJumpToBlueprint}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-[#0F766E] hover:bg-[#115E59] text-white rounded-md cursor-pointer"
            >
              Open 2D CAD Blueprint
            </button>
          </div>
        </div>
      )}

      {/* Compact Top Bar — Minimal Footprint to Maximize 3D Viewport */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-3">
        <div className="pointer-events-auto bg-[#0B1219]/90 border border-white/15 rounded-md px-3 py-1.5 text-white max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5EEAD4]">
            <span>
              {viewMode === 'explorer'
                ? `EXPLORE · ${explorerPerspective.toUpperCase()}`
                : viewMode === 'eye-level'
                  ? `EYE 1.7m · ${Math.round(standingYawDeg)}°`
                  : 'ZERO TO ONE · 3D ARENA'}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300 truncate">
              {viewMode === 'explorer'
                ? activeExplorerArea.shortName
                : `${summary.totalShowUp.toLocaleString()} Builders`}
            </span>
          </div>
          <h1 className="font-serif text-sm font-semibold leading-tight text-white truncate">
            {viewMode === 'explorer'
              ? activeExplorerArea.title
              : viewMode === 'eye-level' && standingSpotLabel
                ? standingSpotLabel
                : focusedTrack
                  ? `T${focusedTrack.trackNumber} ${focusedTrack.trackShortName}`
                  : activePreset.shortLabel}
          </h1>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
          {/* Compact Aerial / Eye 1.7m / Explore Switch */}
          <div
            role="group"
            aria-label="Camera and play perspective"
            className="inline-flex items-center bg-[#0B1219]/90 p-0.5 rounded-md border border-white/15"
          >
            <button
              type="button"
              aria-pressed={viewMode === 'aerial'}
              onClick={() => triggerSwitchViewMode('aerial')}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'aerial'
                  ? 'bg-white text-[#0F172A]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Aerial
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'eye-level'}
              onClick={() => triggerSwitchViewMode('eye-level')}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'eye-level'
                  ? 'bg-[#0F766E] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserRound className="w-3 h-3" />
              Eye 1.7m
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'explorer'}
              onClick={() => triggerSwitchViewMode('explorer')}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'explorer'
                  ? 'bg-[#0EA5E9] text-[#04121F]'
                  : 'text-[#5EEAD4] hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3 h-3" />
              Explore Game
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy3DLink}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#0B1219]/90 hover:bg-[#162230] border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedLink ? (
              <Check className="w-3 h-3 text-[#5EEAD4]" />
            ) : (
              <Link2 className="w-3 h-3 text-[#5EEAD4]" />
            )}
            {copiedLink ? 'Copied' : 'Share'}
          </button>

          {!standalone && onOpenStandalone && (
            <button
              type="button"
              onClick={onOpenStandalone}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#0B1219]/90 hover:bg-[#162230] border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-[#5EEAD4]" />
              Full 3D
            </button>
          )}

          <button
            type="button"
            onClick={() => triggerFlyToPreset('master-aerial')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#0B1219]/90 hover:bg-[#162230] border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#5EEAD4]" />
            Reset
          </button>

          {standalone && onOpenProposalDocs ? (
            <button
              type="button"
              onClick={onOpenProposalDocs}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] border border-[#14B8A6]/40 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              4 Docs
            </button>
          ) : (
            <button
              type="button"
              onClick={onJumpToBlueprint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] border border-[#14B8A6]/40 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MapIcon className="w-3 h-3" />
              2D CAD
            </button>
          )}
        </div>
      </div>

      {/* OPT-IN On-Screen Hologram Brief (NEVER auto-pops — opens ONLY when user clicks Screen Brief!) */}
      {showScreenBrief && screenBriefArea && (
        <aside
          aria-label="Hologram Zone Briefing"
          data-testid="hologram-info-panel"
          className="absolute top-14 right-3 z-20 w-[min(320px,calc(100vw-1.5rem))] max-h-[calc(100vh-13rem)] overflow-y-auto bg-[#061824]/95 border border-[#2DD4BF]/50 rounded-lg text-white shadow-2xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-2 bg-[#082233] border-b border-[#2DD4BF]/35">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#5EEAD4] uppercase">
                <Radio className="w-3 h-3 shrink-0" />
                <span className="truncate">{screenBriefArea.shortName}</span>
              </div>
              <h2 className="font-serif text-sm font-semibold leading-tight text-white truncate">
                {screenBriefArea.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowScreenBrief(false)}
              aria-label="Close Screen Brief"
              className="p-1 rounded bg-[#0E2F44] hover:bg-[#16425E] text-[#99F6E4] border border-[#2DD4BF]/35 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-2.5 text-[11px]">
            <div className="p-2.5 rounded bg-[#0A2233] border border-[#2DD4BF]/25">
              <div className="flex items-center gap-1 font-mono text-[10px] text-[#5EEAD4] uppercase">
                <Layers className="w-3 h-3" /> Tracks
              </div>
              <p className="mt-1 font-semibold text-white">{screenBriefArea.trackSummary.trackLabel}</p>
              <p className="font-mono text-[10px] text-[#CCFBF1] mt-0.5">
                {screenBriefArea.trackSummary.buildersCount} · {screenBriefArea.trackSummary.registrationsCount}
              </p>
              <p className="font-mono text-[10px] text-slate-300 mt-0.5">
                {screenBriefArea.trackSummary.teamsCount}
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#0A2233] border border-[#2DD4BF]/25">
              <div className="flex items-center gap-1 font-mono text-[10px] text-[#5EEAD4] uppercase">
                <Users className="w-3 h-3" /> Mentors &amp; Jury
              </div>
              <p className="mt-1 font-semibold text-white">{screenBriefArea.mentorSummary.mentorsCount}</p>
              <p className="text-[#99F6E4] mt-0.5">{screenBriefArea.mentorSummary.judgesCount}</p>
              <p className="text-slate-300 mt-0.5">{screenBriefArea.mentorSummary.helpdeskLocation}</p>
            </div>

            <div className="p-2.5 rounded bg-[#0A2233] border border-[#2DD4BF]/25">
              <div className="flex items-center gap-1 font-mono text-[10px] text-[#5EEAD4] uppercase">
                <Award className="w-3 h-3" /> Sponsors
              </div>
              <p className="mt-1 font-semibold text-[#FDE68A]">{screenBriefArea.sponsorSummary.poolLakhs}</p>
              <p className="font-mono text-[10px] text-[#99F6E4] mt-0.5">
                {screenBriefArea.sponsorSummary.boothIds}
              </p>
              <p className="mt-1 text-slate-200 leading-snug">
                {screenBriefArea.sponsorSummary.builderPerks}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Transient PNG Capture Confirmation */}
      {snapshotNotice && (
        <div
          role="status"
          className="absolute top-14 right-3 z-30 bg-[#0F766E] text-white text-[11px] font-mono px-3 py-1.5 rounded-md border border-[#5EEAD4]/40"
        >
          {snapshotNotice}
        </div>
      )}

      {/* COMPACT COLLAPSIBLE BOTTOM CONTROL DOCK */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-10 w-[min(780px,94vw)] transition-transform duration-300 ${
          hudCollapsed ? 'bottom-0 translate-y-[calc(100%-28px)]' : 'bottom-2.5 translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setHudCollapsed((prev) => !prev)}
            aria-expanded={!hudCollapsed}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-200 bg-[#0B1219]/92 hover:text-white border border-b-0 border-white/15 rounded-t-md cursor-pointer"
          >
            {hudCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#5EEAD4]" />
                Controls (H)
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-[#5EEAD4]" />
                Hide (H)
              </>
            )}
          </button>
        </div>

        <div className="bg-[#0B1219]/92 border border-white/15 rounded-lg p-2 text-white shadow-2xl">
          {/* Compact Top Row: Tabs + Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-white/10">
            <div
              role="tablist"
              aria-label="3D control categories"
              className="inline-flex items-center gap-0.5 bg-[#141F2B] p-0.5 rounded border border-white/10"
            >
              <button
                type="button"
                role="tab"
                aria-selected={dockTab === 'cameras'}
                onClick={() => setDockTab('cameras')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dockTab === 'cameras'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Camera className="w-3 h-3" />
                Angles ({CAMERA_PRESETS.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={dockTab === 'explorer'}
                onClick={() => {
                  setDockTab('explorer');
                  if (viewMode !== 'explorer') {
                    triggerEnterExplorerArea(activeExplorerAreaId, false);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dockTab === 'explorer'
                    ? 'bg-[#0EA5E9] text-[#04121F]'
                    : 'text-[#5EEAD4] hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                Explore (8)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={dockTab === 'tracks'}
                onClick={() => setDockTab('tracks')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dockTab === 'tracks'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                Tracks (6)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={dockTab === 'environment'}
                onClick={() => setDockTab('environment')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dockTab === 'environment'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                Light &amp; Roof
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-pressed={tourPlaying}
                onClick={() => {
                  setAutoOrbit(false);
                  setTourPlaying((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tourPlaying
                    ? 'bg-[#0F766E] text-white border-[#14B8A6]'
                    : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-white/30'
                }`}
              >
                {tourPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#5EEAD4]" />}
                {tourPlaying ? 'Stop' : 'Tour'}
              </button>
              <button
                type="button"
                aria-pressed={autoOrbit}
                onClick={() => {
                  setTourPlaying(false);
                  setAutoOrbit((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  autoOrbit
                    ? 'bg-[#1D4ED8] text-white border-[#3B82F6]'
                    : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-white/30'
                }`}
              >
                <Compass className="w-3 h-3" />
                {viewMode === 'eye-level' ? '360°' : 'Orbit'}
              </button>
              <button
                type="button"
                onClick={handleCapturePng}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded bg-[#141F2B] hover:bg-[#1E2E3F] text-white border border-white/12 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#5EEAD4]" />
                PNG
              </button>
            </div>
          </div>

          {/* 360° Standing Look-Around Compass Bar (visible in Eye View 1.7m) */}
          {viewMode === 'eye-level' && (
            <div className="py-1.5 border-b border-white/10 flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-mono text-[#5EEAD4] mr-1">360°:</span>
              {STANDING_DIRECTIONS.map((dir) => {
                const angleDiff = Math.min(
                  Math.abs(standingYawDeg - dir.yawDeg),
                  360 - Math.abs(standingYawDeg - dir.yawDeg)
                );
                const isFacing = angleDiff <= 22.5;
                return (
                  <button
                    key={dir.id}
                    type="button"
                    aria-pressed={isFacing}
                    onClick={() => triggerLookDirection(dir.yawDeg)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isFacing
                        ? 'bg-[#0F766E] text-white border-[#14B8A6]'
                        : 'bg-[#141F2B] text-slate-300 border-white/12 hover:border-[#5EEAD4]/60 hover:text-white'
                    }`}
                  >
                    {dir.id}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => triggerLookDirection(standingYawDeg + 45)}
                className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#1E293B] hover:bg-[#2B3B52] text-[#5EEAD4] border border-white/15 whitespace-nowrap shrink-0 cursor-pointer"
              >
                +45°
              </button>
            </div>
          )}

          {/* Tab Panel 1: 12 Camera Angles */}
          {dockTab === 'cameras' && (
            <div className="pt-1.5 flex flex-wrap items-center gap-1">
              {CAMERA_PRESETS.map((preset, idx) => {
                const isActive = !focusedTrackId && activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => triggerFlyToPreset(preset.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-white text-[#0F172A] border-white'
                        : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-[#5EEAD4]/60 hover:text-white'
                    }`}
                  >
                    <span
                      className={`font-mono text-[9px] ${
                        isActive ? 'text-[#0F766E]' : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{preset.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab Panel 1B: Explore Game — 8 Areas + TPP/FPP + Auto-Turning Walk Controls + Opt-In Screen Brief */}
          {dockTab === 'explorer' && (
            <div className="pt-1.5 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1">
                {explorerAreas.map((area) => {
                  const isActive =
                    viewMode === 'explorer' && activeExplorerAreaId === area.id;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => triggerEnterExplorerArea(area.id, false)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                        isActive
                          ? 'bg-white text-[#0F172A] border-white'
                          : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-[#5EEAD4]/60 hover:text-white'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="w-2 h-2 rounded-[2px] shrink-0"
                        style={{ backgroundColor: area.accentHex }}
                      />
                      <span>{area.shortName}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* TPP / FPP Perspective Switch */}
                  <div
                    role="group"
                    aria-label="Explorer camera perspective"
                    className="inline-flex items-center bg-[#141F2B] p-0.5 rounded border border-white/15"
                  >
                    <button
                      type="button"
                      aria-pressed={explorerPerspective === 'tpp'}
                      onClick={() => triggerSetExplorerPerspective('tpp')}
                      className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                        explorerPerspective === 'tpp'
                          ? 'bg-[#0EA5E9] text-[#04121F]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      TPP
                    </button>
                    <button
                      type="button"
                      aria-pressed={explorerPerspective === 'fpp'}
                      onClick={() => triggerSetExplorerPerspective('fpp')}
                      className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                        explorerPerspective === 'fpp'
                          ? 'bg-[#0EA5E9] text-[#04121F]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      FPP
                    </button>
                  </div>

                  {/* Walk to 3D Hologram */}
                  <button
                    type="button"
                    onClick={triggerWalkToHologram}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-[#0F766E] hover:bg-[#115E59] text-white border border-[#2DD4BF]/55 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#5EEAD4]" />
                    {isAutoWalking
                      ? 'Walking...'
                      : activeHologramArea?.id === activeExplorerAreaId
                        ? '3D Hologram On'
                        : 'Walk to Hologram'}
                  </button>

                  {/* Opt-In On-Screen Brief Toggle (User asks for on-screen panel) */}
                  <button
                    type="button"
                    aria-pressed={showScreenBrief}
                    onClick={() => setShowScreenBrief((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      showScreenBrief
                        ? 'bg-[#083344] text-[#5EEAD4] border-[#2DD4BF]/70'
                        : 'bg-[#141F2B] text-slate-200 border-white/15 hover:border-[#2DD4BF]/60'
                    }`}
                  >
                    <Radio className="w-3 h-3 text-[#5EEAD4]" />
                    {showScreenBrief ? 'Hide Brief' : 'Screen Brief'}
                  </button>

                  {/* Steering & Walk Buttons (A/D turns both character AND camera automatically) */}
                  <div
                    role="group"
                    aria-label="Walk and turn controls"
                    className="inline-flex items-center gap-0.5 bg-[#141F2B] px-1 py-0.5 rounded border border-white/12"
                  >
                    <button
                      type="button"
                      aria-label="Walk Forward"
                      onPointerDown={() => setWalkPad('forward', true)}
                      onPointerUp={() => setWalkPad('forward', false)}
                      onPointerLeave={() => setWalkPad('forward', false)}
                      className="px-1.5 py-0.5 rounded bg-[#1E2E3F] hover:bg-[#0F766E] text-white text-[10px] font-mono inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />W
                    </button>
                    <button
                      type="button"
                      aria-label="Turn Left"
                      onPointerDown={() => setWalkPad('left', true)}
                      onPointerUp={() => setWalkPad('left', false)}
                      onPointerLeave={() => setWalkPad('left', false)}
                      className="px-1.5 py-0.5 rounded bg-[#1E2E3F] hover:bg-[#0F766E] text-white text-[10px] font-mono inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-2.5 h-2.5" />A
                    </button>
                    <button
                      type="button"
                      aria-label="Walk Back"
                      onPointerDown={() => setWalkPad('backward', true)}
                      onPointerUp={() => setWalkPad('backward', false)}
                      onPointerLeave={() => setWalkPad('backward', false)}
                      className="px-1.5 py-0.5 rounded bg-[#1E2E3F] hover:bg-[#0F766E] text-white text-[10px] font-mono inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />S
                    </button>
                    <button
                      type="button"
                      aria-label="Turn Right"
                      onPointerDown={() => setWalkPad('right', true)}
                      onPointerUp={() => setWalkPad('right', false)}
                      onPointerLeave={() => setWalkPad('right', false)}
                      className="px-1.5 py-0.5 rounded bg-[#1E2E3F] hover:bg-[#0F766E] text-white text-[10px] font-mono inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <ArrowRight className="w-2.5 h-2.5" />D
                    </button>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  W/S Walk · A/D Turn · C TPP/FPP
                </span>
              </div>
            </div>
          )}

          {/* Tab Panel 2: 6 Department Tracks */}
          {dockTab === 'tracks' && (
            <div className="pt-1.5 flex flex-wrap items-center gap-1">
              <button
                type="button"
                aria-pressed={focusedTrackId === null}
                onClick={() => triggerFocusTrack(null)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  focusedTrackId === null
                    ? 'bg-white text-[#0F172A] border-white'
                    : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-white/30'
                }`}
              >
                All 6
              </button>
              {tracks.map((track) => {
                const isSelected = focusedTrackId === track.id;
                const shortDept =
                  track.id === 'robotics-mechatronics'
                    ? 'Robotics'
                    : track.id === 'tbi-builder'
                      ? 'TBI'
                      : track.departmentShort;
                return (
                  <button
                    key={track.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => triggerFocusTrack(track.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white text-[#0F172A] border-white'
                        : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-[#5EEAD4]/60'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-[2px] shrink-0"
                      style={{ backgroundColor: track.zoneStroke }}
                    />
                    <span className="font-mono text-[9px] opacity-75">T{track.trackNumber}</span>
                    <span>{shortDept}</span>
                    <span className="font-mono text-[9px] opacity-75 tabular-nums">
                      {track.showUpTarget.toLocaleString()}
                    </span>
                  </button>
                );
              })}
              {focusedTrack && focusedTrackMetrics && (
                <span className="ml-auto font-mono text-[10px] text-[#5EEAD4] tabular-nums">
                  {focusedTrackMetrics.showUpTarget.toLocaleString()}p · {focusedTrackMetrics.mentorsRequired}M / {focusedTrackMetrics.judgesRequired}J
                </span>
              )}
            </div>
          )}

          {/* Tab Panel 3: Lighting, Roof & Overlay */}
          {dockTab === 'environment' && (
            <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400">Time:</span>
                {(['night-keynote', 'golden-hour', 'daylight'] as LightingMoodId[]).map((moodId) => (
                  <button
                    key={moodId}
                    type="button"
                    aria-pressed={lightingMood === moodId}
                    onClick={() => setLightingMood(moodId)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      lightingMood === moodId
                        ? 'bg-white text-[#0F172A] border-white'
                        : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-white/35'
                    }`}
                  >
                    {LIGHTING_MOODS[moodId].label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400">Roof:</span>
                {(
                  [
                    { id: 'translucent', label: 'Hangar' },
                    { id: 'truss-only', label: 'Truss' },
                    { id: 'open-cutaway', label: 'Open' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={roofMode === opt.id}
                    onClick={() => setRoofMode(opt.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      roofMode === opt.id
                        ? 'bg-white text-[#0F172A] border-white'
                        : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-white/35'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 inline-flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" />
                </span>
                {(
                  [
                    { id: 'tracks', label: 'Zones' },
                    { id: 'sightlines', label: '45° Lines' },
                    { id: 'clean', label: 'Clean' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={overlayMode === opt.id}
                    onClick={() => setOverlayMode(opt.id)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      overlayMode === opt.id
                        ? 'bg-white text-[#0F172A] border-white'
                        : 'bg-[#141F2B] text-slate-200 border-white/12 hover:border-white/35'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
