import { TrackDepartment } from '../utils/hackathonModel';

/**
 * Architectural conversion scale: 1 foot = 0.3048 meters (1 world unit = 1 meter).
 * Bus Parking A3 footprint is 590 ft (X) x 550 ft (CAD Y -> World Z),
 * which maps to ~179.8m x 167.6m centered around the L-junction heart of the arena.
 */
export const FT_TO_M = 0.3048;
export const CAD_ORIGIN_X_FT = 245;
export const CAD_ORIGIN_Y_FT = 315;
export const HUMAN_EYE_HEIGHT_M = 1.78;
export const EYE_LOOK_RADIUS_M = 0.28;

export type ViewPerspectiveMode = 'aerial' | 'eye-level';

export interface Vec3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface StandingDirection {
  id: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  label: string;
  yawDeg: number;
}

/**
 * Eight 360-degree standing compass headings (0 deg = North / -Z, 90 deg = East / +X).
 */
export const STANDING_DIRECTIONS: StandingDirection[] = [
  { id: 'N', label: 'North', yawDeg: 0 },
  { id: 'NE', label: 'NE', yawDeg: 45 },
  { id: 'E', label: 'East', yawDeg: 90 },
  { id: 'SE', label: 'SE', yawDeg: 135 },
  { id: 'S', label: 'South', yawDeg: 180 },
  { id: 'SW', label: 'SW', yawDeg: 225 },
  { id: 'W', label: 'West', yawDeg: 270 },
  { id: 'NW', label: 'NW', yawDeg: 315 },
];

export type CameraPresetId =
  | 'master-aerial'
  | 'stage-45'
  | 'stage-closeup'
  | 'stage-podium-pov'
  | 'mentor-hub'
  | 'vc-pitch-hub'
  | 'north-wing'
  | 'central-arena'
  | 'sponsor-promenade'
  | 'hardware-pit'
  | 'checkin-plaza'
  | 'top-down';

export type LightingMoodId = 'golden-hour' | 'night-keynote' | 'daylight';
export type RoofModeId = 'translucent' | 'open-cutaway' | 'truss-only';
export type OverlayModeId = 'tracks' | 'sightlines' | 'clean';

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  shortLabel: string;
  category: 'stage' | 'wings' | 'people-ops';
  description: string;
  position: Vec3Tuple;
  target: Vec3Tuple;
  fov: number;
}

export interface WorldPodInstance {
  x: number;
  z: number;
  trackId: string;
  zoneStroke: string;
  zoneFill: string;
  isHardwareBench: boolean;
  seatsPerPod: number;
  rotationY: number;
}

export interface LightingMoodConfig {
  id: LightingMoodId;
  label: string;
  skyTopHex: string;
  skyHorizonHex: string;
  fogHex: number;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPosition: Vec3Tuple;
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  rimColor: number;
  rimIntensity: number;
  exposure: number;
  stageLedEmissive: number;
  gantryEmissive: number;
  interiorLampIntensity: number;
  stageBeamOpacity: number;
}

/**
 * Converts a 2D CAD point (in feet, origin top-left of Bus Parking A3 sheet)
 * into right-handed Three.js world coordinates in meters (Y-up).
 */
export function cadToWorld(cadXFt: number, cadYFt: number, yMeters = 0): Vec3Tuple {
  return {
    x: (cadXFt - CAD_ORIGIN_X_FT) * FT_TO_M,
    y: yMeters,
    z: (cadYFt - CAD_ORIGIN_Y_FT) * FT_TO_M,
  };
}

/**
 * Converts a CAD width & height (in feet) into Three.js world meters.
 */
export function cadSizeToWorld(widthFt: number, heightFt: number): { w: number; d: number } {
  return {
    w: widthFt * FT_TO_M,
    d: heightFt * FT_TO_M,
  };
}

/**
 * Exact outer L-shaped Bus Parking Arena perimeter polygon in CAD feet.
 * Matches ArenaMasterplan.tsx SVG path 1:1.
 */
