export type TrackCategory = 'software-ai' | 'hardware-growth' | 'tbi-core';
export type TrackFilterCategory = 'all' | TrackCategory;

export interface CadZoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Number of visual team-pod columns and rows to render inside this CAD zone */
  podCols: number;
  podRows: number;
  /** Optional cutout for Driver Room in lower-central zone */
  cutoutBottomLeft?: { width: number; height: number };
}

export interface TrackDepartment {
  id: string;
  trackNumber: string;
  trackShortName: string;
  departmentShort: string;
  departmentFull: string;
  trackTitle: string;
  category: TrackCategory;
  leadBody: 'Department' | 'TBI Core';
  arenaZoneLabel: string;
  arenaWing: 'North Wing (West)' | 'North Wing (East)' | 'Central Arena' | 'South-East Wing';
  footprintSqFt: number;
  cadZone: CadZoneBounds;
  /** Distinct, muted architectural drafting tint for SVG CAD zone */
  zoneFill: string;
  zoneStroke: string;
  zoneTextColor: string;
  /** Operational targets (editable in Quota Workbench) */
  showUpTarget: number;
  funnelMultiplier: number; // e.g., 3.0 means 3 registrations per 1 confirmed participant
  avgTeamSize: number;
  sponsorTargetLakhs: number;
  /** Narrative & technical deliverables */
  focusThemes: string[];
  departmentDeliverables: string[];
  infrastructureNotes: string;
  sponsorTargetProfiles: string[];
  coordRole: string;
}

export interface TrackCalculatedMetrics {
  showUpTarget: number;
  registrationTarget: number;
  teamsCount: number;
  mentorsRequired: number;
  judgesRequired: number;
  sqftPerParticipant: number;
  densityStatus: 'Optimal' | 'High Density' | 'Overcrowded';
}

export interface ProposalSummary {
  totalShowUp: number;
  totalRegistrations: number;
  totalTeams: number;
  totalMentors: number;
  totalJudges: number;
  departmentSponsorLakhs: number;
  centralTbiSponsorLakhs: number;
  totalSponsorLakhs: number;
  recordThreshold: number;
  recordBuffer: number;
  meetsRecordTarget: boolean;
  totalArenaSqFt: number;
  usableSeatingSqFt: number;
  avgSqFtPerParticipant: number;
  tbiSharePercent: number;
  departmentsSharePercent: number;
}

export interface LogisticsRequirements {
  wifiAccessPoints: number;
  uplinkGbps: number;
  powerKva: number;
  totalMealPacks: number;
  waterLiters: number;
  volunteersTotal: number;
  volunteersPerShift: number;
  checkinLanes: number;
  portableWashrooms: number;
  medicalStations: number;
}

export interface EventDateOption {
  isoDate: string; // YYYY-MM-DD (Day 1 start)
  label: string; // e.g. "30 – 31 Jan"
  dayPair: string; // e.g. "Sat – Sun"
  isWeekendRecommended: boolean;
  daysFromLaunchDec1: number;
  daysFromDeptDec15: number;
  shortlistLockDate: string;
  arenaHandoverDate: string;
}

/** Exact CAD Blueprint constants from Bus Parking A3 Layout (dimensions in feet) */
export const ARENA_DIMENSIONS = {
  NORTH_WING_W: 200,
  NORTH_WING_H: 300,
  STAGE_ZONE_W: 200,
  STAGE_ZONE_H: 250,
  CENTRAL_ARENA_W: 250,
  CENTRAL_ARENA_H: 250,
  SE_WING_W: 140,
  SE_WING_H: 80,
  BUILDING_W: 140,
  BUILDING_H: 170,
  TOTAL_HEIGHT: 550,
  MAIN_BOTTOM_WIDTH: 450,
  FULL_WIDTH: 590,
} as const;

export const TOTAL_ARENA_SQFT =
  ARENA_DIMENSIONS.NORTH_WING_W * ARENA_DIMENSIONS.NORTH_WING_H +
  ARENA_DIMENSIONS.STAGE_ZONE_W * ARENA_DIMENSIONS.STAGE_ZONE_H +
  ARENA_DIMENSIONS.CENTRAL_ARENA_W * ARENA_DIMENSIONS.CENTRAL_ARENA_H +
  ARENA_DIMENSIONS.SE_WING_W * ARENA_DIMENSIONS.SE_WING_H; // 183,700 sq ft

