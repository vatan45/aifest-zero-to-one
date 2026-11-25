import * as THREE from 'three';
import { TrackDepartment } from '../utils/hackathonModel';
import {
  ARENA_OUTER_POLYGON_CAD,
  FT_TO_M,
  LIGHTING_MOODS,
  LightingMoodId,
  OverlayModeId,
  RoofModeId,
  STAGE_POLYGON_CAD,
  cadSizeToWorld,
  cadToWorld,
  generateArenaRoleFigures,
  generateWorldPods,
} from './arenaLayoutMath';
import { ProceduralTexturePack, createSkyGradientTexture } from './proceduralTextures';
import {
  ExplorerAreaConfig,
  ExplorerAreaId,
  buildExplorerAreas,
} from './explorerAreas';

export interface ArenaSceneHandles {
  root: THREE.Group;
  interactables: THREE.Object3D[];
  explorerAreas: ExplorerAreaConfig[];
  applyLightingMood: (moodId: LightingMoodId) => void;
  applyRoofMode: (roofMode: RoofModeId) => void;
  applyOverlayMode: (overlayMode: OverlayModeId) => void;
  setSelectedTrack: (trackId: string | null) => void;
  updateExplorerCharacter: (
    areaId: ExplorerAreaId,
    x: number,
    z: number,
    facingYawRad: number,
    walkCyclePhase: number,
    isMoving: boolean
  ) => void;
  setActiveExplorerArea: (areaId: ExplorerAreaId | null) => void;
  setExplorerVisibility: (areaId: ExplorerAreaId | null, hiddenInFpp: boolean) => void;
  updateHologramState: (
    activeHologramId: ExplorerAreaId | null,
    lookAtPos: { x: number; z: number },
    elapsedSec: number,
    instant?: boolean
  ) => void;
  dispose: () => void;
}

/**
 * Helper: creates an extruded vertical slab from 2D CAD feet coordinates (x, y)
 * mapped onto Three.js XZ plane with bottom sitting at y = 0.
 */
function createCadPolygonExtrude(
  pointsCad: Array<[number, number]>,
  heightMeters: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  pointsCad.forEach(([cx, cy], idx) => {
    const w = cadToWorld(cx, cy, 0);
    // Shape is defined in XY and then rotated -PI/2 around X -> (x, y) becomes (x, 0, -y)
    if (idx === 0) shape.moveTo(w.x, -w.z);
    else shape.lineTo(w.x, -w.z);
  });
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: heightMeters,
    bevelEnabled: false,
    curveSegments: 4,
  });
  geom.rotateX(-Math.PI / 2);
  return geom;
}

/**
 * Builds the complete, photorealistic, composite 3D Bus Parking Hackathon Arena
 * for Chandigarh University's 6,200+ participant Zero to One AI Fest Flagship.
 */