export const ARENA_OUTER_POLYGON_CAD: Array<[number, number]> = [
  [0, 0],
  [200, 0],
  [200, 300],
  [450, 300],
  [450, 470],
  [590, 470],
  [590, 550],
  [0, 550],
];

/**
 * Exact 45-degree chamfered SW Zero to One Center Stage polygon in CAD feet.
 */
export const STAGE_POLYGON_CAD: Array<[number, number]> = [
  [2, 334],
  [62, 334],
  [110, 382],
  [110, 490],
  [2, 490],
];

/**
 * Twelve curated architectural & human-scale camera viewpoints spanning aerials,
 * hero stage perspectives (front, close-up, on-stage speaker POV), mentor hubs,
 * VC pitch lounge, sponsor promenade, hardware pit, and 25-lane check-in plazas.
 */
export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'master-aerial',
    label: 'Master Aerial (Fig. 1)',
    shortLabel: 'Master Aerial',
    category: 'wings',
    description: 'Wide architectural sweep framing both wings, 45° stage, CU buses, DG yard & campus greenery.',
    position: cadToWorld(52, 725, 76),
    target: cadToWorld(235, 335, 3),
    fov: 45,
  },
  {
    id: 'stage-45',
    label: '45° Center Stage & AV',
    shortLabel: '45° Stage',
    category: 'stage',
    description: 'Audience perspective across the FOH AV Console & camera jib onto the Zero to One panoramic LED stage.',
    position: cadToWorld(206, 308, 10.6),
    target: cadToWorld(58, 424, 5.2),
    fov: 48,
  },
  {
    id: 'stage-closeup',
    label: 'Stage Close-Up & IMAG Wings',
    shortLabel: 'Stage Close-Up',
    category: 'stage',
    description: 'Broadcast close-up framing the keynote speaker, VIP panelists, main Zero to One LED & live 24h IMAG screens.',
    position: cadToWorld(128, 354, 4.6),
    target: cadToWorld(56, 424, 5.0),
    fov: 50,
  },
  {
    id: 'stage-podium-pov',
    label: 'Keynote Speaker Podium POV',
    shortLabel: 'Speaker POV',
    category: 'stage',
    description: 'Dramatic on-stage speaker viewpoint looking out from the podium across all 6,200 builders in both perpendicular wings.',
    position: cadToWorld(74, 408, 4.2),
    target: cadToWorld(230, 305, 3.2),
    fov: 62,
  },
  {
    id: 'mentor-hub',
    label: 'Mentor Helpdesk & Aisle Triage',
    shortLabel: 'Mentor Hub',
    category: 'people-ops',
    description: 'Eye-level close-up of Mentor Helpdesk M-2 on the North Promenade with teal-vest mentors advising AIT & AIM teams.',
    position: cadToWorld(116, 275, 5.4),
    target: cadToWorld(88, 218, 2.2),
    fov: 50,
  },
  {
    id: 'vc-pitch-hub',
    label: 'TBI VC Pitch Pod & Jury Lounge',
    shortLabel: 'VC Pitch Pod',
    category: 'people-ops',
    description: 'Close-up of the glass TBI VC Pitch Pavilion hosting 15 VCs & judges beside the FOH console and CSE/AIT lanes.',
    position: cadToWorld(212, 362, 6.2),
    target: cadToWorld(154, 316, 2.6),
    fov: 48,
  },
  {
    id: 'north-wing',
    label: 'North Wing (AIT & AIM)',
    shortLabel: 'North Wing',
    category: 'wings',
    description: 'Down-axis vista along the 28 ft North Central Promenade between Zone A (AIM) and Zone B (AIT GenAI) toward the stage.',
    position: cadToWorld(92, -32, 21),
    target: cadToWorld(86, 360, 4.5),
    fov: 50,
  },
  {
    id: 'central-arena',
    label: 'Central Arena (CSE · UIE · TBI)',
    shortLabel: 'Central Arena',
    category: 'wings',
    description: 'Elevated sweep across Zone C (CSE), Zone D (UIE), Sponsor Promenade, and Zone E (2,000-seat TBI block).',
    position: cadToWorld(435, 255, 42),
    target: cadToWorld(265, 435, 3),
    fov: 48,
  },
  {
    id: 'sponsor-promenade',
    label: 'Sponsor & Hydration Boulevard',
    shortLabel: 'Sponsor Walk',
    category: 'people-ops',
    description: 'Immersive 3.2m walkthrough along the 18 ft East-West Promenade past Sponsor Booths SP-1..SP-6 & 24h coffee bars.',
    position: cadToWorld(444, 428, 3.6),
    target: cadToWorld(160, 424, 4.2),
    fov: 56,
  },
  {
    id: 'hardware-pit',
    label: 'Hardware & Robotics Wing',
    shortLabel: 'Hardware Pit',
    category: 'wings',
    description: 'Zone F (140×80 ft) workbenches, 3-phase Campus Building feed, safety marshals & 25×20 ft autonomous rover testing pit.',
    position: cadToWorld(548, 635, 23),
    target: cadToWorld(520, 504, 3.2),
    fov: 48,
  },
  {
    id: 'checkin-plaza',
    label: 'Check-In Plaza, Green Rooms & Med Bay',
    shortLabel: 'Check-In Plaza',
    category: 'people-ops',
    description: 'South arrival apron highlighting Gate B (13 QR lanes), glass VIP Green Rooms, Medical Bay, ambulance & DG yard.',
    position: cadToWorld(195, 680, 21),
    target: cadToWorld(165, 520, 3.4),
    fov: 50,
  },
  {
    id: 'top-down',
    label: 'Architectural Plan View',
    shortLabel: 'Plan View',
    category: 'wings',
    description: 'Near-orthographic overhead view mapping all 6 department zones 1:1 against the Bus Parking A3 CAD sheet.',
    position: cadToWorld(270, 325, 195),
    target: cadToWorld(270, 305, 0),
    fov: 42,
  },
];

