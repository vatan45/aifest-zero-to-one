import { TrackDepartment, calculateTrackMetrics } from '../utils/hackathonModel';
import { Vec3Tuple, cadToWorld } from './arenaLayoutMath';

export type ExplorerAreaId =
  | 'stage-plaza'
  | 'aim'
  | 'ait'
  | 'cse'
  | 'uie'
  | 'tbi-builder'
  | 'robotics-mechatronics'
  | 'sponsor-vc-hub';

export interface ExplorerAreaConfig {
  id: ExplorerAreaId;
  shortName: string;
  title: string;
  zoneBadge: string;
  accentHex: string;
  spawnPos: Vec3Tuple;
  spawnYawRad: number;
  hologramPos: Vec3Tuple;
  trackSummary: {
    trackLabel: string;
    leadDepartment: string;
    buildersCount: string;
    registrationsCount: string;
    teamsCount: string;
    themes: string[];
  };
  mentorSummary: {
    mentorsCount: string;
    judgesCount: string;
    helpdeskLocation: string;
    expertise: string[];
  };
  sponsorSummary: {
    poolLakhs: string;
    boothIds: string;
    partnerProfiles: string[];
    builderPerks: string;
  };
  opsNotes: string;
}

export interface CharacterMotionState {
  x: number;
  z: number;
  facingYawRad: number;
  walkCyclePhase: number;
  isMoving: boolean;
}

export interface CharacterMoveInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export const HOLOGRAM_TRIGGER_RADIUS_M = 6.8;

/**
 * Builds all 8 playable walkable areas across the Bus Parking Hackathon Arena,
 * dynamically pulling live single-source-of-truth metrics from the 6 unified tracks.
 */