export function buildArenaScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  tracks: TrackDepartment[],
  textures: ProceduralTexturePack,
  isSoftwareGl: boolean
): ArenaSceneHandles {
  const root = new THREE.Group();
  root.name = 'ZeroToOneArenaRoot';
  scene.add(root);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const extraTextures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const interactables: THREE.Object3D[] = [];

  // ---------------------------------------------------------------------------
  // 1. SKY DOME & THREE-POINT ARCHITECTURAL LIGHTING RIG
  // ---------------------------------------------------------------------------
  const skyMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.skyGradient,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    })
  );
  const skyDome = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(480, 24, 16)), skyMat);
  skyDome.name = 'SkyDome';
  scene.add(skyDome);

  const hemiLight = new THREE.HemisphereLight(0x9ec5e8, 0x5c4b3b, 0.95);
  hemiLight.position.set(0, 120, 0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffc88a, 2.35);
  sunLight.position.set(-135, 68, 95);
  sunLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 20;
    sunLight.shadow.camera.far = 420;
    const d = 140;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.04;
  }
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65);
  rimLight.position.set(140, 55, -120);
  scene.add(rimLight);

  // Stage & Arena Accent PointLights (strictly <= 4 unshadowed lights per GPU/budget rules)
  const stageCenterW = cadToWorld(82, 412, 9);
  const stageGlowLight = new THREE.PointLight(0x2dd4bf, 18, 65, 1.4);
  stageGlowLight.position.set(stageCenterW.x + 8, 9.5, stageCenterW.z - 6);
  scene.add(stageGlowLight);

  const northWingLight = new THREE.PointLight(0xffedd5, 10, 75, 1.5);
  const nwMid = cadToWorld(95, 150, 11);
  northWingLight.position.set(nwMid.x, 11, nwMid.z);
  scene.add(northWingLight);

  const centralArenaLight = new THREE.PointLight(0xffe8c8, 12, 85, 1.5);
  const caMid = cadToWorld(325, 430, 11);
  centralArenaLight.position.set(caMid.x, 11, caMid.z);
  scene.add(centralArenaLight);

  const hardwareWingLight = new THREE.PointLight(0xd1fae5, 8, 55, 1.5);
  const hwMid = cadToWorld(520, 510, 9);
  hardwareWingLight.position.set(hwMid.x, 9, hwMid.z);
  scene.add(hardwareWingLight);

  // ---------------------------------------------------------------------------
  // 2. SHARED PBR MATERIAL LIBRARY (Calibrated Roughness / Metalness Contrast)
  // ---------------------------------------------------------------------------
  const matCampusGrass = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.grassColor,
      roughness: 0.94,
      metalness: 0.0,
    })
  );
  const matAsphalt = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.asphaltColor,
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  const matArenaConcrete = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.concreteColor,
      bumpMap: textures.concreteBump,
      bumpScale: 0.03,
      roughness: 0.82,
      metalness: 0.05,
    })
  );
  const matPromenadeStone = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xeaf1ee,
      roughness: 0.72,
      metalness: 0.06,
    })
  );
  const matSteelTruss = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xdbe2ea,
      roughness: 0.34,
      metalness: 0.78,
    })
  );
  const matDarkSteel = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1b2432,
      roughness: 0.42,
      metalness: 0.72,
    })
  );
  const matStageDeck = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x161d29,
      roughness: 0.56,
      metalness: 0.22,
    })
  );
  const matRoofMembrane = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.42,
      metalness: 0.02,
      transparent: true,
      opacity: 0.44,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const matGlassCabin = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    })
  );
  const matWarmInterior = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.38,
      roughness: 0.85,
    })
  );
  const matLedAccentTeal = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x0d9488,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.1,
    })
  );
  const matLedAccentBlue = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x2563eb,
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.1,
    })
  );

  // ---------------------------------------------------------------------------
  // 3. EXTENDED CHANDIGARH UNIVERSITY CAMPUS TERRAIN, ROADS & BUS LANE
  // ---------------------------------------------------------------------------
  const campusTerrain = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(760, 760)),
    matCampusGrass
  );
  campusTerrain.rotation.x = -Math.PI / 2;
  campusTerrain.position.y = -0.05;
  campusTerrain.receiveShadow = true;
  root.add(campusTerrain);

  // West Chandigarh University Bus Parking Lane (matches yellow buses on left of Fig. 1)
  const busRoadPos = cadToWorld(-55, 290, 0.01);
  const busRoad = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(34, 240)), matAsphalt);
  busRoad.rotation.x = -Math.PI / 2;
  busRoad.position.set(busRoadPos.x, 0.01, busRoadPos.z);
  busRoad.receiveShadow = true;
  root.add(busRoad);

  // South Arrival Avenue & Check-In Plaza Apron
  const southRoadPos = cadToWorld(260, 610, 0.01);
  const southRoad = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(260, 42)), matAsphalt);
  southRoad.rotation.x = -Math.PI / 2;
  southRoad.position.set(southRoadPos.x, 0.01, southRoadPos.z);
  southRoad.receiveShadow = true;
  root.add(southRoad);

  // North Entry Access Road (Gate A)
  const northRoadPos = cadToWorld(100, -52, 0.01);
  const northRoad = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(92, 32)), matAsphalt);
  northRoad.rotation.x = -Math.PI / 2;
  northRoad.position.set(northRoadPos.x, 0.01, northRoadPos.z);
  northRoad.receiveShadow = true;
  root.add(northRoad);

  // ---------------------------------------------------------------------------
  // 4. EXACT 1:1 L-SHAPED BUS PARKING ARENA PLINTH & PROMENADES
  // ---------------------------------------------------------------------------
  const arenaPlinth = new THREE.Mesh(
    trackGeo(createCadPolygonExtrude(ARENA_OUTER_POLYGON_CAD, 0.14)),
    matArenaConcrete
  );
  arenaPlinth.receiveShadow = true;
  root.add(arenaPlinth);

  // 28 ft North Central Promenade (CAD x=78..106, y=4..300)
  const northPromPos = cadToWorld(92, 152, 0.17);
  const northPromSize = cadSizeToWorld(28, 296);
  const northPromMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(northPromSize.w, 0.04, northPromSize.d)),
    matPromenadeStone
  );
  northPromMesh.position.set(northPromPos.x, 0.17, northPromPos.z);
  northPromMesh.receiveShadow = true;
  root.add(northPromMesh);

  // 18 ft Main East-West Sponsor Promenade (CAD x=202..448, y=420..436)
  const ewPromPos = cadToWorld(325, 428, 0.17);
  const ewPromSize = cadSizeToWorld(246, 16);
  const ewPromMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(ewPromSize.w, 0.04, ewPromSize.d)),
    matPromenadeStone
  );
  ewPromMesh.position.set(ewPromPos.x, 0.17, ewPromPos.z);
  ewPromMesh.receiveShadow = true;
  root.add(ewPromMesh);

  // ---------------------------------------------------------------------------
  // 5. CHANDIGARH UNIVERSITY ACADEMIC BLOCK A3 — REAL-VENUE ARCHITECTURAL LANDMARKS
  // ---------------------------------------------------------------------------
  const matCuConcreteWhite = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf4f7fa,
      emissive: 0xdce6f2,
      emissiveIntensity: 0.22,
      roughness: 0.72,
      metalness: 0.05,
    })
  );
  const matCuA3Front = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuA3MainFacade,
      emissive: 0xffffff,
      emissiveMap: textures.cuA3MainFacade,
      emissiveIntensity: 0.42,
      roughness: 0.58,
      metalness: 0.14,
    })
  );
  const matCuA3Side = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuA3SideFacade,
      emissive: 0xffffff,
      emissiveMap: textures.cuA3SideFacade,
      emissiveIntensity: 0.42,
      roughness: 0.58,
      metalness: 0.14,
    })
  );
  const matCuA3Overhang = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuA3OverhangBand,
      emissive: 0xffffff,
      emissiveMap: textures.cuA3OverhangBand,
      emissiveIntensity: 0.42,
      roughness: 0.58,
      metalness: 0.14,
    })
  );
  const matBuildingWall = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.buildingFacade,
      emissive: 0xffffff,
      emissiveMap: textures.buildingFacade,
      emissiveIntensity: 0.34,
      roughness: 0.62,
      metalness: 0.14,
    })
  );
  const matRoofConcrete = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0xcbd5e1,
      emissiveIntensity: 0.12,
      roughness: 0.86,
      metalness: 0.04,
    })
  );
  const matCuRoofSign = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuUniversityRooftopSign,
      emissive: 0xffffff,
      emissiveMap: textures.cuUniversityRooftopSign,
      emissiveIntensity: 1.25,
      roughness: 0.25,
      metalness: 0.18,
    })
  );
  const matCuA3Plaque = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuAcademicBlockA3Sign,
      emissive: 0xffffff,
      emissiveMap: textures.cuAcademicBlockA3Sign,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.1,
    })
  );
  const matCuMural = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuEntranceMural,
      emissive: 0xffffff,
      emissiveMap: textures.cuEntranceMural,
      emissiveIntensity: 0.38,
      roughness: 0.55,
      metalness: 0.05,
    })
  );
  const matCuCafeRed = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.28,
      roughness: 0.65,
      metalness: 0.08,
    })
  );
  const matCuCafeSign = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.cuCafeSign,
      emissive: 0xffffff,
      emissiveMap: textures.cuCafeSign,
      emissiveIntensity: 0.85,
      roughness: 0.3,
      metalness: 0.1,
    })
  );
  const matCuTankBlack = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x182028, roughness: 0.44, metalness: 0.16 })
  );
  const matCuGreenUnit = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1ca058,
      emissive: 0x15803d,
      emissiveIntensity: 0.18,
      roughness: 0.54,
      metalness: 0.18,
    })
  );
  const matCuSteps = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.86, metalness: 0.04 })
  );
  const matCuLobbyGlow = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.95,
      roughness: 0.25,
    })
  );
  const matCuPalmTrunk = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x6b5341, roughness: 0.9, metalness: 0.0 })
  );
  const matCuPalmFrond = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.74, metalness: 0.02 })
  );

  // Reusable composite palm tree builder matching the tropical palms along CU Block A3
  const palmTrunkGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.3, 6.2, 7));
  const palmFrondGeo = trackGeo(new THREE.ConeGeometry(0.75, 3.2, 5));
  const createCuPalmTree = (x: number, z: number, scale = 1): THREE.Group => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(scale);
    const trunk = new THREE.Mesh(palmTrunkGeo, matCuPalmTrunk);
    trunk.position.y = 3.1;
    g.add(trunk);
    for (let f = 0; f < 6; f++) {
      const ang = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(palmFrondGeo, matCuPalmFrond);
      frond.position.set(Math.cos(ang) * 1.05, 6.35, Math.sin(ang) * 1.05);
      frond.rotation.z = -Math.PI * 0.36;
      frond.rotation.y = -ang;
      g.add(frond);
    }
    return g;
  };

  // Shared rooftop tank & mast geometries
  const tankGeo = trackGeo(new THREE.CylinderGeometry(0.82, 0.86, 2.0, 10));
  const stanchionGeo = trackGeo(new THREE.BoxGeometry(0.32, 3.2, 0.32));

  interface CuBlockOptions {
    width: number;
    depth: number;
    height: number;
    includeCafeAndSidePortico?: boolean;
    includeFrontPalms?: boolean;
    includeSecondarySideSign?: boolean;
    roofSignWidth: number;
    roofSignHeight: number;
    plaqueWidth: number;
    plaqueHeight: number;
  }

  /**
   * Builds a photorealistic composite 7-story Chandigarh University Academic Block A3 landmark:
   * crisp alabaster-white concrete, overhanging 7th-floor cornice, 3D vertical structural piers,
   * crimson ACADEMIC BLOCK [A3] facade badge, illuminated CHANDIGARH UNIVERSITY rooftop monument sign,
   * central penthouse + antenna mast, black water-tank clusters, bright green utility boxes,
   * central mural portico with grand steps, brick-red campus cafe, and palm-lined front plaza.
   */
  const buildCuAcademicBlockA3 = (opts: CuBlockOptions): THREE.Group => {
    const {
      width,
      depth,
      height,
      includeCafeAndSidePortico = true,
      includeFrontPalms = true,
      includeSecondarySideSign = false,
      roofSignWidth,
      roofSignHeight,
      plaqueWidth,
      plaqueHeight,
    } = opts;
    const g = new THREE.Group();

    // 1. Main 7-story building volume (Front +Z & Back -Z use full CU A3 elevation)
    const body = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(width, height, depth)),
      [
        matCuA3Side,
        matCuA3Side,
        matRoofConcrete,
        matRoofConcrete,
        matCuA3Front,
        matCuA3Front,
      ]
    );
    body.position.y = height / 2;
    body.castShadow = !isSoftwareGl;
    body.receiveShadow = true;
    g.add(body);

    // 2. Iconic 3D Protruding 7th-Floor White Overhang Cantilever Cornice with individual twin windows
    const overhangH = height * 0.16;
    const overhangW = width * 0.84;
    const overhangFront = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(overhangW, overhangH, 1.05)),
      [
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuA3Overhang,
        matCuConcreteWhite,
      ]
    );
    overhangFront.position.set(0, height - overhangH / 2 - 0.15, depth / 2 + 0.42);
    g.add(overhangFront);

    // 3. Real 3D Protruding Vertical White Structural Piers dividing the lower 6 floors
    const pierFractions = [-0.41, -0.18, -0.02, 0.13, 0.32, 0.43];
    const pierH = height - overhangH;
    const pierGeo = trackGeo(new THREE.BoxGeometry(1.15, pierH, 0.72));
    pierFractions.forEach((frac) => {
      const pier = new THREE.Mesh(pierGeo, matCuConcreteWhite);
      pier.position.set(width * frac, pierH / 2, depth / 2 + 0.26);
      g.add(pier);
    });

    // 4. Crisp White Roof Parapet Rim
    const parapetH = 1.15;
    const paraFront = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(width + 0.4, parapetH, 0.65)),
      matCuConcreteWhite
    );
    paraFront.position.set(0, height + parapetH / 2, depth / 2 - 0.15);
    const paraBack = paraFront.clone();
    paraBack.position.z = -depth / 2 + 0.15;
    const paraLeft = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.65, parapetH, depth + 0.4)),
      matCuConcreteWhite
    );
    paraLeft.position.set(-width / 2 + 0.15, height + parapetH / 2, 0);
    const paraRight = paraLeft.clone();
    paraRight.position.x = width / 2 - 0.15;
    g.add(paraFront, paraBack, paraLeft, paraRight);

    // 5. Iconic Parapet Fascia Plaque: "ACADEMIC BLOCK [A3]" (white fascia + crimson A3 box)
    const plaque = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(plaqueWidth, plaqueHeight, 0.28)),
      [
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuA3Plaque,
        matCuConcreteWhite,
      ]
    );
    plaque.position.set(width * 0.03, height - overhangH * 0.46, depth / 2 + 1.05);
    g.add(plaque);

    // 6. Bold Illuminated Rooftop Monument Sign: "CHANDIGARH UNIVERSITY" over the top!
    const roofSignY = height + parapetH + roofSignHeight / 2 + 1.15;
    const roofSignZ = depth / 2 - 1.1;
    const signSupportOffsets = [-roofSignWidth * 0.38, -roofSignWidth * 0.12, roofSignWidth * 0.12, roofSignWidth * 0.38];
    signSupportOffsets.forEach((sx) => {
      const post = new THREE.Mesh(stanchionGeo, matDarkSteel);
      post.position.set(sx, height + 1.5, roofSignZ);
      g.add(post);
    });
    const roofSignBoard = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(roofSignWidth, roofSignHeight, 0.55)),
      [
        matDarkSteel,
        matDarkSteel,
        matDarkSteel,
        matDarkSteel,
        matCuRoofSign,
        matCuRoofSign,
      ]
    );
    roofSignBoard.position.set(0, roofSignY, roofSignZ);
    g.add(roofSignBoard);

    // Optional secondary illuminated CHANDIGARH UNIVERSITY sign on the +X (South-facing on East Wing) parapet
    if (includeSecondarySideSign) {
      const sideSignW = depth * 0.82;
      const sideSignH = roofSignHeight * 0.86;
      const sideSign = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.55, sideSignH, sideSignW)),
        [
          matCuRoofSign,
          matCuRoofSign,
          matDarkSteel,
          matDarkSteel,
          matDarkSteel,
          matDarkSteel,
        ]
      );
      sideSign.position.set(width / 2 - 1.1, height + parapetH + sideSignH / 2 + 1.0, 0);
      g.add(sideSign);

      const sidePlaque = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.28, plaqueHeight * 0.9, plaqueWidth * 0.85)),
        [
          matCuA3Plaque,
          matCuConcreteWhite,
          matCuConcreteWhite,
          matCuConcreteWhite,
          matCuConcreteWhite,
          matCuConcreteWhite,
        ]
      );
      sidePlaque.position.set(width / 2 + 0.2, height - overhangH * 0.46, 0);
      g.add(sidePlaque);
    }

    // 7. Central White Rooftop Elevator/Staircase Penthouse + Telecom Mast (authentic photo details)
    const pentW = width * 0.16;
    const pentH = 4.6;
    const pentD = depth * 0.42;
    const penthouse = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(pentW, pentH, pentD)),
      matCuConcreteWhite
    );
    penthouse.position.set(-width * 0.04, height + pentH / 2, -depth * 0.12);
    g.add(penthouse);

    const mast = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.22, 8.2, 6)),
      matSteelTruss
    );
    mast.position.set(-width * 0.14, height + 4.1, -depth * 0.15);
    g.add(mast);

    // 8. Authentic Rooftop Black Cylindrical Sintex Water Tanks + Emerald-Green Plant Enclosures
    const tankClustersX = [
      -width * 0.44, -width * 0.415, -width * 0.39,
      -width * 0.19, -width * 0.165, -width * 0.14, -width * 0.115,
      width * 0.28, width * 0.305, width * 0.33, width * 0.355,
    ];
    tankClustersX.forEach((tx, idx) => {
      const tank = new THREE.Mesh(tankGeo, matCuTankBlack);
      tank.position.set(tx, height + 1.15, (idx % 2 === 0 ? 1 : -1) * 1.4 - depth * 0.12);
      g.add(tank);
    });

    const greenBoxGeo = trackGeo(new THREE.BoxGeometry(4.2, 2.3, 3.2));
    const greenLeft = new THREE.Mesh(greenBoxGeo, matCuGreenUnit);
    greenLeft.position.set(-width * 0.34, height + 1.25, depth * 0.18);
    const greenRight = new THREE.Mesh(greenBoxGeo, matCuGreenUnit);
    greenRight.position.set(width * 0.39, height + 1.25, depth * 0.18);
    g.add(greenLeft, greenRight);

    // 9. Grand Central Entrance Portico with Colorful Mural Frieze, Warm Lobby & Wide Steps
    const porticoW = Math.min(15.5, width * 0.22);
    const porticoH = 4.4;
    const porticoD = 4.6;
    const porticoRoof = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(porticoW, 1.35, porticoD)),
      [
        matCuMural,
        matCuMural,
        matCuConcreteWhite,
        matCuConcreteWhite,
        matCuMural,
        matCuConcreteWhite,
      ]
    );
    porticoRoof.position.set(width * 0.02, porticoH, depth / 2 + porticoD / 2 - 0.1);
    g.add(porticoRoof);

    // Portico pillars & warmly lit glass entrance lobby
    const pillarGeo = trackGeo(new THREE.BoxGeometry(0.75, porticoH, 0.75));
    [-porticoW / 2 + 0.5, porticoW / 2 - 0.5].forEach((px) => {
      const pillar = new THREE.Mesh(pillarGeo, matCuConcreteWhite);
      pillar.position.set(width * 0.02 + px, porticoH / 2, depth / 2 + porticoD - 0.5);
      g.add(pillar);
    });
    const lobbyGlass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(porticoW - 2.4, porticoH - 0.8, 0.35)),
      matCuLobbyGlow
    );
    lobbyGlass.position.set(width * 0.02, (porticoH - 0.8) / 2, depth / 2 + 0.12);
    g.add(lobbyGlass);

    // 5-tier Grand Entrance Concrete Steps
    for (let s = 0; s < 5; s++) {
      const stepW = porticoW - 1.2;
      const step = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(stepW, 0.24, 0.95)),
        matCuSteps
      );
      step.position.set(width * 0.02, 0.12 + (4 - s) * 0.2, depth / 2 + porticoD + 0.5 + s * 0.85);
      g.add(step);
    }

    // 10. Bottom-Left Brick-Red Campus Cafe ("ROCKS N COOKS") & Far-Right Secondary Portico
    if (includeCafeAndSidePortico) {
      const cafeW = 10.5;
      const cafeH = 3.9;
      const cafeD = 4.2;
      const cafeBody = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cafeW, cafeH, cafeD)),
        matCuCafeRed
      );
      cafeBody.position.set(-width * 0.41, cafeH / 2, depth / 2 + cafeD / 2 - 0.1);
      const cafeRoofTrim = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cafeW + 0.5, 0.45, cafeD + 0.5)),
        matCuConcreteWhite
      );
      cafeRoofTrim.position.set(-width * 0.41, cafeH + 0.22, depth / 2 + cafeD / 2 - 0.1);
      const cafeBoard = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(cafeW - 1.4, 1.35, 0.18)),
        matCuCafeSign
      );
      cafeBoard.position.set(-width * 0.41, cafeH - 0.85, depth / 2 + cafeD + 0.02);
      g.add(cafeBody, cafeRoofTrim, cafeBoard);

      // Far-right white secondary portico + steps
      const rightPortico = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(8.5, 3.8, 3.8)),
        matCuConcreteWhite
      );
      rightPortico.position.set(width * 0.44, 1.9, depth / 2 + 1.8);
      g.add(rightPortico);
    }

    // 11. Authentic Row of Chandigarh University Tropical Palm Trees lining the front plaza
    if (includeFrontPalms) {
      const palmXs = [
        -width * 0.30, -width * 0.22, -width * 0.14,
        width * 0.16, width * 0.23, width * 0.30, width * 0.37,
      ];
      palmXs.forEach((px, idx) => {
        g.add(createCuPalmTree(px, depth / 2 + 6.4 + (idx % 2) * 1.4, 0.92 + (idx % 3) * 0.1));
      });
    }

    return g;
  };

  // 5A. HERO LANDMARK #1 — Chandigarh University Academic Block A3 (Primary North Venue Backdrop)
  // Positioned directly behind Bus Parking A3 / Entry Gate A facing South (+Z) across the entire arena!
  const northBlockCenter = cadToWorld(146, -152, 0);
  const cuNorthHeroBlock = buildCuAcademicBlockA3({
    width: 96,
    depth: 26,
    height: 27,
    includeCafeAndSidePortico: true,
    includeFrontPalms: true,
    includeSecondarySideSign: false,
    roofSignWidth: 46,
    roofSignHeight: 7.4,
    plaqueWidth: 19,
    plaqueHeight: 3.4,
  });
  cuNorthHeroBlock.name = 'ChandigarhUniversityAcademicBlockA3_North';
  cuNorthHeroBlock.position.set(northBlockCenter.x, 0, northBlockCenter.z);
  root.add(cuNorthHeroBlock);

  // 5B. HERO LANDMARK #2 — Adjacent East Academic Block A3 Wing (140 × 170 ft CAD footprint)
  // Rotated -PI/2 so its ornate main facade faces West (-X) directly into Central Arena (Zone D UIE / CSE)
  // AND its secondary rooftop sign & A3 badge face South (+Z) toward Hardware Pit & Master Aerial!
  const bCenter = cadToWorld(520, 385, 0);
  const bSize = cadSizeToWorld(140, 170);
  const cuEastHeroWing = buildCuAcademicBlockA3({
    width: bSize.d, // 51.8m along North-South axis (becomes local X after -PI/2 rotation)
    depth: bSize.w, // 42.7m along East-West axis (becomes local Z after -PI/2 rotation)
    height: 24.5,
    includeCafeAndSidePortico: false,
    includeFrontPalms: false,
    includeSecondarySideSign: true,
    roofSignWidth: 34,
    roofSignHeight: 5.8,
    plaqueWidth: 14.5,
    plaqueHeight: 2.7,
  });
  cuEastHeroWing.name = 'ChandigarhUniversityAcademicBlockA3_East';
  cuEastHeroWing.position.set(bCenter.x, 0, bCenter.z);
  cuEastHeroWing.rotation.y = -Math.PI / 2;

  // Visible 3-Phase Industrial Power Transformer & Conduit entering Zone F Robotics (South side of East Wing)
  const transformer = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.2, 2.8, 2.6)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45, metalness: 0.5 }))
  );
  // In local coords rotated -PI/2 around Y, local +X maps to world +Z (South toward Zone F Robotics)
  transformer.position.set(bSize.d / 2 + 1.4, 1.4, -6);
  cuEastHeroWing.add(transformer);

  root.add(cuEastHeroWing);

  // ---------------------------------------------------------------------------
  // 6. HERO COMPOSITE 45° DUAL-WING ZERO TO ONE CENTER STAGE (12+ PARTS)
  // ---------------------------------------------------------------------------
  const stageGroup = new THREE.Group();
  stageGroup.name = 'ZeroToOneCenterStage';
  root.add(stageGroup);

  // Chamfered main stage deck (1.55m high)
  const stageDeck = new THREE.Mesh(
    trackGeo(createCadPolygonExtrude(STAGE_POLYGON_CAD, 1.55)),
    matStageDeck
  );
  stageDeck.position.y = 0.14;
  stageDeck.castShadow = !isSoftwareGl;
  stageDeck.receiveShadow = true;
  stageGroup.add(stageDeck);

  // Diagonal front orientation: chamfer runs from (62,334) to (110,382).
  // Rotation +3*PI/4 aligns local +Z directly along (+0.707, 0, -0.707) (North-East),
  // facing squarely across the AV Console and bisecting BOTH North Wing (-Z) & Central/East Wing (+X).
  const stageAnchor = cadToWorld(56, 424, 0);
  const stageDiagAngle = (3 * Math.PI) / 4;

  const stageFocal = new THREE.Group();
  stageFocal.position.set(stageAnchor.x, 1.69, stageAnchor.z);
  stageFocal.rotation.y = stageDiagAngle;
  stageGroup.add(stageFocal);

  // Wide architectural stairs descending toward the dual-wing audience with glowing riser trim
  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(16, 0.36, 0.72)),
      matDarkSteel
    );
    step.position.set(0, -0.18 - s * 0.38, 7.6 + s * 0.68);
    stageFocal.add(step);

    const riserTrim = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(15.6, 0.05, 0.06)),
      matLedAccentTeal
    );
    riserTrim.position.set(0, -0.02 - s * 0.38, 7.98 + s * 0.68);
    stageFocal.add(riserTrim);
  }

  // Glowing emerald-to-cobalt LED stage nosing trim
  const stageFrontLip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(24, 0.24, 0.34)),
    matLedAccentTeal
  );
  stageFrontLip.position.set(0, 0.06, 7.1);
  stageFocal.add(stageFrontLip);

  // 4 Angled Black Stage Floor Wedge Monitors along front lip
  for (const wx of [-7.4, -2.8, 2.8, 7.4]) {
    const wedge = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.95, 0.42, 0.58)),
      matDarkSteel
    );
    wedge.position.set(wx, 0.22, 6.05);
    wedge.rotation.x = -0.45;
    stageFocal.add(wedge);
  }

  // Panoramic Zero to One Main LED Screen (24.5m wide x 9.2m tall) facing BOTH wings
  const stageLedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.mainStageLed,
      emissive: 0xffffff,
      emissiveMap: textures.mainStageLed,
      emissiveIntensity: 0.95,
      roughness: 0.22,
      metalness: 0.05,
    })
  );
  const ledScreen = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(24.5, 9.2)), stageLedMat);
  ledScreen.position.set(0, 5.1, -1.6);
  stageFocal.add(ledScreen);

  // Heavy black structural LED cabinet backing behind screen
  const ledBacking = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(25.2, 9.7, 0.85)),
    matDarkSteel
  );
  ledBacking.position.set(0, 5.1, -2.1);
  ledBacking.castShadow = !isSoftwareGl;
  stageFocal.add(ledBacking);

  // Twin Angled Side IMAG Live Countdown LED Wings (left & right of main LED)
  const imagLedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.stageImagWing,
      emissive: 0xffffff,
      emissiveMap: textures.stageImagWing,
      emissiveIntensity: 0.92,
      roughness: 0.22,
      metalness: 0.06,
    })
  );
  for (const side of [-1, 1]) {
    const imagGroup = new THREE.Group();
    imagGroup.position.set(side * 16.4, 5.0, -0.4);
    imagGroup.rotation.y = side > 0 ? -0.28 : 0.28;

    const imagFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(5.4, 8.1)), imagLedMat);
    imagFace.position.z = 0.28;
    const imagBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.8, 8.5, 0.48)), matDarkSteel);
    imagGroup.add(imagFace, imagBack);
    stageFocal.add(imagGroup);
  }

  // Overhead Stage Truss Rigging Frame (Left/Right Towers + Overhead Proscenium)
  const trussTopBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(36.5, 1.15, 1.4)),
    matSteelTruss
  );
  trussTopBar.position.set(0, 11.4, -1.2);
  stageFocal.add(trussTopBar);

  const trussFrontBridge = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(27, 0.75, 0.85)),
    matSteelTruss
  );
  trussFrontBridge.position.set(0, 11.2, 5.0);
  stageFocal.add(trussFrontBridge);

  for (const sx of [-13.4, 13.4]) {
    const tower = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.1, 11.6, 1.35)),
      matDarkSteel
    );
    tower.position.set(sx, 5.8, -1.2);
    tower.castShadow = !isSoftwareGl;
    stageFocal.add(tower);

    // Suspended Line-Array Concert Speaker Clusters (curved stack of 6 cabinets)
    for (let k = 0; k < 6; k++) {
      const spk = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.45, 0.56, 1.0)),
        matDarkSteel
      );
      spk.position.set(sx > 0 ? sx - 1.1 : sx + 1.1, 9.4 - k * 0.62, 0.7 + k * 0.09);
      spk.rotation.x = 0.08 * k;
      stageFocal.add(spk);
    }
  }

  // Keynote Podium, Gooseneck Mic & Standing Keynote Speaker
  const podium = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.45, 1.35, 0.92)), matDarkSteel);
  podium.position.set(0, 0.68, 4.4);
  stageFocal.add(podium);
  const podiumTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.22, 0.85, 0.12)),
    matLedAccentTeal
  );
  podiumTrim.position.set(0, 0.72, 4.88);
  stageFocal.add(podiumTrim);

  // Keynote Speaker standing behind the podium addressing 6,200 builders
  const matSpeakerSuit = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.72, metalness: 0.08 })
  );
  const matSpeakerSkin = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd9a982, roughness: 0.75, metalness: 0.0 })
  );
  const matVipChair = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.62, metalness: 0.06 })
  );
  const speakerGroup = new THREE.Group();
  speakerGroup.position.set(0, 0, 3.42);
  const spLegs = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.88, 8)), matDarkSteel);
  spLegs.position.y = 0.44;
  const spTorso = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.2, 0.68, 8)), matSpeakerSuit);
  spTorso.position.y = 1.22;
  const spHead = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.16, 10, 8)), matSpeakerSkin);
  spHead.position.y = 1.74;
  const spGestureArm = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.065, 0.055, 0.52, 6)), matSpeakerSuit);
  spGestureArm.position.set(0.32, 1.35, 0.16);
  spGestureArm.rotation.set(0.8, 0, -0.45);
  speakerGroup.add(spLegs, spTorso, spHead, spGestureArm);
  stageFocal.add(speakerGroup);

  // 4 Seated VIP Dignitaries / Industry Panelists in Modern Stage Armchairs
  const vipXs = [-6.8, -4.1, 4.1, 6.8];
  const vipBlazerColors = [0x1e3a8a, 0x0f766e, 0x334155, 0x1d4ed8];
  vipXs.forEach((vx, idx) => {
    const vipSeat = new THREE.Group();
    vipSeat.position.set(vx, 0, 1.75);
    vipSeat.rotation.y = vx < 0 ? 0.24 : -0.24;

    const cushion = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.44, 0.85)), matVipChair);
    cushion.position.y = 0.26;
    const backrest = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.65, 0.18)), matVipChair);
    backrest.position.set(0, 0.72, -0.34);
    const vipTorso = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.21, 0.23, 0.62, 8)),
      trackMat(new THREE.MeshStandardMaterial({ color: vipBlazerColors[idx], roughness: 0.72 }))
    );
    vipTorso.position.set(0, 0.84, -0.02);
    const vipHead = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.15, 8, 8)), matSpeakerSkin);
    vipHead.position.set(0, 1.32, -0.02);
    vipSeat.add(cushion, backrest, vipTorso, vipHead);
    stageFocal.add(vipSeat);
  });

  // Low glass stage coffee tables between left & right VIP pairs
  for (const tx of [-5.45, 5.45]) {
    const tableTop = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 12)), matGlassCabin);
    tableTop.position.set(tx, 0.54, 2.45);
    const tableLeg = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.22, 0.52, 8)), matDarkSteel);
    tableLeg.position.set(tx, 0.26, 2.45);
    stageFocal.add(tableTop, tableLeg);
  }

  // Subtle volumetric stage beam cones projecting outward from top proscenium toward audience
  const stageBeamMats: THREE.MeshBasicMaterial[] = [];
  const beamGeo = trackGeo(new THREE.ConeGeometry(4.2, 15, 16, 1, true));
  const beamOffsets = [-9, -3, 3, 9];
  beamOffsets.forEach((bx, i) => {
    const bMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x10b981 : 0x3b82f6,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    stageBeamMats.push(bMat);
    const cone = new THREE.Mesh(beamGeo, bMat);
    cone.position.set(bx, 6.4, 6.2);
    cone.rotation.x = -0.38;
    cone.rotation.z = bx * -0.025;
    stageFocal.add(cone);
  });

  // ---------------------------------------------------------------------------
  // 7. CENTRAL AV, LIGHTING & BROADCAST FOH CONSOLE + CAMERA JIB CRANE
  // ---------------------------------------------------------------------------
  const fohGroup = new THREE.Group();
  const fohPos = cadToWorld(149, 407, 0.14);
  const fohSize = cadSizeToWorld(26, 42);
  fohGroup.position.set(fohPos.x, 0.14, fohPos.z);

  const fohPlatform = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(fohSize.w, 0.85, fohSize.d)),
    matDarkSteel
  );
  fohPlatform.position.y = 0.425;
  fohGroup.add(fohPlatform);

  const fohDesk = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.4, 1.05, fohSize.d * 0.72)),
    matStageDeck
  );
  fohDesk.position.set(-0.6, 1.38, 0);
  fohGroup.add(fohDesk);

  // 4 glowing broadcast monitors on AV console
  for (let m = 0; m < 4; m++) {
    const mon = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.65, 1.15)),
      matLedAccentBlue
    );
    mon.position.set(-1.3, 2.25, -3.4 + m * 2.25);
    fohGroup.add(mon);
  }

  // Broadcast Cinema Camera Jib Crane beside FOH Console sweeping toward the stage
  const jibGroup = new THREE.Group();
  jibGroup.position.set(-2.4, 0.85, 4.4);
  jibGroup.rotation.y = 0.58;
  const jibBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.45, 0.8, 0.5, 8)), matDarkSteel);
  jibBase.position.y = 0.25;
  const jibMast = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 8)), matSteelTruss);
  jibMast.position.y = 1.45;
  const jibBoom = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.18, 8.2)), matDarkSteel);
  jibBoom.position.set(0, 3.25, -1.8);
  jibBoom.rotation.x = 0.34;
  const jibCam = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.36, 0.78)), matDarkSteel);
  jibCam.position.set(0, 4.55, -5.5);
  const jibTally = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.08, 6, 6)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 }))
  );
  jibTally.position.set(0, 4.78, -5.5);
  jibGroup.add(jibBase, jibMast, jibBoom, jibCam, jibTally);
  fohGroup.add(jibGroup);

  root.add(fohGroup);

  // ---------------------------------------------------------------------------
  // 8. SOUTH PERIMETER GLASS VIP GREEN ROOMS & DRIVER / OPS / MEDICAL CABINS
  // ---------------------------------------------------------------------------
  const addGlassCabin = (
    cadX: number,
    cadY: number,
    cadW: number,
    cadH: number,
    heightM: number,
    isMedical = false
  ) => {
    const grp = new THREE.Group();
    const center = cadToWorld(cadX + cadW / 2, cadY + cadH / 2, 0.14);
    const sz = cadSizeToWorld(cadW, cadH);
    grp.position.set(center.x, 0.14, center.z);

    // Base slab
    const base = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(sz.w, 0.25, sz.d)), matDarkSteel);
    base.position.y = 0.125;
    grp.add(base);

    // Warm glowing interior lounge core
    const inner = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(sz.w * 0.84, heightM * 0.78, sz.d * 0.8)),
      matWarmInterior
    );
    inner.position.y = heightM * 0.44;
    grp.add(inner);

    // Outer glass curtain wall
    const glass = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(sz.w * 0.96, heightM * 0.86, sz.d * 0.96)),
      matGlassCabin
    );
    glass.position.y = heightM * 0.46;
    glass.renderOrder = 4;
    grp.add(glass);

    // Flat architectural overhang roof
    const roof = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(sz.w + 0.6, 0.42, sz.d + 0.6)),
      matDarkSteel
    );
    roof.position.y = heightM;
    roof.castShadow = !isSoftwareGl;
    grp.add(roof);

    if (isMedical) {
      const medCrossMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.6,
        })
      );
      const barH = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.8, 0.45, 0.18)), medCrossMat);
      barH.position.set(0, heightM - 0.5, sz.d / 2 + 0.2);
      const barV = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 1.8, 0.18)), medCrossMat);
      barV.position.set(0, heightM - 0.5, sz.d / 2 + 0.2);
      grp.add(barH, barV);
    }

    root.add(grp);
  };

  // West Driver / Medical Ops Cabin (CAD 2..80 x 492..548)
  addGlassCabin(2, 492, 78, 56, 4.4, true);
  // Dual VIP & Speaker Green Rooms (CAD 84..120 & 122..158 x 518..548)
  addGlassCabin(84, 518, 36, 30, 4.2, false);
  addGlassCabin(122, 518, 36, 30, 4.2, false);
  // Center Driver / Security Ops Cabin (CAD 162..204 x 506..548)
  addGlassCabin(162, 506, 42, 42, 4.2, false);

  // ---------------------------------------------------------------------------
  // 9. SIX COLOR-CODED TRACK ZONES + HANGING DEPARTMENT GANTRIES + RAYCAST HITBOXES
  // ---------------------------------------------------------------------------
  const trackZoneGroup = new THREE.Group();
  trackZoneGroup.name = 'TrackZoneOverlays';
  root.add(trackZoneGroup);

  const trackHighlightRails = new Map<string, THREE.MeshStandardMaterial>();
  const trackGantryMats = new Map<string, THREE.MeshStandardMaterial>();
  const trackFloorMats = new Map<string, THREE.MeshStandardMaterial>();

  for (const track of tracks) {
    const { x, y, width, height, cutoutBottomLeft } = track.cadZone;

    // Build exact zone polygon (including TBI bottom-left cutout!)
    const zonePts: Array<[number, number]> = cutoutBottomLeft
      ? [
          [x, y],
          [x + width, y],
          [x + width, y + height],
          [x + cutoutBottomLeft.width, y + height],
          [x + cutoutBottomLeft.width, y + height - cutoutBottomLeft.height],
          [x, y + height - cutoutBottomLeft.height],
        ]
      : [
          [x, y],
          [x + width, y],
          [x + width, y + height],
          [x, y + height],
        ];

    const floorTex = textures.trackFloorDecals.get(track.id);
    const floorMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(track.zoneFill),
        map: floorTex,
        roughness: 0.78,
        metalness: 0.04,
        transparent: true,
        opacity: 0.74,
      })
    );
    trackFloorMats.set(track.id, floorMat);

    const floorMesh = new THREE.Mesh(
      trackGeo(createCadPolygonExtrude(zonePts, 0.035)),
      floorMat
    );
    floorMesh.position.y = 0.145;
    floorMesh.receiveShadow = true;
    floorMesh.userData.trackId = track.id;
    trackZoneGroup.add(floorMesh);
    interactables.push(floorMesh);

    // Illuminated zone perimeter rail (boosts emissive when track is selected)
    const railMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(track.zoneStroke),
        emissive: new THREE.Color(track.zoneStroke),
        emissiveIntensity: 0.45,
        roughness: 0.3,
      })
    );
    trackHighlightRails.set(track.id, railMat);

    for (let i = 0; i < zonePts.length; i++) {
      const [ax, ay] = zonePts[i];
      const [bx, by] = zonePts[(i + 1) % zonePts.length];
      const wa = cadToWorld(ax, ay, 0.21);
      const wb = cadToWorld(bx, by, 0.21);
      const len = Math.hypot(wb.x - wa.x, wb.z - wa.z);
      const seg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(len, 0.09, 0.24)), railMat);
      seg.position.set((wa.x + wb.x) / 2, 0.21, (wa.z + wb.z) / 2);
      seg.rotation.y = -Math.atan2(wb.z - wa.z, wb.x - wa.x);
      trackZoneGroup.add(seg);
    }

    // Prominent Composite Hanging Steel Gantry Portal carrying Double-Sided Dept Banner
    const gantryCenterCadX = cutoutBottomLeft
      ? x + cutoutBottomLeft.width + (width - cutoutBottomLeft.width) * 0.5
      : x + width * 0.5;
    const gantryCenterCadY =
      track.id === 'aim' || track.id === 'ait' ? y + height * 0.62 : y + height * 0.45;
    const gPos = cadToWorld(gantryCenterCadX, gantryCenterCadY, 0.15);

    const gantryGroup = new THREE.Group();
    gantryGroup.position.set(gPos.x, 0.15, gPos.z);
    // Orient North Wing gantries to face South toward stage; Central/SE gantries to face West/South
    const isNorthWing = track.id === 'aim' || track.id === 'ait';
    if (!isNorthWing) {
      gantryGroup.rotation.y = track.id === 'robotics-mechatronics' ? 0 : 0;
    }

    const spanW = Math.min(18.5, Math.max(12.5, (width * FT_TO_M) * 0.55));
    const gantryH = 8.4;

    // Two vertical steel truss legs
    for (const lx of [-spanW / 2, spanW / 2]) {
      const leg = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.45, gantryH, 0.45)),
        matDarkSteel
      );
      leg.position.set(lx, gantryH / 2, 0);
      gantryGroup.add(leg);
    }
    // Top truss bridge
    const topBridge = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(spanW + 0.8, 0.55, 0.65)),
      matSteelTruss
    );
    topBridge.position.set(0, gantryH, 0);
    gantryGroup.add(topBridge);

    // Double-sided illuminated Department + Track Header Board
    const gTex = textures.trackGantries.get(track.id);
    const gMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: gTex,
        emissive: 0xffffff,
        emissiveMap: gTex,
        emissiveIntensity: 0.55,
        roughness: 0.32,
      })
    );
    trackGantryMats.set(track.id, gMat);

    const boardH = spanW * 0.25;
    const board = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(spanW - 0.6, boardH, 0.28)), [
      matDarkSteel,
      matDarkSteel,
      matDarkSteel,
      matDarkSteel,
      gMat,
      gMat,
    ]);
    board.position.set(0, gantryH - boardH * 0.5 - 0.35, 0);
    board.userData.trackId = track.id;
    gantryGroup.add(board);
    interactables.push(board);

    root.add(gantryGroup);
  }

  // ---------------------------------------------------------------------------
  // 10. ZONE F DEDICATED ROBOTICS TESTING PIT (25 x 20 ft) WITH 4 MINI ROVERS
  // ---------------------------------------------------------------------------
  const pitPos = cadToWorld(570, 510, 0.2);
  const pitSize = cadSizeToWorld(25, 20);
  const pitGroup = new THREE.Group();
  pitGroup.position.set(pitPos.x, 0.2, pitPos.z);

  const pitMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72, metalness: 0.1 })
  );
  const pitFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(pitSize.w, 0.06, pitSize.d)),
    pitMat
  );
  pitGroup.add(pitFloor);

  // Safety barrier walls around bot pit
  const barrierMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.25 })
  );
  for (const bz of [-pitSize.d / 2, pitSize.d / 2]) {
    const wall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(pitSize.w, 0.55, 0.16)),
      barrierMat
    );
    wall.position.set(0, 0.28, bz);
    pitGroup.add(wall);
  }
  for (const bx of [-pitSize.w / 2, pitSize.w / 2]) {
    const wall = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.16, 0.55, pitSize.d)),
      barrierMat
    );
    wall.position.set(bx, 0.28, 0);
    pitGroup.add(wall);
  }

  // 4 composite miniature autonomous rovers inside the robotics pit
  const roverChassisMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35, metalness: 0.6 })
  );
  for (let r = 0; r < 4; r++) {
    const rover = new THREE.Group();
    rover.position.set(-2.2 + (r % 2) * 4.4, 0.25, -1.6 + Math.floor(r / 2) * 3.2);
    rover.rotation.y = r * 1.1;
    const body = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.28, 0.72)), roverChassisMat);
    const lidar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 10)),
      matDarkSteel
    );
    lidar.position.y = 0.24;
    rover.add(body, lidar);
    pitGroup.add(rover);
  }
  root.add(pitGroup);

  // ---------------------------------------------------------------------------
  // 11. INSTANCED 6-SEAT CODING PODS, HARDWARE WORKBENCHES, LAPTOPS & BUILDERS
  // ---------------------------------------------------------------------------
  const worldPods = generateWorldPods(tracks);
  const circularPods = worldPods.filter((p) => !p.isHardwareBench);
  const hardwareBenches = worldPods.filter((p) => p.isHardwareBench);

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  // 11A. Circular Coding Pods (Zones A–E)
  const podTopGeo = trackGeo(new THREE.CylinderGeometry(1.12, 1.12, 0.08, 12));
  const podBaseGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.48, 0.72, 8));
  const matPodTop = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x263142, roughness: 0.52, metalness: 0.18 })
  );
  const matPodBase = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.65 })
  );

  const podTopInst = new THREE.InstancedMesh(podTopGeo, matPodTop, circularPods.length);
  const podBaseInst = new THREE.InstancedMesh(podBaseGeo, matPodBase, circularPods.length);

  circularPods.forEach((pod, idx) => {
    dummy.position.set(pod.x, 0.92, pod.z);
    dummy.rotation.set(0, pod.rotationY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    podTopInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(pod.x, 0.54, pod.z);
    dummy.updateMatrix();
    podBaseInst.setMatrixAt(idx, dummy.matrix);
  });
  podTopInst.instanceMatrix.needsUpdate = true;
  podBaseInst.instanceMatrix.needsUpdate = true;
  podTopInst.computeBoundingSphere();
  podBaseInst.computeBoundingSphere();
  root.add(podTopInst, podBaseInst);

  // 11B. Hardware & Robotics Workbenches (Zone F)
  const benchGeo = trackGeo(new THREE.BoxGeometry(2.3, 0.1, 1.25));
  const matBench = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e3a2f, roughness: 0.58, metalness: 0.25 })
  );
  const benchInst = new THREE.InstancedMesh(benchGeo, matBench, hardwareBenches.length);
  hardwareBenches.forEach((pod, idx) => {
    dummy.position.set(pod.x, 0.96, pod.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    benchInst.setMatrixAt(idx, dummy.matrix);
  });
  benchInst.instanceMatrix.needsUpdate = true;
  benchInst.computeBoundingSphere();
  root.add(benchInst);

  // 11C. Seated Builders & Glowing Laptops (Instanced across all pods for 6,200-scale crowd realism)
  const seatsPerCluster = 5;
  const totalBuilders = worldPods.length * seatsPerCluster;
  const builderTorsoGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.23, 0.58, 7));
  const builderHeadGeo = trackGeo(new THREE.SphereGeometry(0.145, 7, 6));
  const laptopGeo = trackGeo(new THREE.BoxGeometry(0.36, 0.24, 0.04));

  const matBuilderTorso = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.02 })
  );
  const matBuilderHead = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd9a982, roughness: 0.78, metalness: 0.0 })
  );
  const matLaptopGlow = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.72,
      roughness: 0.2,
    })
  );

  const torsoInst = new THREE.InstancedMesh(builderTorsoGeo, matBuilderTorso, totalBuilders);
  const headInst = new THREE.InstancedMesh(builderHeadGeo, matBuilderHead, totalBuilders);
  const laptopInst = new THREE.InstancedMesh(laptopGeo, matLaptopGlow, totalBuilders);

  const shirtPalette = [0x1e293b, 0x334155, 0x0f766e, 0x1d4ed8, 0x475569, 0xe2e8f0, 0x7c2d12, 0x374151];

  let bIdx = 0;
  worldPods.forEach((pod, pIndex) => {
    for (let s = 0; s < seatsPerCluster; s++) {
      const ang = pod.rotationY + (s / seatsPerCluster) * Math.PI * 2;
      const seatRad = pod.isHardwareBench ? 1.15 : 1.38;
      const lapRad = pod.isHardwareBench ? 0.52 : 0.74;

      const bx = pod.x + Math.cos(ang) * seatRad;
      const bz = pod.z + Math.sin(ang) * seatRad;

      // Torso
      dummy.position.set(bx, 0.88, bz);
      dummy.rotation.set(0, -ang + Math.PI / 2, 0);
      dummy.scale.set(1, 0.94 + ((pIndex + s) % 3) * 0.06, 1);
      dummy.updateMatrix();
      torsoInst.setMatrixAt(bIdx, dummy.matrix);

      tmpColor.setHex(shirtPalette[(pIndex * 5 + s * 3) % shirtPalette.length]);
      torsoInst.setColorAt(bIdx, tmpColor);

      // Head
      dummy.position.set(bx, 1.32, bz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      headInst.setMatrixAt(bIdx, dummy.matrix);

      // Angled Glowing Laptop Screen facing the seated builder
      const lx = pod.x + Math.cos(ang) * lapRad;
      const lz = pod.z + Math.sin(ang) * lapRad;
      dummy.position.set(lx, 1.09, lz);
      dummy.rotation.set(-0.26, -ang + Math.PI / 2, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      laptopInst.setMatrixAt(bIdx, dummy.matrix);

      bIdx++;
    }
  });
  torsoInst.instanceMatrix.needsUpdate = true;
  if (torsoInst.instanceColor) torsoInst.instanceColor.needsUpdate = true;
  headInst.instanceMatrix.needsUpdate = true;
  laptopInst.instanceMatrix.needsUpdate = true;
  torsoInst.computeBoundingSphere();
  headInst.computeBoundingSphere();
  laptopInst.computeBoundingSphere();
  root.add(torsoInst, headInst, laptopInst);

  // ---------------------------------------------------------------------------
  // 12. ARCHED HANGAR SUPERSTRUCTURE (STEEL PORTAL TRUSSES + TRANSLUCENT ROOF)
  // ---------------------------------------------------------------------------
  const trussGroup = new THREE.Group();
  const roofMembraneGroup = new THREE.Group();
  root.add(trussGroup, roofMembraneGroup);

  const eaveH = 14.0;
  const ridgeH = 18.2;
  const bannerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.verticalBanner,
      side: THREE.DoubleSide,
      roughness: 0.62,
    })
  );

  // Helper: constructs each pitched hangar wing in local space (width along X, length along Z)
  // and rotates the entire wing + roof membrane together by PI/2 when !runAlongZ so roof panels
  // sit 100% mathematically flush on top of every steel truss rafter!
  const addPortalWing = (
    x1Ft: number,
    y1Ft: number,
    x2Ft: number,
    y2Ft: number,
    bays: number,
    runAlongZ: boolean,
    skipStartBays = 0
  ) => {
    const p1 = cadToWorld(x1Ft, y1Ft, 0.14);
    const p2 = cadToWorld(x2Ft, y2Ft, 0.14);
    const wX = Math.abs(p2.x - p1.x);
    const wZ = Math.abs(p2.z - p1.z);
    const midX = (p1.x + p2.x) * 0.5;
    const midZ = (p1.z + p2.z) * 0.5;

    const span = runAlongZ ? wX : wZ;
    const length = runAlongZ ? wZ : wX;
    const halfSpan = span * 0.5;
    const rafterLen = Math.hypot(halfSpan, ridgeH - eaveH);
    const roofPitch = Math.atan2(ridgeH - eaveH, halfSpan);

    const wingTrussGroup = new THREE.Group();
    wingTrussGroup.position.set(midX, 0.14, midZ);
    if (!runAlongZ) wingTrussGroup.rotation.y = Math.PI / 2;

    const wingRoofGroup = new THREE.Group();
    wingRoofGroup.position.set(midX, 0.14, midZ);
    if (!runAlongZ) wingRoofGroup.rotation.y = Math.PI / 2;

    for (let i = skipStartBays; i <= bays; i++) {
      const t = i / bays;
      const zOff = -length / 2 + t * length;

      const frame = new THREE.Group();
      frame.position.set(0, 0, zOff);

      for (const side of [-1, 1]) {
        const col = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.55, eaveH, 0.55)),
          matSteelTruss
        );
        col.position.set(side * halfSpan, eaveH / 2, 0);
        frame.add(col);

        // Hang Zero to One banners strictly on perimeter columns high up (clear of Track Gantries)
        if (i % 2 === 1 && i < bays && (runAlongZ || side === 1)) {
          const flag = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.75, 4.1)), bannerMat);
          flag.position.set(side * (halfSpan - 0.5), eaveH - 2.6, 0);
          frame.add(flag);
        }

        const rafter = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(rafterLen, 0.55, 0.4)),
          matSteelTruss
        );
        rafter.position.set(side * (halfSpan * 0.5), (eaveH + ridgeH) * 0.5, 0);
        rafter.rotation.z = side > 0 ? -roofPitch : roofPitch;
        frame.add(rafter);
      }

      const tie = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(span, 0.26, 0.26)),
        matSteelTruss
      );
      tie.position.set(0, eaveH, 0);
      frame.add(tie);

      wingTrussGroup.add(frame);
    }

    // Translucent tensioned white roof panels mathematically flush on rafters
    const coverStartZ = -length / 2 + (skipStartBays / bays) * length;
    const coverLen = length * (1 - skipStartBays / bays);
    const coverCenterZ = coverStartZ + coverLen * 0.5;
    for (const side of [-1, 1]) {
      const slopeHolder = new THREE.Group();
      slopeHolder.position.set(side * (halfSpan * 0.5), (eaveH + ridgeH) * 0.5 + 0.34, coverCenterZ);
      slopeHolder.rotation.z = side > 0 ? -roofPitch : roofPitch;
      const panel = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(rafterLen, coverLen)),
        matRoofMembrane
      );
      panel.rotation.x = -Math.PI / 2;
      panel.renderOrder = 6;
      slopeHolder.add(panel);
      wingRoofGroup.add(slopeHolder);
    }

    trussGroup.add(wingTrussGroup);
    roofMembraneGroup.add(wingRoofGroup);
  };

  // North Wing Hangar (200 ft wide x 300 ft long)
  addPortalWing(0, 0, 200, 300, 7, true, 0);
  // Central Arena Hangar (starts clear of the 45° Center Stage deck for open proscenium sightlines)
  addPortalWing(120, 300, 450, 550, 7, false, 0);
  // South-East Hardware Extension Wing (140 ft wide x 80 ft deep)
  addPortalWing(450, 470, 590, 550, 3, false, 0);

  // ---------------------------------------------------------------------------
  // 13. SPONSOR PROMENADE BOOTHS (SP-1..SP-6), TBI VC PITCH POD & MENTOR DESKS
  // ---------------------------------------------------------------------------
  const sponsorCadXs = [225, 265, 305, 345, 385, 422];
  sponsorCadXs.forEach((sx, i) => {
    const pos = cadToWorld(sx, 428, 0.19);
    const booth = new THREE.Group();
    booth.position.set(pos.x, 0.19, pos.z);

    // Demo Counter
    const counter = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(5.2, 1.05, 2.2)),
      matDarkSteel
    );
    counter.position.y = 0.525;
    booth.add(counter);

    // Illuminated Header Fascia
    const fasciaMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.sponsorSigns[i],
        emissive: 0xffffff,
        emissiveMap: textures.sponsorSigns[i],
        emissiveIntensity: 0.45,
        roughness: 0.3,
      })
    );
    const fascia = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.4, 1.35, 0.28)), fasciaMat);
    fascia.position.set(0, 3.2, 0);
    booth.add(fascia);

    // Two slim corner posts
    for (const px of [-2.4, 2.4]) {
      const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 3.8, 0.18)), matSteelTruss);
      post.position.set(px, 1.9, 0);
      booth.add(post);
    }
    root.add(booth);
  });

  // TBI VC Pitch Pod Glass Pavilion at L-Junction (CAD 156, 316) with full interior pitch setup
  const vcPos = cadToWorld(156, 316, 0.19);
  const vcPod = new THREE.Group();
  vcPod.position.set(vcPos.x, 0.19, vcPos.z);
  const vcBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(16.2, 0.18, 6.4)), matDarkSteel);
  vcBase.position.y = 0.09;
  const vcGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(16, 3.8, 6.2)), matGlassCabin);
  vcGlass.position.y = 1.98;
  vcGlass.renderOrder = 4;
  const vcRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(16.6, 0.45, 6.8)), matDarkSteel);
  vcRoof.position.y = 4.05;
  const vcSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(9.5, 2.2, 0.24)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.vcPitchSign,
        emissive: 0xffffff,
        emissiveMap: textures.vcPitchSign,
        emissiveIntensity: 0.55,
      })
    )
  );
  vcSign.position.set(0, 5.25, 0);

  // Interior VC pitch conference table, executive chairs & live startup pitch display
  const vcTable = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.6, 0.78, 2.1)), matStageDeck);
  vcTable.position.set(1.2, 0.56, 0);
  const vcScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.vcPitchScreen,
      emissive: 0xffffff,
      emissiveMap: textures.vcPitchScreen,
      emissiveIntensity: 0.95,
      roughness: 0.24,
    })
  );
  const vcScreen = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 2.2, 3.9)), vcScreenMat);
  vcScreen.position.set(-6.4, 2.05, 0);
  vcPod.add(vcBase, vcTable, vcScreen, vcGlass, vcRoof, vcSign);
  for (let c = 0; c < 4; c++) {
    for (const sideZ of [-1.45, 1.45]) {
      const chair = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.6, 0.85, 0.55)), matDarkSteel);
      chair.position.set(-1.4 + c * 1.75, 0.58, sideZ);
      vcPod.add(chair);
    }
  }
  root.add(vcPod);

  // Composite Mentor Helpdesks M-1 (CAD 92, 78) & M-2 (CAD 92, 224) along North Central Promenade
  const addMentorHelpdesk = (cadY: number, signTex: THREE.CanvasTexture) => {
    const pos = cadToWorld(92, cadY, 0.19);
    const desk = new THREE.Group();
    desk.position.set(pos.x, 0.19, pos.z);

    // Triage counter + glowing teal LED kickstrip
    const counter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.8, 1.06, 1.65)), matDarkSteel);
    counter.position.y = 0.53;
    const ledStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.6, 0.12, 1.72)), matLedAccentTeal);
    ledStrip.position.y = 0.92;
    desk.add(counter, ledStrip);

    // Dual gantry stanchions + double-sided illuminated MENTOR HELPDESK sign
    for (const px of [-2.25, 2.25]) {
      const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 3.85, 0.16)), matSteelTruss);
      post.position.set(px, 1.92, 0);
      desk.add(post);
    }
    const signMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: signTex,
        emissive: 0xffffff,
        emissiveMap: signTex,
        emissiveIntensity: 0.62,
        roughness: 0.3,
      })
    );
    const header = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(4.9, 1.32, 0.24)),
      [matDarkSteel, matDarkSteel, matDarkSteel, matDarkSteel, signMat, signMat]
    );
    header.position.set(0, 3.35, 0);
    desk.add(header);

    // Two architecture consultation whiteboards flanking each Mentor Helpdesk
    const matWhiteboard = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.05 })
    );
    for (const wbX of [-3.35, 3.35]) {
      const easel = new THREE.Group();
      easel.position.set(wbX, 0, 0.25);
      easel.rotation.y = wbX < 0 ? 0.35 : -0.35;
      const frame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.5, 1.1, 0.08)), matDarkSteel);
      frame.position.y = 1.48;
      const surface = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.38, 0.98, 0.1)), matWhiteboard);
      surface.position.y = 1.48;
      const leg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 1.4, 0.12)), matSteelTruss);
      leg.position.y = 0.7;
      easel.add(frame, surface, leg);
      desk.add(easel);
    }

    // 4 modern consultation stools
    for (const sx of [-1.6, -0.55, 0.55, 1.6]) {
      const stool = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.2, 0.72, 8)), matSteelTruss);
      stool.position.set(sx, 0.36, 1.35);
      desk.add(stool);
    }

    root.add(desk);
  };
  addMentorHelpdesk(78, textures.mentorDeskM1Sign);
  addMentorHelpdesk(224, textures.mentorDeskM2Sign);

  // ---------------------------------------------------------------------------
  // 13B. STANDING MENTORS (TEAL), JUDGES/VCs (ROYAL BLUE) & MARSHALS (AMBER)
  // ---------------------------------------------------------------------------
  const roleFigures = generateArenaRoleFigures(tracks);
  const matRolePants = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.02 })
  );
  const matRoleVest = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65, metalness: 0.05 })
  );
  const matClipboard = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5, metalness: 0.05 })
  );

  const standLegsGeo = trackGeo(new THREE.CylinderGeometry(0.15, 0.17, 0.84, 7));
  const standTorsoGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.19, 0.64, 7));
  const standHeadGeo = trackGeo(new THREE.SphereGeometry(0.15, 7, 6));
  const clipboardGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.3, 0.04));

  const roleLegsInst = new THREE.InstancedMesh(standLegsGeo, matRolePants, roleFigures.length);
  const roleTorsoInst = new THREE.InstancedMesh(standTorsoGeo, matRoleVest, roleFigures.length);
  const roleHeadInst = new THREE.InstancedMesh(standHeadGeo, matBuilderHead, roleFigures.length);
  const roleClipInst = new THREE.InstancedMesh(clipboardGeo, matClipboard, roleFigures.length);

  roleFigures.forEach((fig, idx) => {
    const baseY = 0.17;
    // Legs
    dummy.position.set(fig.x, baseY + 0.42, fig.z);
    dummy.rotation.set(0, fig.rotationY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    roleLegsInst.setMatrixAt(idx, dummy.matrix);

    // Role-colored Torso Vest/Blazer
    dummy.position.set(fig.x, baseY + 1.15, fig.z);
    dummy.updateMatrix();
    roleTorsoInst.setMatrixAt(idx, dummy.matrix);
    const roleHex =
      fig.role === 'mentor' ? 0x14b8a6 : fig.role === 'judge' ? 0x2563eb : 0xf59e0b;
    tmpColor.setHex(roleHex);
    roleTorsoInst.setColorAt(idx, tmpColor);

    // Head
    dummy.position.set(fig.x, baseY + 1.64, fig.z);
    dummy.updateMatrix();
    roleHeadInst.setMatrixAt(idx, dummy.matrix);

    // Evaluation Clipboard / Tablet held forward
    const fwdX = Math.sin(fig.rotationY) * 0.28;
    const fwdZ = Math.cos(fig.rotationY) * 0.28;
    dummy.position.set(fig.x + fwdX, baseY + 1.12, fig.z + fwdZ);
    dummy.rotation.set(-0.45, fig.rotationY, 0);
    dummy.updateMatrix();
    roleClipInst.setMatrixAt(idx, dummy.matrix);
  });
  roleLegsInst.instanceMatrix.needsUpdate = true;
  roleTorsoInst.instanceMatrix.needsUpdate = true;
  if (roleTorsoInst.instanceColor) roleTorsoInst.instanceColor.needsUpdate = true;
  roleHeadInst.instanceMatrix.needsUpdate = true;
  roleClipInst.instanceMatrix.needsUpdate = true;
  roleLegsInst.computeBoundingSphere();
  roleTorsoInst.computeBoundingSphere();
  roleHeadInst.computeBoundingSphere();
  roleClipInst.computeBoundingSphere();
  root.add(roleLegsInst, roleTorsoInst, roleHeadInst, roleClipInst);

  // ---------------------------------------------------------------------------
  // 13C. 24-HOUR VENUE OPS: HIGH-BAY LEDS, WI-FI 6E MASTS, HYDRATION, EXITS,
  //      EMERGENCY AMBULANCE & 1,050 kVA DG GENERATOR YARD
  // ---------------------------------------------------------------------------
  // Overhead High-Bay LED Pendant Fixtures suspended beneath Hangar Trusses
  const highBayCoords: Array<[number, number]> = [];
  for (let yFt = 32; yFt <= 270; yFt += 48) {
    highBayCoords.push([46, yFt], [148, yFt]);
  }
  for (let xFt = 168; xFt <= 425; xFt += 52) {
    highBayCoords.push([xFt, 348], [xFt, 428], [xFt, 502]);
  }
  for (let xFt = 478; xFt <= 565; xFt += 42) {
    highBayCoords.push([xFt, 508]);
  }
  const matHighBayLed = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff7ed,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    })
  );
  const highBayInst = new THREE.InstancedMesh(
    trackGeo(new THREE.CylinderGeometry(0.45, 0.72, 0.28, 10)),
    matHighBayLed,
    highBayCoords.length
  );
  highBayCoords.forEach(([hx, hy], idx) => {
    const wp = cadToWorld(hx, hy, 13.5);
    dummy.position.set(wp.x, 13.5, wp.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    highBayInst.setMatrixAt(idx, dummy.matrix);
  });
  highBayInst.instanceMatrix.needsUpdate = true;
  highBayInst.computeBoundingSphere();
  trussGroup.add(highBayInst);

  // 6 High-Density Wi-Fi 6E Access Point Masts (matches CAD AP-6E nodes)
  const wifiNodesCad: Array<[number, number]> = [
    [92, 40],
    [92, 266],
    [184, 356],
    [331, 318],
    [432, 428],
    [572, 486],
  ];
  wifiNodesCad.forEach(([wx, wy]) => {
    const wp = cadToWorld(wx, wy, 0.18);
    const mast = new THREE.Group();
    mast.position.set(wp.x, 0.18, wp.z);
    const pole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.12, 6.4, 8)), matDarkSteel);
    pole.position.y = 3.2;
    const beacon = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 10)), matLedAccentBlue);
    beacon.position.y = 6.5;
    mast.add(pole, beacon);
    root.add(mast);
  });

  // 4 Continuous 24-Hour Coffee & Hydration Stations
  const hydrationSpotsCad: Array<[number, number, number]> = [
    [186, 120, Math.PI / 2],
    [186, 250, Math.PI / 2],
    [224, 456, 0],
    [426, 456, 0],
  ];
  const hydrationMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.hydrationSign,
      emissive: 0xffffff,
      emissiveMap: textures.hydrationSign,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    })
  );
  hydrationSpotsCad.forEach(([hx, hy, rotY]) => {
    const wp = cadToWorld(hx, hy, 0.19);
    const bar = new THREE.Group();
    bar.position.set(wp.x, 0.19, wp.z);
    bar.rotation.y = rotY;
    const counter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.0, 1.0, 1.4)), matDarkSteel);
    counter.position.y = 0.5;
    for (const ux of [-1.1, 0, 1.1]) {
      const urn = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.2, 0.22, 0.58, 10)), matSteelTruss);
      urn.position.set(ux, 1.28, 0);
      bar.add(urn);
    }
    for (const px of [-1.85, 1.85]) {
      const p = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 3.2, 0.14)), matSteelTruss);
      p.position.set(px, 1.6, 0);
      bar.add(p);
    }
    const header = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(4.1, 1.0, 0.2)),
      [matDarkSteel, matDarkSteel, matDarkSteel, matDarkSteel, hydrationMat, hydrationMat]
    );
    header.position.set(0, 2.95, 0);
    bar.add(counter, header);
    root.add(bar);
  });

  // Emergency Exit Arches E1 (North East Perimeter) & E2 (SE Hardware Perimeter)
  const exitSignMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.exitSign,
      emissive: 0xffffff,
      emissiveMap: textures.exitSign,
      emissiveIntensity: 0.65,
      roughness: 0.25,
    })
  );
  const exitArchesCad: Array<[number, number, number]> = [
    [201, 224, Math.PI / 2],
    [556, 549, 0],
  ];
  exitArchesCad.forEach(([ex, ey, rotY]) => {
    const wp = cadToWorld(ex, ey, 0.16);
    const arch = new THREE.Group();
    arch.position.set(wp.x, 0.16, wp.z);
    arch.rotation.y = rotY;
    for (const px of [-2.4, 2.4]) {
      const col = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 3.8, 0.28)), matLedAccentTeal);
      col.position.set(px, 1.9, 0);
      arch.add(col);
    }
    const board = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(5.1, 1.05, 0.22)),
      [matDarkSteel, matDarkSteel, matDarkSteel, matDarkSteel, exitSignMat, exitSignMat]
    );
    board.position.set(0, 3.55, 0);
    arch.add(board);
    root.add(arch);
  });

  // 24/7 Emergency Medical Ambulance stationed outside West Medical Bay (CAD -24, 524)
  const ambPos = cadToWorld(-24, 524, 0.02);
  const ambulance = new THREE.Group();
  ambulance.position.set(ambPos.x, 0.02, ambPos.z);
  const matAmbWhite = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.15 })
  );
  const matAmbRed = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.25, roughness: 0.35 })
  );
  const ambBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.3, 2.15, 4.4)), matAmbWhite);
  ambBox.position.set(0, 1.48, -0.7);
  const ambCab = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.18, 1.65, 2.1)), matAmbWhite);
  ambCab.position.set(0, 1.24, 2.45);
  const ambStripe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.34, 0.28, 4.45)), matAmbRed);
  ambStripe.position.set(0, 1.15, -0.7);
  const ambGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.05, 0.72, 0.12)), matDarkSteel);
  ambGlass.position.set(0, 1.56, 3.5);
  const ambLightbar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.4, 0.22, 0.32)), matLedAccentBlue);
  ambLightbar.position.set(0, 2.62, 1.25);
  ambulance.add(ambBox, ambCab, ambStripe, ambGlass, ambLightbar);
  const ambWheelGeo = trackGeo(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10));
  const ambTireMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 }));
  for (const wx of [-1.08, 1.08]) {
    for (const wz of [-1.8, 2.1]) {
      const wheel = new THREE.Mesh(ambWheelGeo, ambTireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.42, wz);
      ambulance.add(wheel);
    }
  }
  root.add(ambulance);

  // 1,050 kVA Synchronized Acoustic DG Power Yard on SW Utility Pad (CAD -50, 448)
  const dgPos = cadToWorld(-50, 448, 0.04);
  const dgYard = new THREE.Group();
  dgYard.position.set(dgPos.x, 0.04, dgPos.z);
  const dgPad = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.5, 0.2, 18.5)), matArenaConcrete);
  dgPad.position.y = 0.1;
  dgYard.add(dgPad);
  const matDgBody = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.52, metalness: 0.42 })
  );
  for (let d = 0; d < 3; d++) {
    const unit = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.6, 2.5, 3.4)), matDgBody);
    unit.position.set(0, 1.45, -5.6 + d * 5.6);
    const exhaust = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 8)), matSteelTruss);
    exhaust.position.set(2.1, 3.3, -5.6 + d * 5.6);
    const trim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.66, 0.22, 3.46)), barrierMat);
    trim.position.set(0, 2.45, -5.6 + d * 5.6);
    dgYard.add(unit, exhaust, trim);
  }
  root.add(dgYard);

  // ---------------------------------------------------------------------------
  // 14. 25-LANE EXPRESS QR CHECK-IN PLAZAS (GATE A NORTH + GATE B SOUTH)
  // ---------------------------------------------------------------------------
  const addCheckInArch = (
    cadX: number,
    cadY: number,
    widthM: number,
    lanes: number,
    signTex: THREE.CanvasTexture
  ) => {
    const grp = new THREE.Group();
    const pos = cadToWorld(cadX, cadY, 0.05);
    grp.position.set(pos.x, 0.05, pos.z);

    // Two gantry towers + overhead banner arch
    for (const sx of [-widthM / 2, widthM / 2]) {
      const col = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.9, 6.8, 1.1)), matDarkSteel);
      col.position.set(sx, 3.4, 0);
      grp.add(col);
    }
    const signMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: signTex,
        emissive: 0xffffff,
        emissiveMap: signTex,
        emissiveIntensity: 0.45,
        roughness: 0.3,
      })
    );
    const archBanner = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(widthM + 1.0, 2.2, 0.55)),
      [matDarkSteel, matDarkSteel, matDarkSteel, matDarkSteel, signMat, signMat]
    );
    archBanner.position.set(0, 6.0, 0);
    grp.add(archBanner);

    // Express QR Kiosk pods across lanes
    const step = (widthM - 3) / Math.max(1, lanes - 1);
    for (let l = 0; l < lanes; l++) {
      const kx = -widthM / 2 + 1.5 + l * step;
      const kiosk = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.65, 1.35, 0.7)),
        l % 2 === 0 ? matLedAccentTeal : matDarkSteel
      );
      kiosk.position.set(kx, 0.68, 0);
      grp.add(kiosk);
    }
    root.add(grp);
  };

  addCheckInArch(100, -14, 24, 12, textures.gateASign);
  addCheckInArch(325, 566, 28, 13, textures.gateBSign);

  // ---------------------------------------------------------------------------
  // 15. DUAL-WING STAGE SIGHTLINE RAYS OVERLAY (TOGGLEABLE)
  // ---------------------------------------------------------------------------
  const sightlinesGroup = new THREE.Group();
  sightlinesGroup.visible = false;
  root.add(sightlinesGroup);

  const sightTargets: Array<{ from: [number, number]; to: [number, number]; color: number }> = [
    { from: [68, 340], to: [44, 65], color: 0x10b981 },
    { from: [82, 354], to: [92, 35], color: 0x10b981 },
    { from: [96, 368], to: [152, 65], color: 0x10b981 },
    { from: [110, 398], to: [380, 355], color: 0x3b82f6 },
    { from: [110, 424], to: [435, 428], color: 0x0d9488 },
    { from: [110, 448], to: [515, 505], color: 0x3b82f6 },
  ];

  sightTargets.forEach(({ from, to, color }) => {
    const a = cadToWorld(from[0], from[1], 5.6);
    const b = cadToWorld(to[0], to[1], 3.4);
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(a.x, a.y, a.z),
      new THREE.Vector3(b.x, b.y, b.z)
    );
    const tube = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(curve, 8, 0.24, 6, false)),
      trackMat(
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.72,
        })
      )
    );
    sightlinesGroup.add(tube);
  });

  // ---------------------------------------------------------------------------
  // 16. COMPOSITE CHANDIGARH UNIVERSITY YELLOW BUSES & LUSH CAMPUS TREE GROVES
  // ---------------------------------------------------------------------------
  const matBusYellow = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.32, metalness: 0.35 })
  );
  const matBusRoof = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48, metalness: 0.15 })
  );
  const matBusWindow = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.14, metalness: 0.65 })
  );
  const matTire = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9, metalness: 0.05 })
  );

  const busPositionsCad: Array<[number, number, number]> = [
    [-46, 55, 0.04],
    [-46, 118, -0.02],
    [-46, 182, 0.01],
    [-46, 255, 0.0],
    [-72, 92, 0.02],
    [-72, 165, -0.03],
  ];

  busPositionsCad.forEach(([bx, by, rot]) => {
    const bus = new THREE.Group();
    const wp = cadToWorld(bx, by, 0.02);
    bus.position.set(wp.x, 0.02, wp.z);
    bus.rotation.y = rot;

    const hull = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.6, 2.35, 11.2)), matBusYellow);
    hull.position.y = 1.65;
    hull.castShadow = !isSoftwareGl;
    bus.add(hull);

    const windowBand = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.66, 0.95, 10.6)),
      matBusWindow
    );
    windowBand.position.y = 2.08;
    bus.add(windowBand);

    const roofCap = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.45, 0.35, 10.8)), matBusRoof);
    roofCap.position.y = 2.95;
    bus.add(roofCap);

    // 4 wheels
    const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.52, 0.52, 0.36, 12));
    for (const wx of [-1.25, 1.25]) {
      for (const wz of [-3.4, 3.4]) {
        const wMesh = new THREE.Mesh(wheelGeo, matTire);
        wMesh.rotation.z = Math.PI / 2;
        wMesh.position.set(wx, 0.52, wz);
        bus.add(wMesh);
      }
    }
    root.add(bus);
  });

  // Campus Tree Groves (Composite 2-layer InstancedMesh framing the L-wing like Fig. 1!)
  const treeCoords: Array<[number, number, number]> = [];
  // Dense lush parkland grove in the inner NE L-pocket (CAD x=225..580, y=-40..275)
  for (let gx = 235; gx <= 575; gx += 34) {
    for (let gy = -20; gy <= 265; gy += 36) {
      const jitterX = ((gx * 7 + gy * 13) % 19) - 9;
      const jitterY = ((gx * 11 + gy * 5) % 19) - 9;
      const scale = 0.85 + (((gx + gy) % 7) / 7) * 0.42;
      treeCoords.push([gx + jitterX, gy + jitterY, scale]);
    }
  }
  // West & North perimeter boulevard trees
  for (let gy = -40; gy <= 560; gy += 48) {
    treeCoords.push([-108, gy, 0.95 + ((gy % 5) / 10)]);
  }
  for (let gx = -80; gx <= 590; gx += 52) {
    // Leave Academic Block A3's grand front plaza & palm promenade unobstructed
    if (gx >= -45 && gx <= 325) continue;
    treeCoords.push([gx, -96, 1.0 + ((Math.abs(gx) % 5) / 12)]);
  }

  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.45, 3.6, 7));
  const crownGeoA = trackGeo(new THREE.DodecahedronGeometry(3.3, 1));
  const crownGeoB = trackGeo(new THREE.DodecahedronGeometry(2.4, 1));

  const matTrunk = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x5c4332, roughness: 0.92, metalness: 0.0 })
  );
  const matFoliage = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0.0 })
  );

  const trunkInst = new THREE.InstancedMesh(trunkGeo, matTrunk, treeCoords.length);
  const crownInstA = new THREE.InstancedMesh(crownGeoA, matFoliage, treeCoords.length);
  const crownInstB = new THREE.InstancedMesh(crownGeoB, matFoliage, treeCoords.length);

  const foliageGreens = [0x3d6b35, 0x4b7a3d, 0x2f5a2c, 0x5d8242, 0x3b6338];
  treeCoords.forEach(([tx, ty, sc], i) => {
    const wp = cadToWorld(tx, ty, 0);
    dummy.position.set(wp.x, 1.8 * sc, wp.z);
    dummy.rotation.set(0, i * 0.7, 0);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(wp.x, 5.2 * sc, wp.z);
    dummy.scale.set(sc * 1.15, sc * 0.92, sc * 1.15);
    dummy.updateMatrix();
    crownInstA.setMatrixAt(i, dummy.matrix);

    dummy.position.set(wp.x + 1.4 * sc, 6.8 * sc, wp.z - 0.9 * sc);
    dummy.scale.set(sc, sc * 0.85, sc);
    dummy.updateMatrix();
    crownInstB.setMatrixAt(i, dummy.matrix);

    tmpColor.setHex(foliageGreens[i % foliageGreens.length]);
    crownInstA.setColorAt(i, tmpColor);
    tmpColor.offsetHSL(0.01, 0.04, 0.06);
    crownInstB.setColorAt(i, tmpColor);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  crownInstA.instanceMatrix.needsUpdate = true;
  crownInstB.instanceMatrix.needsUpdate = true;
  if (crownInstA.instanceColor) crownInstA.instanceColor.needsUpdate = true;
  if (crownInstB.instanceColor) crownInstB.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  crownInstA.computeBoundingSphere();
  crownInstB.computeBoundingSphere();
  root.add(trunkInst, crownInstA, crownInstB);

  // Ornamental Potted Palms lining the North Central Promenade (clear of Mentor Helpdesks M-1 & M-2)
  const palmYs = [24, 50, 114, 152, 188, 258, 286];
  const planterGeo = trackGeo(new THREE.CylinderGeometry(0.62, 0.48, 0.85, 8));
  const palmCrownGeo = trackGeo(new THREE.ConeGeometry(1.5, 2.2, 7));
  const matPlanter = trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }));
  const matPalmLeaf = trackMat(new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.78 }));

  palmYs.forEach((py) => {
    const wp = cadToWorld(92, py, 0.19);
    const pot = new THREE.Mesh(planterGeo, matPlanter);
    pot.position.set(wp.x, 0.62, wp.z);
    const crown = new THREE.Mesh(palmCrownGeo, matPalmLeaf);
    crown.position.set(wp.x, 2.2, wp.z);
    crown.rotation.x = Math.PI;
    root.add(pot, crown);
  });

  // Campus Avenue Streetlamps along West Bus Lane & South Arrival Boulevard
  const lampCoordsCad: Array<[number, number]> = [
    [-22, 40], [-22, 130], [-22, 220], [-22, 310], [-22, 400], [-22, 490],
    [40, 588], [130, 588], [220, 588], [310, 588], [400, 588], [490, 588],
  ];
  const matStreetLampGlow = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.75,
      roughness: 0.25,
    })
  );
  const lampPoleInst = new THREE.InstancedMesh(
    trackGeo(new THREE.CylinderGeometry(0.09, 0.14, 7.6, 6)),
    matDarkSteel,
    lampCoordsCad.length
  );
  const lampHeadInst = new THREE.InstancedMesh(
    trackGeo(new THREE.SphereGeometry(0.32, 8, 6)),
    matStreetLampGlow,
    lampCoordsCad.length
  );
  lampCoordsCad.forEach(([lx, ly], idx) => {
    const wp = cadToWorld(lx, ly, 0);
    dummy.position.set(wp.x, 3.8, wp.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lampPoleInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(wp.x, 7.75, wp.z);
    dummy.updateMatrix();
    lampHeadInst.setMatrixAt(idx, dummy.matrix);
  });
  lampPoleInst.instanceMatrix.needsUpdate = true;
  lampHeadInst.instanceMatrix.needsUpdate = true;
  lampPoleInst.computeBoundingSphere();
  lampHeadInst.computeBoundingSphere();
  root.add(lampPoleInst, lampHeadInst);

  // Matching Chandigarh University Campus Academic Blocks framing the far west horizon
  const horizonBlocks: Array<{ cx: number; cy: number; w: number; d: number; h: number }> = [
    { cx: -190, cy: 115, w: 38, d: 66, h: 24 },
    { cx: -195, cy: 365, w: 42, d: 58, h: 21 },
  ];
  horizonBlocks.forEach((hb) => {
    const wp = cadToWorld(hb.cx, hb.cy, 0);
    const blk = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(hb.w, hb.h, hb.d)),
      [matBuildingWall, matBuildingWall, matRoofConcrete, matRoofConcrete, matBuildingWall, matBuildingWall]
    );
    blk.position.set(wp.x, hb.h / 2, wp.z);
    const cap = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(hb.w + 0.5, 1.0, hb.d + 0.5)),
      matCuConcreteWhite
    );
    cap.position.set(wp.x, hb.h + 0.5, wp.z);
    root.add(blk, cap);
  });

  // Queued Arriving Builders lined up outside Express QR Gates A & B
  const queuePoints: Array<[number, number]> = [];
  for (let lane = 0; lane < 8; lane++) {
    for (let row = 0; row < 3; row++) {
      queuePoints.push([68 + lane * 9, -25 - row * 6]); // Gate A queue
      queuePoints.push([286 + lane * 11, 578 + row * 6]); // Gate B queue
    }
  }
  const qTorsoInst = new THREE.InstancedMesh(standTorsoGeo, matBuilderTorso, queuePoints.length);
  const qHeadInst = new THREE.InstancedMesh(standHeadGeo, matBuilderHead, queuePoints.length);
  queuePoints.forEach(([qx, qy], idx) => {
    const wp = cadToWorld(qx, qy, 0.04);
    dummy.position.set(wp.x, 1.02, wp.z);
    dummy.rotation.set(0, qy < 0 ? 0 : Math.PI, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    qTorsoInst.setMatrixAt(idx, dummy.matrix);
    tmpColor.setHex(shirtPalette[(idx * 7) % shirtPalette.length]);
    qTorsoInst.setColorAt(idx, tmpColor);

    dummy.position.set(wp.x, 1.52, wp.z);
    dummy.updateMatrix();
    qHeadInst.setMatrixAt(idx, dummy.matrix);
  });
  qTorsoInst.instanceMatrix.needsUpdate = true;
  if (qTorsoInst.instanceColor) qTorsoInst.instanceColor.needsUpdate = true;
  qHeadInst.instanceMatrix.needsUpdate = true;
  qTorsoInst.computeBoundingSphere();
  qHeadInst.computeBoundingSphere();
  root.add(qTorsoInst, qHeadInst);

  // ---------------------------------------------------------------------------
  // 16B. 8 PLAYABLE WALKABLE EXPLORER CHARACTERS & INTERACTIVE 3D HOLOGRAM POINTS
  // ---------------------------------------------------------------------------
  const explorerAreas = buildExplorerAreas(tracks);
  const explorerGroup = new THREE.Group();
  explorerGroup.name = 'PlayableExplorersAndHolograms';
  root.add(explorerGroup);

  const matHitboxInvisible = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  const matExplorerPants = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x162235, roughness: 0.78, metalness: 0.08 })
  );
  const matExplorerShoe = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.52, metalness: 0.05 })
  );
  const matExplorerSkin = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xe6b692, roughness: 0.62, metalness: 0.04 })
  );
  const matExplorerHair = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, metalness: 0.05 })
  );
  const matExplorerPack = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65, metalness: 0.25 })
  );
  const matExplorerVisor = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x2dd4bf,
      emissiveIntensity: 1.4,
      roughness: 0.18,
      metalness: 0.5,
    })
  );
  const matLanyard = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x5eead4,
      emissiveIntensity: 0.45,
      roughness: 0.35,
    })
  );
  const matPlinthSteel = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x132030, roughness: 0.42, metalness: 0.72 })
  );
  const matHoloLens = trackMat(
    new THREE.MeshBasicMaterial({ color: 0x5eead4 })
  );
  const matHoloFrame = trackMat(
    new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.92 })
  );
  const matHoloHalo = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

  // Shared geometries for all 8 playable characters & 8 hologram points
  const legGeo = trackGeo(new THREE.BoxGeometry(0.17, 0.68, 0.20));
  const shoeGeo = trackGeo(new THREE.BoxGeometry(0.19, 0.13, 0.29));
  const torsoGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.62, 0.28));
  const lanyardGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.19, 0.03));
  const packGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.42, 0.17));
  const packStripGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.05, 0.025));
  const armGeo = trackGeo(new THREE.BoxGeometry(0.13, 0.54, 0.15));
  const headGeo = trackGeo(new THREE.SphereGeometry(0.165, 14, 12));
  const hairGeo = trackGeo(new THREE.SphereGeometry(0.174, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58));
  const visorGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.055, 0.08));
  const markerDiamondGeo = trackGeo(new THREE.OctahedronGeometry(0.22, 0));
  const charRingGeo = trackGeo(new THREE.RingGeometry(0.52, 0.74, 28));
  const charInnerDiscGeo = trackGeo(new THREE.CircleGeometry(0.52, 24));
  const charHitGeo = trackGeo(new THREE.CylinderGeometry(0.92, 0.92, 2.6, 10));

  const plinthGeo = trackGeo(new THREE.CylinderGeometry(1.18, 1.38, 0.24, 6));
  const emitterCoreGeo = trackGeo(new THREE.CylinderGeometry(0.34, 0.46, 0.32, 8));
  const emitterLensGeo = trackGeo(new THREE.CircleGeometry(0.30, 20));
  const holoOuterRingGeo = trackGeo(new THREE.RingGeometry(1.36, 1.62, 32));
  const holoInnerRingGeo = trackGeo(new THREE.RingGeometry(0.74, 0.96, 32));
  const holoBeamGeo = trackGeo(new THREE.CylinderGeometry(1.12, 0.36, 1.15, 18, 1, true));
  const holoCrystalGeo = trackGeo(new THREE.OctahedronGeometry(0.34, 0));
  const holoBeaconSignGeo = trackGeo(new THREE.PlaneGeometry(2.8, 0.88));
  const holoScreenPlaneGeo = trackGeo(new THREE.PlaneGeometry(5.5, 3.45));
  const holoHaloPlaneGeo = trackGeo(new THREE.PlaneGeometry(5.8, 3.75));
  const holoFrameTopGeo = trackGeo(new THREE.BoxGeometry(5.62, 0.08, 0.05));
  const holoFrameSideGeo = trackGeo(new THREE.BoxGeometry(0.08, 3.57, 0.05));
  const holoHitGeo = trackGeo(new THREE.CylinderGeometry(1.65, 1.65, 3.8, 10));

  interface ExplorerRig {
    area: ExplorerAreaConfig;
    rootGroup: THREE.Group;
    leftLegPivot: THREE.Group;
    rightLegPivot: THREE.Group;
    leftArmPivot: THREE.Group;
    rightArmPivot: THREE.Group;
    bodyGroup: THREE.Group;
    markerMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    discMat: THREE.MeshBasicMaterial;
    markerMat: THREE.MeshBasicMaterial;
  }

  interface HologramRig {
    area: ExplorerAreaConfig;
    baseGroup: THREE.Group;
    beamMat: THREE.MeshBasicMaterial;
    crystalMesh: THREE.Mesh;
    beaconSignMesh: THREE.Mesh;
    screenGroup: THREE.Group;
    currentScale: number;
  }

  const explorerRigs = new Map<ExplorerAreaId, ExplorerRig>();
  const hologramRigs = new Map<ExplorerAreaId, HologramRig>();

  explorerAreas.forEach((area) => {
    const accentColor = new THREE.Color(area.accentHex);

    // --- A. Playable Articulated Explorer Character ---
    const charRoot = new THREE.Group();
    charRoot.name = `Explorer_${area.id}`;
    charRoot.position.set(area.spawnPos.x, 0.17, area.spawnPos.z);
    charRoot.rotation.y = area.spawnYawRad;
    explorerGroup.add(charRoot);

    const ringMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      })
    );
    const ringMesh = new THREE.Mesh(charRingGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.03;
    charRoot.add(ringMesh);

    const discMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const discMesh = new THREE.Mesh(charInnerDiscGeo, discMat);
    discMesh.rotation.x = -Math.PI / 2;
    discMesh.position.y = 0.025;
    charRoot.add(discMesh);

    const bodyGroup = new THREE.Group();
    charRoot.add(bodyGroup);

    const hoodieMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.28,
        roughness: 0.55,
        metalness: 0.12,
      })
    );

    // Legs with hip pivots
    const makeLeg = (xOff: number): THREE.Group => {
      const pivot = new THREE.Group();
      pivot.position.set(xOff, 0.78, 0);
      const legMesh = new THREE.Mesh(legGeo, matExplorerPants);
      legMesh.position.set(0, -0.34, 0);
      const shoeMesh = new THREE.Mesh(shoeGeo, matExplorerShoe);
      shoeMesh.position.set(0, -0.71, 0.05);
      pivot.add(legMesh, shoeMesh);
      bodyGroup.add(pivot);
      return pivot;
    };
    const leftLegPivot = makeLeg(-0.13);
    const rightLegPivot = makeLeg(0.13);

    // Torso, badge lanyard, and glowing tech backpack
    const torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
    torsoMesh.position.set(0, 1.11, 0);
    const lanyardMesh = new THREE.Mesh(lanyardGeo, matLanyard);
    lanyardMesh.position.set(0, 1.13, 0.15);
    const packMesh = new THREE.Mesh(packGeo, matExplorerPack);
    packMesh.position.set(0, 1.13, -0.21);
    const packStrip = new THREE.Mesh(packStripGeo, matExplorerVisor);
    packStrip.position.set(0, 1.24, -0.30);
    bodyGroup.add(torsoMesh, lanyardMesh, packMesh, packStrip);

    // Arms with shoulder pivots
    const makeArm = (xOff: number): THREE.Group => {
      const pivot = new THREE.Group();
      pivot.position.set(xOff, 1.37, 0);
      const armMesh = new THREE.Mesh(armGeo, hoodieMat);
      armMesh.position.set(0, -0.25, 0);
      pivot.add(armMesh);
      bodyGroup.add(pivot);
      return pivot;
    };
    const leftArmPivot = makeArm(-0.31);
    const rightArmPivot = makeArm(0.31);

    // Head, hair cap, and glowing AR visor
    const headMesh = new THREE.Mesh(headGeo, matExplorerSkin);
    headMesh.position.set(0, 1.63, 0);
    const hairMesh = new THREE.Mesh(hairGeo, matExplorerHair);
    hairMesh.position.set(0, 1.645, -0.01);
    const visorMesh = new THREE.Mesh(visorGeo, matExplorerVisor);
    visorMesh.position.set(0, 1.64, 0.135);
    bodyGroup.add(headMesh, hairMesh, visorMesh);

    // Overhead glowing diamond marker so every area explorer is clearly spotted
    const markerMat = trackMat(
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.92 })
    );
    const markerMesh = new THREE.Mesh(markerDiamondGeo, markerMat);
    markerMesh.position.set(0, 2.38, 0);
    charRoot.add(markerMesh);

    // Clickable hitbox to switch into this explorer
    const charHitbox = new THREE.Mesh(charHitGeo, matHitboxInvisible);
    charHitbox.position.set(0, 1.3, 0);
    charHitbox.userData.explorerAreaId = area.id;
    charRoot.add(charHitbox);
    interactables.push(charHitbox);

    explorerRigs.set(area.id, {
      area,
      rootGroup: charRoot,
      leftLegPivot,
      rightLegPivot,
      leftArmPivot,
      rightArmPivot,
      bodyGroup,
      markerMesh,
      ringMat,
      discMat,
      markerMat,
    });

    // --- B. Interactive 3D Hologram Information Point ---
    const holoBase = new THREE.Group();
    holoBase.name = `HologramPoint_${area.id}`;
    holoBase.position.set(area.hologramPos.x, 0.17, area.hologramPos.z);
    explorerGroup.add(holoBase);

    const plinthMesh = new THREE.Mesh(plinthGeo, matPlinthSteel);
    plinthMesh.position.y = 0.12;
    const coreMesh = new THREE.Mesh(emitterCoreGeo, matPlinthSteel);
    coreMesh.position.y = 0.36;
    const lensMesh = new THREE.Mesh(emitterLensGeo, matHoloLens);
    lensMesh.rotation.x = -Math.PI / 2;
    lensMesh.position.y = 0.53;
    holoBase.add(plinthMesh, coreMesh, lensMesh);

    const outerRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      })
    );
    const outerRing = new THREE.Mesh(holoOuterRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.035;

    const innerRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      })
    );
    const innerRing = new THREE.Mesh(holoInnerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.25;
    holoBase.add(outerRing, innerRing);

    const beamMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const beamMesh = new THREE.Mesh(holoBeamGeo, beamMat);
    beamMesh.position.y = 0.98;
    beamMesh.renderOrder = 2;
    holoBase.add(beamMesh);

    const crystalMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x5eead4,
        emissive: 0x14b8a6,
        emissiveIntensity: 1.55,
        roughness: 0.15,
        metalness: 0.35,
        transparent: true,
        opacity: 0.9,
      })
    );
    const crystalMesh = new THREE.Mesh(holoCrystalGeo, crystalMat);
    crystalMesh.position.y = 1.45;
    holoBase.add(crystalMesh);

    const beaconSignMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: textures.hologramBeaconSign,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const beaconSignMesh = new THREE.Mesh(holoBeaconSignGeo, beaconSignMat);
    beaconSignMesh.position.y = 2.55;
    beaconSignMesh.rotation.y = Math.atan2(
      area.spawnPos.x - area.hologramPos.x,
      area.spawnPos.z - area.hologramPos.z
    );
    holoBase.add(beaconSignMesh);

    // Rising 3D Floating Hologram Information Screen (revealed when explorer walks near!)
    const screenGroup = new THREE.Group();
    screenGroup.position.y = 3.3;
    screenGroup.visible = false;
    screenGroup.scale.set(0.01, 0.01, 0.01);
    holoBase.add(screenGroup);

    const panelTex = textures.hologramPanels.get(area.id) ?? null;
    const screenMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: panelTex,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const screenPlane = new THREE.Mesh(holoScreenPlaneGeo, screenMat);
    screenPlane.renderOrder = 6;
    const haloPlane = new THREE.Mesh(holoHaloPlaneGeo, matHoloHalo);
    haloPlane.position.z = -0.04;
    haloPlane.renderOrder = 4;

    const topBar = new THREE.Mesh(holoFrameTopGeo, matHoloFrame);
    topBar.position.y = 1.76;
    const bottomBar = new THREE.Mesh(holoFrameTopGeo, matHoloFrame);
    bottomBar.position.y = -1.76;
    const leftBar = new THREE.Mesh(holoFrameSideGeo, matHoloFrame);
    leftBar.position.x = -2.78;
    const rightBar = new THREE.Mesh(holoFrameSideGeo, matHoloFrame);
    rightBar.position.x = 2.78;

    screenGroup.add(haloPlane, screenPlane, topBar, bottomBar, leftBar, rightBar);

    const holoHitbox = new THREE.Mesh(holoHitGeo, matHitboxInvisible);
    holoHitbox.position.y = 1.9;
    holoHitbox.userData.hologramAreaId = area.id;
    holoBase.add(holoHitbox);
    interactables.push(holoHitbox);

    hologramRigs.set(area.id, {
      area,
      baseGroup: holoBase,
      beamMat,
      crystalMesh,
      beaconSignMesh,
      screenGroup,
      currentScale: 0,
    });
  });

  const updateExplorerCharacter = (
    areaId: ExplorerAreaId,
    x: number,
    z: number,
    facingYawRad: number,
    walkCyclePhase: number,
    isMoving: boolean
  ) => {
    const rig = explorerRigs.get(areaId);
    if (!rig) return;
    rig.rootGroup.position.set(x, 0.17, z);
    rig.rootGroup.rotation.y = facingYawRad;

    const stride = isMoving ? Math.sin(walkCyclePhase) : 0;
    const bounce = isMoving ? Math.abs(Math.sin(walkCyclePhase)) * 0.065 : 0;
    rig.leftLegPivot.rotation.x = stride * 0.62;
    rig.rightLegPivot.rotation.x = -stride * 0.62;
    rig.leftArmPivot.rotation.x = -stride * 0.54;
    rig.rightArmPivot.rotation.x = stride * 0.54;
    rig.bodyGroup.position.y = bounce;
  };

  const setActiveExplorerArea = (activeAreaId: ExplorerAreaId | null) => {
    explorerRigs.forEach((rig, id) => {
      const isActive = id === activeAreaId;
      rig.ringMat.color.set(isActive ? 0x5eead4 : rig.area.accentHex);
      rig.ringMat.opacity = isActive ? 0.96 : 0.48;
      rig.discMat.opacity = isActive ? 0.28 : 0.12;
      rig.markerMat.color.set(isActive ? 0x5eead4 : rig.area.accentHex);
      rig.markerMesh.scale.setScalar(isActive ? 1.25 : 0.85);
    });
  };

  const setExplorerVisibility = (hiddenAreaId: ExplorerAreaId | null, hiddenInFpp: boolean) => {
    explorerRigs.forEach((rig, id) => {
      rig.rootGroup.visible = !(hiddenInFpp && id === hiddenAreaId);
    });
  };

  const updateHologramState = (
    activeHologramId: ExplorerAreaId | null,
    lookAtPos: { x: number; z: number },
    elapsedSec: number,
    instant = false
  ) => {
    explorerRigs.forEach((rig, id) => {
      rig.markerMesh.visible = id !== activeHologramId;
      rig.markerMesh.position.y = 2.38 + Math.sin(elapsedSec * 3.0 + id.length) * 0.11;
      rig.markerMesh.rotation.y = elapsedSec * 1.4;
    });

    hologramRigs.forEach((rig, id) => {
      const isOpen = id === activeHologramId;
      const targetScale = isOpen ? 1 : 0;
      rig.currentScale = instant
        ? targetScale
        : THREE.MathUtils.lerp(rig.currentScale, targetScale, 0.18);

      rig.crystalMesh.rotation.y = elapsedSec * (isOpen ? 2.4 : 1.1);
      rig.crystalMesh.position.y = (isOpen ? 1.05 : 1.38) + Math.sin(elapsedSec * 2.5) * 0.07;
      rig.beamMat.opacity = isOpen ? 0.2 : 0.14;

      // Keep the floating beacon sign gently facing the active explorer / viewer
      const faceYaw = Math.atan2(
        lookAtPos.x - rig.area.hologramPos.x,
        lookAtPos.z - rig.area.hologramPos.z
      );
      rig.beaconSignMesh.rotation.y = faceYaw;
      rig.beaconSignMesh.visible = !isOpen;

      if (rig.currentScale > 0.03) {
        rig.screenGroup.visible = true;
        rig.screenGroup.scale.set(
          rig.currentScale,
          Math.max(0.05, rig.currentScale),
          rig.currentScale
        );
        rig.screenGroup.rotation.y = faceYaw;
        rig.screenGroup.position.y = 3.3 + Math.sin(elapsedSec * 1.8) * 0.05;
      } else {
        rig.screenGroup.visible = false;
      }
    });
  };

  // ---------------------------------------------------------------------------
  // 17. LIVE STATE UPDATERS (LIGHTING MOOD, ROOF MODE, OVERLAYS, TRACK HIGHLIGHT)
  // ---------------------------------------------------------------------------
  let activeLightingMood: LightingMoodId = 'night-keynote';
  let activeSelectedTrackId: string | null = null;

  const applyLightingMood = (moodId: LightingMoodId) => {
    activeLightingMood = moodId;
    const cfg = LIGHTING_MOODS[moodId];

    // Update sky dome texture smoothly
    const nextSky = createSkyGradientTexture(cfg.skyTopHex, cfg.skyHorizonHex);
    extraTextures.push(nextSky);
    skyMat.map = nextSky;
    skyMat.needsUpdate = true;

    scene.background = new THREE.Color(cfg.fogHex);
    scene.fog = new THREE.FogExp2(cfg.fogHex, cfg.fogDensity);

    sunLight.color.setHex(cfg.sunColor);
    sunLight.intensity = cfg.sunIntensity;
    sunLight.position.set(cfg.sunPosition.x, cfg.sunPosition.y, cfg.sunPosition.z);

    hemiLight.color.setHex(cfg.hemiSkyColor);
    hemiLight.groundColor.setHex(cfg.hemiGroundColor);
    hemiLight.intensity = cfg.hemiIntensity;

    rimLight.color.setHex(cfg.rimColor);
    rimLight.intensity = cfg.rimIntensity;

    renderer.toneMappingExposure = cfg.exposure;
    scene.environmentIntensity =
      moodId === 'night-keynote' ? 0.24 : moodId === 'golden-hour' ? 0.82 : 1.0;
    stageLedMat.emissiveIntensity = cfg.stageLedEmissive;
    imagLedMat.emissiveIntensity = cfg.stageLedEmissive;

    stageGlowLight.intensity = moodId === 'night-keynote' ? 32 : moodId === 'golden-hour' ? 16 : 6;
    northWingLight.intensity = cfg.interiorLampIntensity * 16;
    centralArenaLight.intensity = cfg.interiorLampIntensity * 20;
    hardwareWingLight.intensity = cfg.interiorLampIntensity * 12;

    matWarmInterior.emissiveIntensity = moodId === 'night-keynote' ? 1.15 : 0.38;
    matLaptopGlow.emissiveIntensity = moodId === 'night-keynote' ? 1.4 : 0.65;
    matHighBayLed.emissiveIntensity =
      moodId === 'night-keynote' ? 1.85 : moodId === 'golden-hour' ? 0.95 : 0.35;
    matStreetLampGlow.emissiveIntensity =
      moodId === 'night-keynote' ? 1.9 : moodId === 'golden-hour' ? 0.85 : 0.2;

    // Chandigarh University Academic Block A3 architectural facade & rooftop illumination
    const isNight = moodId === 'night-keynote';
    const isGolden = moodId === 'golden-hour';
    matCuConcreteWhite.emissiveIntensity = isNight ? 0.22 : isGolden ? 0.06 : 0.02;
    matCuA3Front.emissiveIntensity = isNight ? 0.42 : isGolden ? 0.14 : 0.04;
    matCuA3Side.emissiveIntensity = isNight ? 0.42 : isGolden ? 0.14 : 0.04;
    matCuA3Overhang.emissiveIntensity = isNight ? 0.42 : isGolden ? 0.14 : 0.04;
    matBuildingWall.emissiveIntensity = isNight ? 0.34 : isGolden ? 0.1 : 0.03;
    matCuRoofSign.emissiveIntensity = isNight ? 1.25 : isGolden ? 0.55 : 0.22;
    matCuA3Plaque.emissiveIntensity = isNight ? 0.9 : isGolden ? 0.36 : 0.12;
    matCuMural.emissiveIntensity = isNight ? 0.38 : isGolden ? 0.14 : 0.04;
    matCuCafeSign.emissiveIntensity = isNight ? 0.85 : isGolden ? 0.32 : 0.1;
    matCuLobbyGlow.emissiveIntensity = isNight ? 0.95 : isGolden ? 0.45 : 0.15;

    stageBeamMats.forEach((m) => {
      m.opacity = cfg.stageBeamOpacity;
    });

    trackGantriesAndHighlight: {
      trackGantryMats.forEach((m, id) => {
        m.emissiveIntensity =
          activeSelectedTrackId === id ? cfg.gantryEmissive + 0.55 : cfg.gantryEmissive;
      });
      break trackGantriesAndHighlight;
    }
  };

  const applyRoofMode = (roofMode: RoofModeId) => {
    if (roofMode === 'translucent') {
      trussGroup.visible = true;
      roofMembraneGroup.visible = true;
      matRoofMembrane.opacity = 0.44;
    } else if (roofMode === 'truss-only') {
      trussGroup.visible = true;
      roofMembraneGroup.visible = false;
    } else {
      // open-cutaway: hides both canopy & overhead trusses for clean 6,200-seat inspection
      trussGroup.visible = false;
      roofMembraneGroup.visible = false;
    }
  };

  const applyOverlayMode = (overlayMode: OverlayModeId) => {
    if (overlayMode === 'tracks') {
      trackZoneGroup.visible = true;
      sightlinesGroup.visible = false;
    } else if (overlayMode === 'sightlines') {
      trackZoneGroup.visible = true;
      sightlinesGroup.visible = true;
    } else {
      trackZoneGroup.visible = false;
      sightlinesGroup.visible = false;
    }
  };

  const setSelectedTrack = (trackId: string | null) => {
    activeSelectedTrackId = trackId;
    const cfg = LIGHTING_MOODS[activeLightingMood];

    trackHighlightRails.forEach((mat, id) => {
      mat.emissiveIntensity = id === trackId ? 1.65 : 0.42;
    });
    trackFloorMats.forEach((mat, id) => {
      if (!trackId) {
        mat.opacity = 0.72;
      } else {
        mat.opacity = id === trackId ? 0.92 : 0.36;
      }
    });
    trackGantryMats.forEach((mat, id) => {
      mat.emissiveIntensity = id === trackId ? cfg.gantryEmissive + 0.55 : cfg.gantryEmissive;
    });
  };

  // Initialize defaults — Night Keynote lighting by default
  applyLightingMood('night-keynote');
  applyRoofMode('translucent');
  applyOverlayMode('tracks');
  setActiveExplorerArea('stage-plaza');

  return {
    root,
    interactables,
    explorerAreas,
    applyLightingMood,
    applyRoofMode,
    applyOverlayMode,
    setSelectedTrack,
    updateExplorerCharacter,
    setActiveExplorerArea,
    setExplorerVisibility,
    updateHologramState,
    dispose: () => {
      scene.remove(root);
      scene.remove(skyDome);
      scene.remove(hemiLight, sunLight, rimLight, stageGlowLight, northWingLight, centralArenaLight, hardwareWingLight);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      extraTextures.forEach((t) => t.dispose());
    },
  };
}