/**
 * Curated sequence of camera presets used by the 1-click Cinematic Tour mode.
 */
export const CINEMATIC_TOUR_ORDER: CameraPresetId[] = [
  'master-aerial',
  'stage-45',
  'stage-closeup',
  'stage-podium-pov',
  'mentor-hub',
  'vc-pitch-hub',
  'sponsor-promenade',
  'hardware-pit',
  'checkin-plaza',
];

/**
 * Computes a close pivot target point along a compass heading from a standing person's eye position
 * so OrbitControls rotates cleanly 360 degrees in place around the viewer's head.
 * Convention: yawDeg = 0 faces North (-Z), 90 faces East (+X), 180 faces South (+Z), 270 faces West (-X).
 */
export function getStandingLookTarget(
  eyePos: Vec3Tuple,
  yawDeg: number,
  pitchDeg = 0,
  radius = EYE_LOOK_RADIUS_M
): Vec3Tuple {
  const yawRad = (yawDeg * Math.PI) / 180;
  const pitchRad = (pitchDeg * Math.PI) / 180;
  const cosP = Math.cos(pitchRad);
  const dx = Math.sin(yawRad) * cosP;
  const dy = Math.sin(pitchRad);
  const dz = -Math.cos(yawRad) * cosP;
  return {
    x: eyePos.x + dx * radius,
    y: eyePos.y + dy * radius,
    z: eyePos.z + dz * radius,
  };
}

/**
 * Computes the compass heading (0..359 deg, 0=North/-Z, 90=East/+X) from point A to point B.
 */
export function computeCompassYawDeg(from: Vec3Tuple, to: Vec3Tuple): number {
  const rad = Math.atan2(to.x - from.x, -(to.z - from.z));
  return ((rad * 180) / Math.PI + 360) % 360;
}

export interface EyeLevelStandingView {
  position: Vec3Tuple;
  target: Vec3Tuple;
  fov: number;
  yawDeg: number;
  standingLabel: string;
}