export const RECORD_TARGET_PARTICIPANTS = 6000;
export const CENTRAL_TBI_TITLE_SPONSOR_LAKHS = 45; // Title + Co-Powered + Ecosystem central pool led by TBI

export function calculateTrackMetrics(track: TrackDepartment): TrackCalculatedMetrics {
  const showUpTarget = Math.max(0, Math.round(track.showUpTarget));
  const registrationTarget = Math.round(showUpTarget * track.funnelMultiplier);
  const teamsCount = Math.max(1, Math.round(showUpTarget / track.avgTeamSize));
  // 1 active mentor per 25 participants; 1 track judge per 20 teams (minimum 4 judges per track)
  const mentorsRequired = Math.max(8, Math.ceil(showUpTarget / 25));
  const judgesRequired = Math.max(4, Math.ceil(teamsCount / 20));
  const sqftPerParticipant =
    showUpTarget > 0 ? Number((track.footprintSqFt / showUpTarget).toFixed(1)) : 0;

  let densityStatus: TrackCalculatedMetrics['densityStatus'] = 'Optimal';
  if (sqftPerParticipant < 12) {
    densityStatus = 'Overcrowded';
  } else if (sqftPerParticipant < 16) {
    densityStatus = 'High Density';
  }

  return {
    showUpTarget,
    registrationTarget,
    teamsCount,
    mentorsRequired,
    judgesRequired,
    sqftPerParticipant,
    densityStatus,
  };
}

export function calculateProposalSummary(tracks: TrackDepartment[]): ProposalSummary {
  let totalShowUp = 0;
  let totalRegistrations = 0;
  let totalTeams = 0;
  let totalMentors = 0;
  let totalJudges = 0;
  let departmentSponsorLakhs = 0;
  let usableSeatingSqFt = 0;
  let tbiShowUp = 0;

  for (const track of tracks) {
    const m = calculateTrackMetrics(track);
    totalShowUp += m.showUpTarget;
    totalRegistrations += m.registrationTarget;
    totalTeams += m.teamsCount;
    totalMentors += m.mentorsRequired;
    totalJudges += m.judgesRequired;
    departmentSponsorLakhs += track.sponsorTargetLakhs;
    usableSeatingSqFt += track.footprintSqFt;
    if (track.leadBody === 'TBI Core') {
      tbiShowUp += m.showUpTarget;
    }
  }

  const recordBuffer = totalShowUp - RECORD_TARGET_PARTICIPANTS;
  const avgSqFtPerParticipant =
    totalShowUp > 0 ? Number((TOTAL_ARENA_SQFT / totalShowUp).toFixed(1)) : 0;
  const tbiSharePercent =
    totalShowUp > 0 ? Number(((tbiShowUp / totalShowUp) * 100).toFixed(1)) : 0;
  const departmentsSharePercent = Number((100 - tbiSharePercent).toFixed(1));

  return {
    totalShowUp,
    totalRegistrations,
    totalTeams,
    totalMentors,
    totalJudges,
    departmentSponsorLakhs,
    centralTbiSponsorLakhs: CENTRAL_TBI_TITLE_SPONSOR_LAKHS,
    totalSponsorLakhs: departmentSponsorLakhs + CENTRAL_TBI_TITLE_SPONSOR_LAKHS,
    recordThreshold: RECORD_TARGET_PARTICIPANTS,
    recordBuffer,
    meetsRecordTarget: totalShowUp >= RECORD_TARGET_PARTICIPANTS,
    totalArenaSqFt: TOTAL_ARENA_SQFT,
    usableSeatingSqFt,
    avgSqFtPerParticipant,
    tbiSharePercent,
    departmentsSharePercent,
  };
}

export function calculateLogisticsRequirements(totalParticipants: number): LogisticsRequirements {
  const safeCount = Math.max(1000, totalParticipants);
  const volunteersPerShift = Math.ceil(safeCount / 60);
  return {
    wifiAccessPoints: Math.ceil(safeCount / 95),
    uplinkGbps: safeCount >= 5500 ? 20 : 10, // Dual redundant 10 Gbps leased lines
    powerKva: Math.ceil((safeCount * 0.14 + 180) / 50) * 50,
    totalMealPacks: safeCount * 4,
    waterLiters: Math.ceil(safeCount * 4.5),
    volunteersTotal: volunteersPerShift * 3,
    volunteersPerShift,
    checkinLanes: Math.ceil(safeCount / 250),
    portableWashrooms: Math.ceil(safeCount / 125),
    medicalStations: Math.max(2, Math.ceil(safeCount / 2500)),
  };
}