export function buildExplorerAreas(tracks: TrackDepartment[]): ExplorerAreaConfig[] {
  const byId = new Map(tracks.map((t) => [t.id, t]));
  const totalBuilders = tracks.reduce((acc, t) => acc + t.showUpTarget, 0);
  const totalReg = tracks.reduce((acc, t) => acc + calculateTrackMetrics(t).registrationTarget, 0);
  const totalTeams = tracks.reduce((acc, t) => acc + calculateTrackMetrics(t).teamsCount, 0);

  const makeTrackArea = (
    trackId: ExplorerAreaId,
    shortName: string,
    spawnCad: [number, number],
    holoCad: [number, number],
    boothIds: string,
    helpdeskLocation: string,
    mentorExpertise: string[],
    builderPerks: string
  ): ExplorerAreaConfig => {
    const t = byId.get(trackId) ?? tracks[0];
    const m = calculateTrackMetrics(t);
    const spawnPos = cadToWorld(spawnCad[0], spawnCad[1], 0.17);
    const hologramPos = cadToWorld(holoCad[0], holoCad[1], 0.17);
    const spawnYawRad = Math.atan2(hologramPos.x - spawnPos.x, hologramPos.z - spawnPos.z);

    return {
      id: trackId,
      shortName,
      title: `Track ${t.trackNumber}: ${t.trackShortName} (${t.departmentShort})`,
      zoneBadge: t.arenaZoneLabel,
      accentHex: t.zoneStroke,
      spawnPos,
      spawnYawRad,
      hologramPos,
      trackSummary: {
        trackLabel: `Track ${t.trackNumber} · ${t.trackShortName}`,
        leadDepartment: t.departmentFull,
        buildersCount: `${m.showUpTarget.toLocaleString()} Confirmed Builders`,
        registrationsCount: `${m.registrationTarget.toLocaleString()} Unified Registrations`,
        teamsCount: `${m.teamsCount} Teams · ${t.footprintSqFt.toLocaleString()} sq ft`,
        themes: t.focusThemes,
      },
      mentorSummary: {
        mentorsCount: `${m.mentorsRequired} Active Mentors (1:5 teams)`,
        judgesCount: `${m.judgesRequired} Senior Technical Judges`,
        helpdeskLocation,
        expertise: mentorExpertise,
      },
      sponsorSummary: {
        poolLakhs: `₹${t.sponsorTargetLakhs} Lakhs Track Pool`,
        boothIds,
        partnerProfiles: t.sponsorTargetProfiles,
        builderPerks,
      },
      opsNotes: t.infrastructureNotes,
    };
  };

  const stageSpawn = cadToWorld(142, 350, 0.17);
  const stageHolo = cadToWorld(112, 382, 0.17);
  const sponsorSpawn = cadToWorld(212, 434, 0.17);
  const sponsorHolo = cadToWorld(186, 352, 0.17);

  return [
    {
      id: 'stage-plaza',
      shortName: 'Center Stage',
      title: '45° Zero to One Center Stage & FOH Broadcast Plaza',
      zoneBadge: 'SW 45° Junction · Dual-Wing Focal Heart',
      accentHex: '#14B8A6',
      spawnPos: stageSpawn,
      spawnYawRad: Math.atan2(stageHolo.x - stageSpawn.x, stageHolo.z - stageSpawn.z),
      hologramPos: stageHolo,
      trackSummary: {
        trackLabel: 'All 6 Unified Flagship Tracks',
        leadDepartment: 'Chandigarh University · TBI · Student Innovation Cell (iEDC)',
        buildersCount: `${totalBuilders.toLocaleString()}+ Confirmed Builders`,
        registrationsCount: `${totalReg.toLocaleString()} Unified Registrations`,
        teamsCount: `${totalTeams.toLocaleString()} Teams · 183,700 sq ft L-Arena`,
        themes: [
          '45° chamfered stage projects simultaneous unobstructed sightlines to both North & Central Wings',
          'Twin 24:00:00 Live IMAG LED wings, broadcast camera jib crane & FOH AV Command Console',
          'Inaugural Keynote, Midnight Fireside, Top-18 Grand Finale & Guinness World Record Audit',
        ],
      },
      mentorSummary: {
        mentorsCount: '248 Industry & Faculty Mentors across 6 bays',
        judgesCount: '62 Senior Judges + 15 Active VC Partners',
        helpdeskLocation: 'Dual VIP & Speaker Green Rooms behind Stage + FOH Ops',
        expertise: ['Keynote Dignitaries', 'Guinness Audit Panel', 'Grand Finale Jury'],
      },
      sponsorSummary: {
        poolLakhs: '₹150 Lakhs Consolidated Flagship Pool',
        boothIds: 'Main Stage Title Lockup · IMAG Wings · SP-1 & SP-2 Flagship',
        partnerProfiles: ['Title AI Cloud Partner (₹40L)', 'Co-Powered GPU Labs (₹25L)', 'Broadcast & Media Partners'],
        builderPerks: 'Live stage shoutouts, ₹25L grand prize distribution, VIP networking & press coverage.',
      },
      opsNotes:
        'Backed by dual glass VIP Green Rooms, 24/7 Medical Bay + Emergency Ambulance, and 1,050 kVA synchronized acoustic DG yard.',
    },
    makeTrackArea(
      'ait',
      'Zone B · AIT',
      [101, 214],
      [101, 180],
      'SP-1 (AI Cloud) · SP-2 (GPU Labs)',
      'Mentor Helpdesk M-2 (North Promenade · 12m away)',
      ['Multi-Agent LLM Orchestration', 'RAG & Vector Search Architects', 'Multimodal Voice/Vision Leads'],
      'Free LLM API keys, H100/A100 sandbox GPU vouchers & fast-track AI enterprise interviews.'
    ),
    makeTrackArea(
      'aim',
      'Zone A · AIM',
      [82, 212],
      [72, 184],
      'SP-5 (MarTech & Growth Partner)',
      'Mentor Helpdesk M-1 & M-2 (North Promenade)',
      ['AI Performance Marketing Directors', 'Brand & Creator Economy Founders', 'Conversion Analytics Leads'],
      'Live ad-analytics sandboxes, MarTech SaaS licenses & direct agency placement challenges.'
    ),
    makeTrackArea(
      'cse',
      'Zone C · CSE',
      [252, 418],
      [256, 396],
      'SP-3 (DevTools & Cloud Partner)',
      'Central Promenade Roaming Architecture Desk',
      ['Principal Cloud Architects', 'Kubernetes & DevOps Staff Engineers', 'DPI / FinTech System Leads'],
      '$500+ team cloud credits, instant CI/CD hosting, observability suites & GitHub/DevTools swag.'
    ),
    makeTrackArea(
      'uie',
      'Zone D · UIE',
      [376, 418],
      [376, 396],
      'SP-4 (Silicon & Edge Compute Partner)',
      'East Central Promenade Systems Desk',
      ['Embedded & Edge AI Engineers', 'Cyber-Physical & HPC Specialists', 'Compiler & Low-Latency Mentors'],
      'Edge NPU dev kits, benchmark compute clusters & industrial R&D problem statements.'
    ),
    makeTrackArea(
      'tbi-builder',
      'Zone E · TBI',
      [316, 444],
      [322, 466],
      'TBI VC Pitch Pod + Venture Syndicate',
      'TBI VC Pitch Pavilion (CAD 156, 316) & South Promenade',
      ['15 Active VC Partners & Angel Investors', 'YC / Tier-1 Startup Founders', 'GTM & IP Legal Mentors'],
      'Direct seed-pitch slots inside the Glass VC Pod, TBI zero-equity incubation & ₹18L startup grants.'
    ),
    makeTrackArea(
      'robotics-mechatronics',
      'Zone F · Hardware',
      [518, 514],
      [540, 510],
      'SP-6 (Robotics & Hardware Kit Partner)',
      'Robotics Testing Pit Safety Desk & Tool Crib',
      ['Mechatronics & Kinematics Engineers', 'PCB & ROS2 Autonomy Mentors', '3-Phase Power Safety Marshals'],
      'Dedicated 3-phase campus building power, soldering/oscilloscope benches, 25×20 ft rover pit & sensor kits.'
    ),
    {
      id: 'sponsor-vc-hub',
      shortName: 'Sponsors & VCs',
      title: 'Sponsor Boulevard (SP-1..SP-6) & Glass TBI VC Pitch Hub',
      zoneBadge: '18 ft Main Promenade & L-Junction Pavilion',
      accentHex: '#2563EB',
      spawnPos: sponsorSpawn,
      spawnYawRad: Math.atan2(sponsorHolo.x - sponsorSpawn.x, sponsorHolo.z - sponsorSpawn.z),
      hologramPos: sponsorHolo,
      trackSummary: {
        trackLabel: '6 Flagship Sponsor Booths + 15-VC Glass Pitch Pavilion',
        leadDepartment: 'TBI Partnerships, Corporate Relations & Sponsor Ops',
        buildersCount: '6,200+ Builders High-Footfall Corridor',
        registrationsCount: '105,000+ Digital Brand Impressions',
        teamsCount: '24h Continuous Demo, Recruiting & Seed-Pitch Hub',
        themes: [
          'SP-1 AI Cloud, SP-2 GPU Labs, SP-3 DevTools, SP-4 Silicon, SP-5 MarTech & SP-6 Robotics',
          'Sound-insulated glass TBI VC Pitch Pod hosting 1-on-1 startup pitches for Top TBI teams',
          'Flanked by 4 continuous 24-hour Coffee & Hydration Stations powering overnight sprints',
        ],
      },
      mentorSummary: {
        mentorsCount: '45+ Sponsor DevRel Engineers & Solution Architects',
        judgesCount: '15 VC Partners + 12 Sponsor Track Jury Leads',
        helpdeskLocation: 'Glass TBI VC Pitch Pod (CAD 156, 316) & SP-1..SP-6 Counters',
        expertise: ['Sponsor API & SDK DevRel', 'Seed Funding & Term Sheets', 'Direct Campus Hiring'],
      },
      sponsorSummary: {
        poolLakhs: '₹150 Lakhs Total Target (₹40L Title · ₹25L Co-Powered · ₹60L Tracks)',
        boothIds: 'SP-1 · SP-2 · SP-3 · SP-4 · SP-5 · SP-6 + VC Pitch Pod',
        partnerProfiles: ['AI Hyperscalers', 'GPU & Silicon Vendors', 'DevTools', 'Tier-1 Venture Funds'],
        builderPerks: 'Instant API credit onboarding, hardware loaner kits, 24h espresso bar & on-spot hiring interviews.',
      },
      opsNotes:
        'Positioned along the 18 ft East-West Promenade connecting all Central & North wings with dedicated Wi-Fi 6E access masts.',
    },
  ];
}