/**
 * Maps every one of the 12 camera angles to an unobstructed, authentic human standing eye-level spot
 * (1.78m above concrete plinth or 1.76m above the 1.69m stage deck) so visitors can stand inside
 * every zone and look around 360 degrees in all directions.
 */
export function getEyeLevelViewForPreset(presetId: CameraPresetId): EyeLevelStandingView {
  const plinthEyeY = 0.15 + HUMAN_EYE_HEIGHT_M; // 1.93m standing on arena floor
  const stageDeckEyeY = 1.69 + HUMAN_EYE_HEIGHT_M; // 3.47m standing on main stage deck

  const spotMap: Record<
    CameraPresetId,
    { cadX: number; cadY: number; y: number; yawDeg: number; pitchDeg: number; label: string }
  > = {
    'master-aerial': {
      cadX: 178,
      cadY: 374,
      y: plinthEyeY,
      yawDeg: 235,
      pitchDeg: 4,
      label: 'Standing at L-Junction Heart (360° Arena View)',
    },
    'stage-45': {
      cadX: 132,
      cadY: 368,
      y: plinthEyeY,
      yawDeg: 225,
      pitchDeg: 7,
      label: 'Standing beside FOH AV Console facing 45° Stage',
    },
    'stage-closeup': {
      cadX: 102,
      cadY: 378,
      y: plinthEyeY,
      yawDeg: 225,
      pitchDeg: 11,
      label: 'Standing in Front Row Pit facing Keynote Speaker',
    },
    'stage-podium-pov': {
      cadX: 66,
      cadY: 414,
      y: stageDeckEyeY,
      yawDeg: 45,
      pitchDeg: -2,
      label: 'Standing On-Stage at Keynote Podium looking out',
    },
    'mentor-hub': {
      cadX: 92,
      cadY: 252,
      y: plinthEyeY,
      yawDeg: 0,
      pitchDeg: 3,
      label: 'Standing on North Promenade at Mentor Helpdesk M-2',
    },
    'vc-pitch-hub': {
      cadX: 188,
      cadY: 344,
      y: plinthEyeY,
      yawDeg: 312,
      pitchDeg: 3,
      label: 'Standing outside Glass TBI VC Pitch Pavilion',
    },
    'north-wing': {
      cadX: 92,
      cadY: 122,
      y: plinthEyeY,
      yawDeg: 180,
      pitchDeg: 2,
      label: 'Standing in North Wing Promenade (AIM & AIT)',
    },
    'central-arena': {
      cadX: 318,
      cadY: 433.5,
      y: plinthEyeY,
      yawDeg: 274,
      pitchDeg: 3,
      label: 'Standing at Central Arena Crossroads (CSE · UIE · TBI)',
    },
    'sponsor-promenade': {
      cadX: 404,
      cadY: 433.5,
      y: plinthEyeY,
      yawDeg: 274,
      pitchDeg: 3,
      label: 'Standing on Sponsor & 24h Coffee Boulevard',
    },
    'hardware-pit': {
      cadX: 526,
      cadY: 512,
      y: plinthEyeY,
      yawDeg: 90,
      pitchDeg: 0,
      label: 'Standing beside Zone F Robotics Testing Pit',
    },
    'checkin-plaza': {
      cadX: 258,
      cadY: 582,
      y: HUMAN_EYE_HEIGHT_M + 0.05,
      yawDeg: 315,
      pitchDeg: 4,
      label: 'Standing on South Arrival Plaza at Gate B & Med Bay',
    },
    'top-down': {
      cadX: 92,
      cadY: 18,
      y: plinthEyeY,
      yawDeg: 180,
      pitchDeg: 2,
      label: 'Standing inside Entry Gate A looking down North Wing',
    },
  };

  const spot = spotMap[presetId] ?? spotMap['master-aerial'];
  const position = cadToWorld(spot.cadX, spot.cadY, spot.y);
  const target = getStandingLookTarget(position, spot.yawDeg, spot.pitchDeg);
  return {
    position,
    target,
    fov: 70,
    yawDeg: spot.yawDeg,
    standingLabel: spot.label,
  };
}