export function filterTracks(
  tracks: TrackDepartment[],
  category: TrackFilterCategory,
  searchQuery: string
): TrackDepartment[] {
  const q = searchQuery.trim().toLowerCase();
  return tracks.filter((t) => {
    const matchesCategory = category === 'all' || t.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      t.trackShortName.toLowerCase().includes(q) ||
      t.departmentShort.toLowerCase().includes(q) ||
      t.departmentFull.toLowerCase().includes(q) ||
      t.trackTitle.toLowerCase().includes(q) ||
      t.arenaZoneLabel.toLowerCase().includes(q) ||
      t.focusThemes.some((theme) => theme.toLowerCase().includes(q))
    );
  });
}

export function updateDepartmentQuota(
  tracks: TrackDepartment[],
  trackId: string,
  nextShowUpTarget: number,
  nextFunnelMultiplier?: number
): TrackDepartment[] {
  const clampedShowUp = Math.min(3000, Math.max(200, Math.round(nextShowUpTarget / 50) * 50));
  return tracks.map((track) => {
    if (track.id !== trackId) return track;
    const clampedFunnel =
      nextFunnelMultiplier !== undefined
        ? Math.min(35.0, Math.max(2.0, Number(nextFunnelMultiplier.toFixed(1))))
        : track.funnelMultiplier;
    return {
      ...track,
      showUpTarget: clampedShowUp,
      funnelMultiplier: clampedFunnel,
    };
  });
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatShortDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTH_SHORT[date.getUTCMonth()]}`;
}

function addUtcDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/**
 * Generates selectable 24-hour hackathon start dates across the 28 Jan – 15 Feb window (2027).
 * Launch date: 1 Dec 2026; Department Onboarding date: 15 Dec 2026.
 */
export function getEventWindowDates(): EventDateOption[] {
  const launchDate = new Date(Date.UTC(2026, 11, 1)); // 1 Dec 2026
  const deptDate = new Date(Date.UTC(2026, 11, 15)); // 15 Dec 2026
  const startWindow = new Date(Date.UTC(2027, 0, 28)); // 28 Jan 2027
  const endWindow = new Date(Date.UTC(2027, 1, 15)); // 15 Feb 2027

  const options: EventDateOption[] = [];
  let cursor = startWindow;

  while (cursor <= endWindow) {
    const day2 = addUtcDays(cursor, 1);
    const dow = cursor.getUTCDay();
    // Fri-Sat (5) or Sat-Sun (6) are optimal for 24-hour university-wide attendance
    const isWeekendRecommended = dow === 5 || dow === 6;

    const msPerDay = 86_400_000;
    const daysFromLaunchDec1 = Math.round((cursor.getTime() - launchDate.getTime()) / msPerDay);
    const daysFromDeptDec15 = Math.round((cursor.getTime() - deptDate.getTime()) / msPerDay);

    const shortlistLock = addUtcDays(cursor, -10);
    const arenaHandover = addUtcDays(cursor, -2);

    const isoDate = cursor.toISOString().slice(0, 10);
    const sameMonth = cursor.getUTCMonth() === day2.getUTCMonth();
    const label = sameMonth
      ? `${cursor.getUTCDate()}–${day2.getUTCDate()} ${MONTH_SHORT[cursor.getUTCMonth()]}`
      : `${formatShortDate(cursor)} – ${formatShortDate(day2)}`;

    options.push({
      isoDate,
      label,
      dayPair: `${DAY_SHORT[dow]}–${DAY_SHORT[day2.getUTCDay()]}`,
      isWeekendRecommended,
      daysFromLaunchDec1,
      daysFromDeptDec15,
      shortlistLockDate: formatShortDate(shortlistLock),
      arenaHandoverDate: formatShortDate(arenaHandover),
    });

    cursor = addUtcDays(cursor, 1);
  }

  return options;
}