/**
 * Clamps a walkable character safely inside the Bus Parking Arena footprint.
 */
export function clampExplorerToArena(x: number, z: number): { x: number; z: number } {
  const minX = cadToWorld(-35, 0, 0).x;
  const maxX = cadToWorld(585, 0, 0).x;
  const minZ = cadToWorld(0, -18, 0).z;
  const maxZ = cadToWorld(0, 585, 0).z;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    z: Math.max(minZ, Math.min(maxZ, z)),
  };
}

export type ExplorerCameraPerspective = 'tpp' | 'fpp';

/**
 * Advances a playable character one physics step using game-style steering:
 * - Left / Right (A / D or ArrowLeft / ArrowRight) rotates character facing yaw smoothly
 * - Forward / Backward (W / S or ArrowUp / ArrowDown) walks along facing yaw
 * - Auto-walk smoothly steers and walks toward walkTarget until comfortable hologram reading distance
 * Three.js mesh forward convention: facingYawRad = 0 faces +Z, +PI/2 faces +X, PI faces -Z.
 */
export function stepCharacterMovement(
  state: CharacterMotionState,
  input: CharacterMoveInput,
  dt: number,
  walkTarget: { x: number; z: number } | null
): { next: CharacterMotionState; reachedTarget: boolean; isTurning: boolean } {
  const safeDt = Math.min(0.1, Math.max(0.004, dt));
  const walkSpeed = input.sprint ? 12.8 : 7.5;
  const turnSpeedRad = 2.25;

  let facing = state.facingYawRad;
  let reachedTarget = false;
  let isTurning = false;

  const hasManualInput = input.forward || input.backward || input.left || input.right;

  if (hasManualInput) {
    if (input.left) {
      facing += turnSpeedRad * safeDt;
      isTurning = true;
    }
    if (input.right) {
      facing -= turnSpeedRad * safeDt;
      isTurning = true;
    }

    const fwdX = Math.sin(facing);
    const fwdZ = Math.cos(facing);
    let moveScalar = 0;
    if (input.forward) moveScalar += walkSpeed;
    if (input.backward) moveScalar -= walkSpeed * 0.72;

    if (Math.abs(moveScalar) < 1e-4) {
      return {
        next: {
          ...state,
          facingYawRad: facing,
          isMoving: false,
        },
        reachedTarget: false,
        isTurning,
      };
    }

    const clamped = clampExplorerToArena(
      state.x + fwdX * moveScalar * safeDt,
      state.z + fwdZ * moveScalar * safeDt
    );

    return {
      next: {
        x: clamped.x,
        z: clamped.z,
        facingYawRad: facing,
        walkCyclePhase: state.walkCyclePhase + safeDt * (input.sprint ? 12.5 : 8.8),
        isMoving: true,
      },
      reachedTarget: false,
      isTurning,
    };
  }

  if (walkTarget) {
    const dx = walkTarget.x - state.x;
    const dz = walkTarget.z - state.z;
    const dist = Math.hypot(dx, dz);
    const targetFacing = dist > 0.05 ? Math.atan2(dx, dz) : state.facingYawRad;

    if (dist <= 4.7) {
      reachedTarget = true;
      return {
        next: {
          ...state,
          facingYawRad: targetFacing,
          isMoving: false,
        },
        reachedTarget: true,
        isTurning: false,
      };
    }

    let deltaYaw = targetFacing - state.facingYawRad;
    while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;
    const smoothFacing = state.facingYawRad + deltaYaw * Math.min(1, safeDt * 10);

    const nx = dx / dist;
    const nz = dz / dist;
    const clamped = clampExplorerToArena(
      state.x + nx * walkSpeed * safeDt,
      state.z + nz * walkSpeed * safeDt
    );

    return {
      next: {
        x: clamped.x,
        z: clamped.z,
        facingYawRad: smoothFacing,
        walkCyclePhase: state.walkCyclePhase + safeDt * 8.8,
        isMoving: true,
      },
      reachedTarget: false,
      isTurning: Math.abs(deltaYaw) > 0.02,
    };
  }

  return {
    next: { ...state, isMoving: false },
    reachedTarget: false,
    isTurning: false,
  };
}