/**
 * Computes a standing human eye-level vantage right inside the aisle of any of the 6 department tracks.
 */
export function getTrackEyeLevelView(track: TrackDepartment): EyeLevelStandingView {
  const plinthEyeY = 0.15 + HUMAN_EYE_HEIGHT_M;
  const spots: Record<string, { cadX: number; cadY: number; yawDeg: number }> = {
    aim: { cadX: 82, cadY: 162, yawDeg: 270 },
    ait: { cadX: 102, cadY: 162, yawDeg: 90 },
    cse: { cadX: 256, cadY: 418, yawDeg: 0 },
    uie: { cadX: 382, cadY: 418, yawDeg: 0 },
    'robotics-mechatronics': { cadX: 518, cadY: 512, yawDeg: 90 },
    'tbi-builder': { cadX: 318, cadY: 438, yawDeg: 180 },
  };
  const spot = spots[track.id] ?? { cadX: 178, cadY: 374, yawDeg: 235 };
  const position = cadToWorld(spot.cadX, spot.cadY, plinthEyeY);
  return {
    position,
    target: getStandingLookTarget(position, spot.yawDeg, 4),
    fov: 70,
    yawDeg: spot.yawDeg,
    standingLabel: `Standing in ${track.arenaZoneLabel} — ${track.departmentShort}`,
  };
}

/**
 * Lighting presets spanning the full 24-hour continuous hackathon cycle.
 */
export const LIGHTING_MOODS: Record<LightingMoodId, LightingMoodConfig> = {
  'golden-hour': {
    id: 'golden-hour',
    label: 'Golden Hour',
    skyTopHex: '#355A7D',
    skyHorizonHex: '#F3C793',
    fogHex: 0xe6cdb2,
    fogDensity: 0.0017,
    sunColor: 0xffc88a,
    sunIntensity: 2.35,
    sunPosition: { x: -135, y: 68, z: 95 },
    hemiSkyColor: 0x9ec5e8,
    hemiGroundColor: 0x5c4b3b,
    hemiIntensity: 0.95,
    rimColor: 0x7dd3fc,
    rimIntensity: 0.65,
    exposure: 1.12,
    stageLedEmissive: 0.92,
    gantryEmissive: 0.62,
    interiorLampIntensity: 0.55,
    stageBeamOpacity: 0.035,
  },
  'night-keynote': {
    id: 'night-keynote',
    label: 'Night Keynote',
    skyTopHex: '#050B16',
    skyHorizonHex: '#101F36',
    fogHex: 0x0a1526,
    fogDensity: 0.0021,
    sunColor: 0x6088d6,
    sunIntensity: 0.42,
    sunPosition: { x: -95, y: 85, z: 85 },
    hemiSkyColor: 0x1c3459,
    hemiGroundColor: 0x0b101a,
    hemiIntensity: 0.42,
    rimColor: 0x14b8a6,
    rimIntensity: 0.95,
    exposure: 1.08,
    stageLedEmissive: 1.42,
    gantryEmissive: 1.25,
    interiorLampIntensity: 1.65,
    stageBeamOpacity: 0.28,
  },
  daylight: {
    id: 'daylight',
    label: 'Daylight',
    skyTopHex: '#4E8AC7',
    skyHorizonHex: '#DCEBF7',
    fogHex: 0xd6e6f2,
    fogDensity: 0.0014,
    sunColor: 0xfff4e0,
    sunIntensity: 2.45,
    sunPosition: { x: -80, y: 140, z: 75 },
    hemiSkyColor: 0xcbe4ff,
    hemiGroundColor: 0x6b7280,
    hemiIntensity: 1.05,
    rimColor: 0xe0f2fe,
    rimIntensity: 0.45,
    exposure: 1.06,
    stageLedEmissive: 0.72,
    gantryEmissive: 0.42,
    interiorLampIntensity: 0.25,
    stageBeamOpacity: 0.04,
  },
};

/**
 * Computes an unobstructed, well-framed camera vantage point for any of the 6 tracks.
 */
