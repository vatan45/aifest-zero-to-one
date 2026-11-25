import {
  EventDateOption,
  LogisticsRequirements,
  ProposalSummary,
  TrackDepartment,
  calculateTrackMetrics,
} from './hackathonModel';
import {
  EVALUATION_RUBRIC,
  GUEST_SPEAKER_ROSTER,
  ROADMAP_PHASES,
  RUN_OF_SHOW_24H,
  SPONSORSHIP_TIERS,
  VENUE_STRUCTURAL_ZONES,
} from '../data/proposalData';

export type DocumentId = 'departments' | 'venue' | 'sponsors' | 'timeline';

export interface DocumentDescriptor {
  id: DocumentId;
  docNumber: string;
  docCode: string;
  shortNavLabel: string;
  title: string;
  subtitle: string;
  primaryAudience: string;
}

export const DOCUMENT_CATALOG: DocumentDescriptor[] = [
  {
    id: 'departments',
    docNumber: 'DOC 01',
    docCode: 'CU-Z2O-DOC01',
    shortNavLabel: '01. Depts & Tracks',
    title: 'Department Bifurcation & Track Architecture',
    subtitle: 'Complete quota split, funnel attribution, governance boundaries & deliverables across 5 partner departments + TBI.',
    primaryAudience: 'Pro-VC, Deans, HODs (AIT, CSE, UIE, AIM, Robotics) & TBI Core',
  },
  {
    id: 'venue',
    docNumber: 'DOC 02',
    docCode: 'CU-Z2O-DOC02',
    shortNavLabel: '02. Venue & Structure',
    title: 'Bus Parking Arena Masterplan, Structure & Track Zoning',
    subtitle: 'Complete 183,700 sq ft A3 CAD blueprint, 45° dual-wing center stage, structural zone specs, 24h utilities & visual mockups.',
    primaryAudience: 'Campus Estate, IT Networking, Production Vendors, Security & Catering',
  },
  {
    id: 'sponsors',
    docNumber: 'DOC 03',
    docCode: 'CU-Z2O-DOC03',
    shortNavLabel: '03. Sponsors & Guests',
    title: 'Sponsorship Architecture, Mentors, Judges & VIP Guests',
    subtitle: '₹104L unified sponsorship matrix, track-wise sponsor targets, 248 mentors, 62 judges, VC grand jury & speaker protocol.',
    primaryAudience: 'Corporate Relations, TBI Partnerships, Alumni Cell & Department SPOCs',
  },
  {
    id: 'timeline',
    docNumber: 'DOC 04',
    docCode: 'CU-Z2O-DOC04',
    shortNavLabel: '04. Timeline & Dates',
    title: 'Master Execution Timeline, Date Schedule & 24h Run-of-Show',
    subtitle: 'Complete date-by-date milestones from 1 Dec launch & 15 Dec onboarding to the 28 Jan – 15 Feb 24-hour execution window.',
    primaryAudience: 'Unified AI Fest Command, Event Ops, Volunteers & Leadership Sign-Off',
  },
];