/**
 * Returns the nearest ExplorerAreaConfig whose Hologram Info Point is within triggerRadiusM
 * of the playable character, or null if none is in range.
 */
export function findNearbyHologramArea(
  charPos: { x: number; z: number },
  areas: ExplorerAreaConfig[],
  triggerRadiusM = HOLOGRAM_TRIGGER_RADIUS_M
): ExplorerAreaConfig | null {
  let closest: ExplorerAreaConfig | null = null;
  let closestDist = triggerRadiusM;
  for (const area of areas) {
    const d = Math.hypot(charPos.x - area.hologramPos.x, charPos.z - area.hologramPos.z);
    if (d <= closestDist) {
      closestDist = d;
      closest = area;
    }
  }
  return closest;
}

/**
 * Computes auto-following TPP (Third-Person) or FPP (First-Person) camera placement
 * directly from the explorer's facing direction so turning automatically turns the view.
 */
export function computeExplorerCamera(
  charState: { x: number; z: number; facingYawRad: number },
  perspective: ExplorerCameraPerspective,
  orbitOffsetRad = 0,
  tppDistance = 6.9
): { position: Vec3Tuple; target: Vec3Tuple; fov: number } {
  const yaw = charState.facingYawRad + orbitOffsetRad;
  const fwdX = Math.sin(yaw);
  const fwdZ = Math.cos(yaw);

  if (perspective === 'fpp') {
    return {
      position: {
        x: charState.x + fwdX * 0.18,
        y: 1.72,
        z: charState.z + fwdZ * 0.18,
      },
      target: {
        x: charState.x + fwdX * 6.0,
        y: 2.35,
        z: charState.z + fwdZ * 6.0,
      },
      fov: 68,
    };
  }

  return {
    position: {
      x: charState.x - fwdX * tppDistance,
      y: 3.35,
      z: charState.z - fwdZ * tppDistance,
    },
    target: {
      x: charState.x + fwdX * 4.2,
      y: 2.45,
      z: charState.z + fwdZ * 4.2,
    },
    fov: 56,
  };
}