export function getTrackCameraView(track: TrackDepartment): {
  position: Vec3Tuple;
  target: Vec3Tuple;
  fov: number;
} {
  const { x, y, width, height, cutoutBottomLeft } = track.cadZone;
  const centerCadX = cutoutBottomLeft
    ? x + cutoutBottomLeft.width + (width - cutoutBottomLeft.width) * 0.5
    : x + width * 0.5;
  const centerCadY = y + height * 0.5;

  const target = cadToWorld(centerCadX, centerCadY, 3.2);

  switch (track.id) {
    case 'aim':
      return {
        position: cadToWorld(centerCadX + 125, centerCadY + 135, 34),
        target,
        fov: 46,
      };
    case 'ait':
      return {
        position: cadToWorld(centerCadX + 145, centerCadY + 115, 38),
        target,
        fov: 46,
      };
    case 'cse':
      return {
        position: cadToWorld(centerCadX - 85, centerCadY - 95, 29),
        target,
        fov: 46,
      };
    case 'uie':
      return {
        position: cadToWorld(centerCadX - 80, centerCadY - 105, 30),
        target,
        fov: 46,
      };
    case 'robotics-mechatronics':
      return {
        position: cadToWorld(centerCadX + 26, centerCadY + 128, 22),
        target: cadToWorld(centerCadX + 4, centerCadY - 4, 3.2),
        fov: 48,
      };
    case 'tbi-builder':
    default:
      return {
        position: cadToWorld(centerCadX + 55, centerCadY + 150, 36),
        target,
        fov: 48,
      };
  }
}

/**
 * Generates deterministic 3D world positions for every circular coding pod / hardware workbench
 * across all 6 unified department tracks, strictly respecting CAD zone margins and cutouts.
 */
export function generateWorldPods(tracks: TrackDepartment[]): WorldPodInstance[] {
  const result: WorldPodInstance[] = [];

  for (const track of tracks) {
    const { x, y, width, height, podCols, podRows, cutoutBottomLeft } = track.cadZone;
    const isHardware = track.id === 'robotics-mechatronics';

    const padX = 7;
    const padY = 12;
    const usableW = Math.max(10, width - padX * 2);
    const usableH = Math.max(10, height - padY * 2);

    const cols = Math.max(2, podCols);
    const rows = Math.max(2, podRows);
    const stepX = cols > 1 ? usableW / (cols - 1) : 0;
    const stepY = rows > 1 ? usableH / (rows - 1) : 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cadX = x + padX + c * stepX;
        const cadY = y + padY + r * stepY;

        if (cutoutBottomLeft) {
          const cutRight = x + cutoutBottomLeft.width + 4;
          const cutTop = y + height - cutoutBottomLeft.height - 4;
          if (cadX < cutRight && cadY > cutTop) {
            continue;
          }
        }

        // Leave clear space inside Zone F's East end for the 25x20 ft Robotics Testing Pit
        if (isHardware && cadX > x + width - 30 && cadY > y + 18 && cadY < y + height - 12) {
          continue;
        }

        const world = cadToWorld(cadX, cadY, 0);
        const rotationY = ((r * 13 + c * 7) % 12) * (Math.PI / 6);

        result.push({
          x: world.x,
          z: world.z,
          trackId: track.id,
          zoneStroke: track.zoneStroke,
          zoneFill: track.zoneFill,
          isHardwareBench: isHardware,
          seatsPerPod: track.avgTeamSize,
          rotationY,
        });
      }
    }
  }

  return result;
}

/**
 * Generates deterministic standing Mentor, Judge, and Marshal world coordinates
 * distributed realistically across all 6 department bays, mentor helpdesks, and gates.
 */
export interface ArenaRoleFigure {
  x: number;
  z: number;
  rotationY: number;
  role: 'mentor' | 'judge' | 'marshal';
}