export interface DateMilestoneRow {
  milestoneId: string;
  dateLabel: string;
  phase: 'Launch' | 'Onboarding' | 'Shortlist & Build' | 'Event Day' | 'Post-Event';
  milestoneTitle: string;
  deliverableDetail: string;
  owner: string;
  exitCriteria: string;
}

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function offsetIsoDate(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return `${dt.getUTCDate()} ${SHORT_MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}

/**
 * Generates a complete date-by-date chronological master schedule anchored to
 * 1 Dec 2026 Go-Live, 15 Dec 2026 Department Onboarding, and dynamically shifted
 * T-minus / T-plus dates for the selected 28 Jan – 15 Feb 2027 execution slot.
 */
export function buildDateMilestoneSchedule(selectedDate: EventDateOption): DateMilestoneRow[] {
  const iso = selectedDate.isoDate;

  return [
    {
      milestoneId: 'M-01',
      dateLabel: '1 Dec 2026',
      phase: 'Launch',
      milestoneTitle: 'Unified Zero to One Portal Go-Live',
      deliverableDetail: 'Launch master TBI registration URL with 6-track selector, referral tracking codes & national 50k TBI Builder campaign.',
      owner: 'TBI Central Command',
      exitCriteria: 'Portal live at 99.9% uptime with payment/QR architecture tested.',
    },
    {
      milestoneId: 'M-02',
      dateLabel: '5 Dec 2026',
      phase: 'Launch',
      milestoneTitle: 'Sponsor Prospectus & World Record Filing',
      deliverableDetail: 'Release ₹104L unified sponsorship deck to corporate partners and submit official World Record / Guinness audit protocol.',
      owner: 'TBI Partnerships + Legal',
      exitCriteria: 'Record witness guidelines & Title/Track sponsor decks issued.',
    },
    {
      milestoneId: 'M-03',
      dateLabel: '15 Dec 2026',
      phase: 'Onboarding',
      milestoneTitle: 'All 5 Partner Departments Onboarded & MoU Lock',
      deliverableDetail: 'Joint kickoff with AIT, CSE, UIE, AIM & Robotics HODs; sign written Registration (105k) & Show-Up (6,200) targets + Faculty SPOC roster.',
      owner: 'TBI + 5 Partner HODs',
      exitCriteria: '100% written quota sign-off & referral dashboard access active.',
    },
    {
      milestoneId: 'M-04',
      dateLabel: '22 Dec 2026',
      phase: 'Onboarding',
      milestoneTitle: '6 Track Problem Statements & Sponsor Lock',
      deliverableDetail: 'Publish finalized problem tracks (GenAI, Cloud, Core Computing, Marketing, Hardware, Startup) and close Track Sponsor commitments.',
      owner: '5 Dept SPOCs + TBI',
      exitCriteria: 'All 6 problem statements live on portal; 6/6 track sponsors confirmed.',
    },
    {
      milestoneId: 'M-05',
      dateLabel: '5 Jan 2027',
      phase: 'Onboarding',
      milestoneTitle: 'Mid-Campaign Funnel Audit (65k+ Milestone)',
      deliverableDetail: 'Audit department-wise registration velocity; lock 248 mentors, 62 track judges, headline keynote speakers & VC Grand Jury roster.',
      owner: 'TBI + Alumni / Industry Cell',
      exitCriteria: '60%+ registration funnel hit & 100% mentor/judge invites accepted.',
    },
    {
      milestoneId: 'M-06',
      dateLabel: offsetIsoDate(iso, -16),
      phase: 'Shortlist & Build',
      milestoneTitle: 'Registration Close & Round 1 Screening Opens (T-16)',
      deliverableDetail: 'Close 105,000 unified registrations; route idea decks, GitHub repos & campaign briefs to respective 6 track screening panels.',
      owner: '6 Track Screening Panels',
      exitCriteria: 'All valid submissions scored across standardized Round 1 rubric.',
    },
    {
      milestoneId: 'M-07',
      dateLabel: offsetIsoDate(iso, -10),
      phase: 'Shortlist & Build',
      milestoneTitle: 'Final Shortlist, 15% Waitlist & QR Zone Pass Lock (T-10)',
      deliverableDetail: 'Confirm 1,240 teams (6,200 builders + 15% waitlist buffer) and dispatch QR-coded Bus Parking Zone Passes (Zones A–F).',
      owner: 'TBI Central + Dept SPOCs',
      exitCriteria: '100% on-site RSVP confirmations locked for every track.',
    },
    {
      milestoneId: 'M-08',
      dateLabel: offsetIsoDate(iso, -4),
      phase: 'Shortlist & Build',
      milestoneTitle: 'Bus Parking Tenting, 45° Stage & Truss Rigging (T-4)',
      deliverableDetail: 'Begin full 183,700 sq ft hangar framing, 45° chamfered Zero to One LED stage erection, overhead power reels & circular pod placement.',
      owner: 'Campus Estate + Production',
      exitCriteria: 'Structural stability & fire-safety clearance signed.',
    },
    {
      milestoneId: 'M-09',
      dateLabel: offsetIsoDate(iso, -2),
      phase: 'Shortlist & Build',
      milestoneTitle: 'Arena Handover, Wi-Fi 6E & DG Load Soak Test (T-2)',
      deliverableDetail: 'Test 66 Wi-Fi 6E APs, dual 10 Gbps uplinks, 1,050 kVA N+1 DG sets, Zone F 3-phase hardware feed & 25-lane QR scanners.',
      owner: 'IT Networking + Estate + TBI',
      exitCriteria: 'Zero network packet loss under soak test; 312 volunteers briefed.',
    },
    {
      milestoneId: 'M-10',
      dateLabel: offsetIsoDate(iso, -1),
      phase: 'Shortlist & Build',
      milestoneTitle: 'Full 312-Volunteer Dress Rehearsal & VIP Arrival (T-1)',
      deliverableDetail: 'Dry-run 75-minute check-in simulation, calibrate AV console sound across both wings, receive keynote speakers & hardware kits.',
      owner: 'Unified AI Fest Command',
      exitCriteria: 'Green light signed by TBI Director, Estate & Security Head.',
    },
    {
      milestoneId: 'M-11',
      dateLabel: `${selectedDate.label} 2027`,
      phase: 'Event Day',
      milestoneTitle: '24-Hour Zero to One Mega Hackathon Execution (T-0)',
      deliverableDetail: '08:00 Day 1 check-in → 10:00 Keynote & World Record Count → 24h continuous build across Zones A–F → 08:30 Day 2 Top 12 Grand Finale & Awards.',
      owner: 'TBI + All 5 Partner Depts',
      exitCriteria: '6,000+ verified attendees certified & all 6 track + grand winners awarded.',
    },
    {
      milestoneId: 'M-12',
      dateLabel: offsetIsoDate(iso, 7),
      phase: 'Post-Event',
      milestoneTitle: 'TBI Startup Induction & Impact Dossier (T+7)',
      deliverableDetail: 'Induct Top 25 venture teams into TBI pre-incubation, release sponsor impact report, settle prize escrow & archive record proof.',
      owner: 'TBI Incubation & Leadership',
      exitCriteria: 'Incubation letters issued & full post-mortem filed with CU Leadership.',
    },
  ];
}

/**
 * Generates clean, self-contained plain-text briefs for each of the 4 documents
 * (or the complete 4-document master pack) synchronized with live quotas & event date.
 */
export function generateDocumentTextExport(
  docId: DocumentId | 'all',
  tracks: TrackDepartment[],
  summary: ProposalSummary,
  logistics: LogisticsRequirements,
  selectedDate: EventDateOption
): string {
  const sections: string[] = [];

  if (docId === 'all' || docId === 'departments') {
    sections.push(
      [
        '========================================================================',
        'DOC 01 / 04 · DEPARTMENT BIFURCATION & TRACK ARCHITECTURE (CU-Z2O-DOC01)',
        '========================================================================',
        'Event: Zero to One Hackathon — Chandigarh University AI Fest Flagship',
        'Theme: "An idea in the morning, a startup by night"',
        `Total Confirmed Show-Up: ${summary.totalShowUp.toLocaleString()} builders (${summary.totalTeams.toLocaleString()} teams) | Unified Registrations: ${summary.totalRegistrations.toLocaleString()}`,
        `Seat Share: 5 Partner Departments ${summary.departmentsSharePercent}% | TBI Core ${summary.tbiSharePercent}%`,
        `Record Target (6,000+): ${summary.meetsRecordTarget ? `TARGET MET (+${summary.recordBuffer.toLocaleString()} buffer)` : `SHORTFALL (${summary.recordBuffer.toLocaleString()})`}`,
        '',
        'COMPLETE 6-TRACK DEPARTMENT BIFURCATION',
        '---------------------------------------',
        ...tracks.map((t) => {
          const m = calculateTrackMetrics(t);
          return [
            `Track ${t.trackNumber} | ${t.trackShortName} — Lead: ${t.departmentFull} (${t.departmentShort})`,
            `  Zone: ${t.arenaZoneLabel} (${t.footprintSqFt.toLocaleString()} sq ft · ${m.sqftPerParticipant} sq ft/builder · ${m.densityStatus})`,
            `  Quotas: ${m.registrationTarget.toLocaleString()} Registrations (${t.funnelMultiplier.toFixed(1)}x) -> ${m.showUpTarget.toLocaleString()} Show-Up (${m.teamsCount} Teams)`,
            `  Deployment: ${m.mentorsRequired} Mentors | ${m.judgesRequired} Judges | Track Sponsor Target: ₹${t.sponsorTargetLakhs}L`,
            `  Owner: ${t.coordRole}`,
            `  Focus Themes: ${t.focusThemes.join(' ; ')}`,
          ].join('\n');
        }),
      ].join('\n')
    );
  }

  if (docId === 'all' || docId === 'venue') {
    sections.push(
      [
        '========================================================================',
        'DOC 02 / 04 · COMPLETE VENUE PLAN, STRUCTURE & TRACK ZONING (CU-Z2O-DOC02)',
        '========================================================================',
        `Venue: Chandigarh University Bus Parking Arena (${summary.totalArenaSqFt.toLocaleString()} sq ft · 550 x 590 ft L-Footprint)`,
        `Stage Architecture: 45° Chamfered Dual-Wing Zero to One Center Stage + Central AV Console`,
        `Density Basis: ${summary.totalShowUp.toLocaleString()} builders | ${summary.avgSqFtPerParticipant} sq ft/builder overall`,
        '',
        'COMPLETE STRUCTURAL & ZONE INVENTORY',
        '------------------------------------',
        ...VENUE_STRUCTURAL_ZONES.map(
          (z) =>
            `${z.zoneCode} | ${z.structureName}\n  Location: ${z.footprintLocation} | Size: ${z.dimensionsArea}\n  Capacity/Spec: ${z.capacityOrSpec}\n  Engineering: ${z.engineeringAndRole}`
        ),
        '',
        '24-HOUR ARENA ENGINEERING QUANTITIES (LIVE SCALED)',
        '--------------------------------------------------',
        `Network & VLAN: ${logistics.wifiAccessPoints} High-Density Wi-Fi 6E APs | ${logistics.uplinkGbps} Gbps Dual Redundant Fiber`,
        `Power & Hardware: ${logistics.powerKva.toLocaleString()} kVA N+1 Synchronized DG Sets + Direct 3-Phase Building Feed (Zone F Robotics)`,
        `Catering & Hydration: ${logistics.totalMealPacks.toLocaleString()} Meal Packs (4 staggered waves) | ${logistics.waterLiters.toLocaleString()}L Water | ${logistics.portableWashrooms} Sanitation Bays`,
        `Crowd & Safety: ${logistics.checkinLanes} Express QR Lanes (Gates A & B) | ${logistics.volunteersTotal} Staff (${logistics.volunteersPerShift}/shift × 3 shifts) | ${logistics.medicalStations} Medical Bays`,
      ].join('\n')
    );
  }

  if (docId === 'all' || docId === 'sponsors') {
    sections.push(
      [
        '========================================================================',
        'DOC 03 / 04 · SPONSORSHIP, MENTORS, JUDGES & VIP GUESTS (CU-Z2O-DOC03)',
        '========================================================================',
        `Combined Sponsorship Target Pool: ₹${summary.totalSponsorLakhs} Lakhs (₹${summary.centralTbiSponsorLakhs}L TBI Central + ₹${summary.departmentSponsorLakhs}L Track Sponsors)`,
        `Mentoring & Evaluation Corps: ${summary.totalMentors} Mentors (1:25) | ${summary.totalJudges} Track Judges (1:20 teams) + VC Grand Jury`,
        '',
        'SPONSORSHIP TIERS & COMMERCIAL OWNERSHIP',
        '----------------------------------------',
        ...SPONSORSHIP_TIERS.map(
          (s) =>
            `${s.tier} | Slots: ${s.slots} | Value: ${s.investmentPerSlot} | Lead: ${s.managedBy}\n  Entitlements: ${s.coreEntitlements}`
        ),
        '',
        'TRACK-BY-TRACK SPONSOR, MENTOR & JUDGE TARGETS',
        '----------------------------------------------',
        ...tracks.map((t) => {
          const m = calculateTrackMetrics(t);
          return `Track ${t.trackNumber} (${t.trackShortName} · ${t.departmentShort}): Sponsor ₹${t.sponsorTargetLakhs}L [${t.sponsorTargetProfiles.join(', ')}] | ${m.mentorsRequired} Mentors | ${m.judgesRequired} Judges`;
        }),
        '',
        'KEYNOTE SPEAKERS, VIP GUESTS & ADJUDICATION PROTOCOL',
        '----------------------------------------------------',
        ...GUEST_SPEAKER_ROSTER.map(
          (g) =>
            `${g.tierCode} | ${g.category} (${g.targetCount}) — Curated by ${g.curatedBy}\n  Profiles: ${g.profileExamples}\n  Role & Protocol: ${g.arenaRoleAndHospitality}`
        ),
        '',
        'EVALUATION RUBRIC (ROUND 1 & GRAND FINALE)',
        '------------------------------------------',
        ...EVALUATION_RUBRIC.map(
          (r) => `${r.criterion} (${r.weightPercent}%): R1=${r.round1Focus} | Finale=${r.grandFinaleFocus}`
        ),
      ].join('\n')
    );
  }

  if (docId === 'all' || docId === 'timeline') {
    const schedule = buildDateMilestoneSchedule(selectedDate);
    sections.push(
      [
        '========================================================================',
        'DOC 04 / 04 · MASTER TIMELINE, DATES & 24H RUN-OF-SHOW (CU-Z2O-DOC04)',
        '========================================================================',
        `Portal Go-Live: 1 December 2026 | Department Onboarding: 15 December 2026`,
        `Selected 24-Hour Event Window: ${selectedDate.label} 2027 (${selectedDate.dayPair})`,
        `Runway: ${selectedDate.daysFromLaunchDec1}d from Launch | ${selectedDate.daysFromDeptDec15}d from Dept Kickoff | T-10 Shortlist Lock: ${selectedDate.shortlistLockDate} 2027 | T-2 Arena Handover: ${selectedDate.arenaHandoverDate} 2027`,
        '',
        '4-PHASE MASTER EXECUTION OVERVIEW',
        '---------------------------------',
        ...ROADMAP_PHASES.map(
          (p) => `${p.phaseNumber} (${p.dateRange}) — ${p.title} [Owner: ${p.owner}]\n  Headline: ${p.milestoneHeadline}\n  Exit Gate: ${p.exitGate}`
        ),
        '',
        'COMPLETE DATE-BY-DATE MILESTONE CALENDAR',
        '----------------------------------------',
        ...schedule.map(
          (m) => `${m.milestoneId} | ${m.dateLabel} [${m.phase}] — ${m.milestoneTitle}\n  Owner: ${m.owner} | Detail: ${m.deliverableDetail}\n  Exit Criteria: ${m.exitCriteria}`
        ),
        '',
        `24-HOUR ARENA RUN-OF-SHOW (${selectedDate.label} 2027)`,
        '---------------------------------------------------',
        ...RUN_OF_SHOW_24H.map(
          (slot) => `${slot.hourLabel} (${slot.clockTime}) [${slot.stage}] — ${slot.title}\n  Execution: ${slot.arenaAction}\n  Command Owner: ${slot.owner}`
        ),
      ].join('\n')
    );
  }

  return sections.join('\n\n\n');
}