export function generateArenaRoleFigures(tracks: TrackDepartment[]): ArenaRoleFigure[] {
  const figures: ArenaRoleFigure[] = [];

  // 1. Roaming & consulting Mentors (teal vests) distributed along aisles inside all 6 track zones
  for (const track of tracks) {
    const { x, y, width, height, cutoutBottomLeft } = track.cadZone;
    const mentorCount = track.id === 'tbi-builder' ? 24 : track.id === 'ait' ? 14 : 10;
    for (let i = 0; i < mentorCount; i++) {
      const fracX = ((i * 37 + 11) % 88 + 6) / 100;
      const fracY = ((i * 53 + 17) % 86 + 7) / 100;
      const cx = x + width * fracX;
      const cy = y + height * fracY;
      if (cutoutBottomLeft) {
        if (cx < x + cutoutBottomLeft.width + 5 && cy > y + height - cutoutBottomLeft.height - 5) {
          continue;
        }
      }
      const wp = cadToWorld(cx, cy, 0);
      figures.push({
        x: wp.x,
        z: wp.z,
        rotationY: (i * 1.15) % (Math.PI * 2),
        role: 'mentor',
      });
    }

    // 2. Track Judges (deep royal-blue blazers) evaluating booths along each bay
    const judgeCount = track.id === 'tbi-builder' ? 8 : 4;
    for (let j = 0; j < judgeCount; j++) {
      const fracX = ((j * 43 + 23) % 80 + 10) / 100;
      const fracY = ((j * 61 + 19) % 80 + 10) / 100;
      const cx = x + width * fracX;
      const cy = y + height * fracY;
      if (cutoutBottomLeft) {
        if (cx < x + cutoutBottomLeft.width + 5 && cy > y + height - cutoutBottomLeft.height - 5) {
          continue;
        }
      }
      const wp = cadToWorld(cx, cy, 0);
      figures.push({
        x: wp.x,
        z: wp.z,
        rotationY: (j * 1.7) % (Math.PI * 2),
        role: 'judge',
      });
    }
  }

  // 3. Mentor Helpdesk M-1 & M-2 dedicated standing Mentors on North Central Promenade
  for (const deskY of [78, 224]) {
    for (let k = -2; k <= 2; k++) {
      const wp = cadToWorld(92 + k * 3.5, deskY + (k % 2 === 0 ? -4 : 5), 0);
      figures.push({ x: wp.x, z: wp.z, rotationY: k * 0.6, role: 'mentor' });
    }
  }

  // 4. Judges & VCs stationed around the TBI VC Pitch Pod (CAD 156, 316)
  for (let v = 0; v < 8; v++) {
    const wp = cadToWorld(142 + (v % 4) * 9, 312 + Math.floor(v / 4) * 10, 0);
    figures.push({ x: wp.x, z: wp.z, rotationY: v * 0.8, role: 'judge' });
  }

  // 5. High-Visibility Event Marshals & Volunteers at Gates A & B, Exits & Robotics Pit
  const marshalSpots: Array<[number, number]> = [
    [68, -6], [86, -6], [112, -6], [132, -6], // Gate A
    [285, 558], [312, 558], [340, 558], [366, 558], // Gate B
    [206, 224], [556, 548], // Exits E1 & E2
    [548, 502], [584, 502], [566, 488], // Robotics Testing Pit safety marshals
    [138, 396], [138, 418], // AV Console security marshals
  ];
  marshalSpots.forEach(([mx, my], idx) => {
    const wp = cadToWorld(mx, my, 0);
    figures.push({ x: wp.x, z: wp.z, rotationY: idx * 0.5, role: 'marshal' });
  });

  return figures;
}

/**
 * Clamps camera world position inside the extended Chandigarh University campus perimeter
 * so manual orbit or WASD flight never clips below ground or flies into fog emptiness.
 */
export function clampCameraPosition(pos: Vec3Tuple, minY = 1.65): Vec3Tuple {
  return {
    x: Math.max(-210, Math.min(240, pos.x)),
    y: Math.max(minY, Math.min(240, pos.y)),
    z: Math.max(-230, Math.min(230, pos.z)),
  };
}
