import { TrackDepartment } from '../utils/hackathonModel';

export const ORIGINAL_BLUEPRINT_PDF_URL =
  '/assets/aistudio/Tentative_Layout_India_s_Biggest_Hackathon_-_Bus_Parking_A3_Preview_9652a276.pdf';

/**
 * Six unified flagship tracks mapped 1:1 onto the Bus Parking A3 CAD layout (590 ft x 550 ft L-footprint).
 * Baseline total = 6,200 selected show-up participants (exceeds 6,000+ record goal with 200-seat safety buffer)
 * across 1,240 teams and 105,000 unified portal registrations:
 *  - Track 01 · AIT (GenAI & Agents):               1,000 show-up | 15,000 registrations (15.0x)
 *  - Track 02 · CSE (Full-Stack & Cloud):             800 show-up | 10,000 registrations (12.5x)
 *  - Track 03 · UIE (Applied AI & Core Computing):    800 show-up | 10,000 registrations (12.5x)
 *  - Track 04 · AIM (Digital Marketing & Growth):     800 show-up | 10,000 registrations (12.5x)
 *  - Track 05 · Robotics & Mechatronics (Hardware):   800 show-up | 10,000 registrations (12.5x)
 *  - Track 06 · TBI (Builder & Startup):            2,000 show-up | 50,000 registrations (25.0x)
 */
export const BASELINE_TRACKS: TrackDepartment[] = [
  {
    id: 'ait',
    trackNumber: '01',
    trackShortName: 'GenAI & Agents',
    departmentShort: 'AIT',
    departmentFull: 'Apex Institute of Technology (AIT)',
    trackTitle: 'GenAI & Agents Track — Autonomous Multi-Agent Workflows & Applied LLMs',
    category: 'software-ai',
    leadBody: 'Department',
    arenaZoneLabel: 'Zone B · North-East Full Bay',
    arenaWing: 'North Wing (East)',
    footprintSqFt: 33600,
    cadZone: {
      x: 108,
      y: 8,
      width: 86,
      height: 288,
      podCols: 7,
      podRows: 20,
    },
    zoneFill: '#FEE2E2',
    zoneStroke: '#B91C1C',
    zoneTextColor: '#7F1D1D',
    showUpTarget: 1000,
    funnelMultiplier: 15.0,
    avgTeamSize: 5,
    sponsorTargetLakhs: 10,
    focusThemes: [
      'Autonomous Multi-Agent Orchestration & Tool-Use Systems',
      'Enterprise Generative AI Copilots & RAG Pipelines',
      'Vernacular Voice, Vision & Multimodal AI Applications',
    ],
    departmentDeliverables: [
      'Deliver 15,000 unified registrations & 1,000 verified on-site participants (200 teams)',
      'Onboard 40 AI/GenAI industry & faculty mentors plus 10 senior technical judges',
      'Secure ₹10L in GenAI track sponsorships, LLM API credits & industry problem statements',
    ],
    infrastructureNotes:
      'Full-length North-East bay facing directly down the 45° diagonal Zero to One center stage sightline; high-throughput Wi-Fi 6E spine along the 28 ft central promenade.',
    sponsorTargetProfiles: ['AI Model Labs', 'GPU Cloud Platforms', 'Enterprise AI & GCC Partners'],
    coordRole: 'Director / HOD AIT + 2 Faculty SPOCs',
  },
  {
    id: 'cse',
    trackNumber: '02',
    trackShortName: 'Full-Stack & Cloud',
    departmentShort: 'CSE',
    departmentFull: 'Department of Computer Science & Engineering (CSE)',
    trackTitle: 'Full-Stack & Cloud Track — Cloud-Native SaaS, DevOps & Digital Public Infra',
    category: 'software-ai',
    leadBody: 'Department',
    arenaZoneLabel: 'Zone C · Central Upper-West',
    arenaWing: 'Central Arena',
    footprintSqFt: 16200,
    cadZone: {
      x: 206,
      y: 306,
      width: 118,
      height: 112,
      podCols: 10,
      podRows: 8,
    },
    zoneFill: '#DBEAFE',
    zoneStroke: '#1D4ED8',
    zoneTextColor: '#1E3A8A',
    showUpTarget: 800,
    funnelMultiplier: 12.5,
    avgTeamSize: 5,
    sponsorTargetLakhs: 8,
    focusThemes: [
      'Production Full-Stack SaaS & High-Throughput Web Platforms',
      'Cloud-Native Microservices, Kubernetes & DevOps Tooling',
      'Bharat Digital Public Infrastructure (ONDC / UPI / GovTech)',
    ],
    departmentDeliverables: [
      'Deliver 10,000 unified registrations & 800 verified on-site participants (160 teams)',
      'Deploy 32 full-stack & cloud engineering mentors plus 8 technical evaluation judges',
      'Secure ₹8L in cloud track sponsorships and deployment credit packages for teams',
    ],
    infrastructureNotes:
      'Prime front-of-console bay directly facing the 45° Zero to One stage & AV desk; dual redundant gigabit switches feeding overhead pod power/data drops.',
    sponsorTargetProfiles: ['Cloud Hyperscalers', 'DevTools & API Companies', 'IT Services Leaders'],
    coordRole: 'HOD CSE + 2 Faculty SPOCs',
  },
  {
    id: 'uie',
    trackNumber: '03',
    trackShortName: 'Applied AI & Core Computing',
    departmentShort: 'UIE',
    departmentFull: 'University Institute of Engineering (UIE)',
    trackTitle: 'Applied AI & Core Computing Track — Systems, Edge AI, HPC & Cyber-Physical Compute',
    category: 'software-ai',
    leadBody: 'Department',
    arenaZoneLabel: 'Zone D · Central Upper-East',
    arenaWing: 'Central Arena',
    footprintSqFt: 15800,
    cadZone: {
      x: 330,
      y: 306,
      width: 114,
      height: 112,
      podCols: 10,
      podRows: 8,
    },
    zoneFill: '#E0E7FF',
    zoneStroke: '#4338CA',
    zoneTextColor: '#312E81',
    showUpTarget: 800,
    funnelMultiplier: 12.5,
    avgTeamSize: 5,
    sponsorTargetLakhs: 8,
    focusThemes: [
      'Core Systems Computing, Compilers & High-Performance Algorithms',
      'Edge AI Inference, Distributed Compute & Data Engineering',
      'Applied Machine Learning for Security, Healthcare & Smart Grids',
    ],
    departmentDeliverables: [
      'Deliver 10,000 unified registrations & 800 verified on-site participants (160 teams)',
      'Supply 32 systems, core computing & applied AI mentors plus 8 senior engineering judges',
      'Secure ₹8L in compute/AI track sponsorships, benchmark datasets & silicon ecosystem partners',
    ],
    infrastructureNotes:
      'Directly adjacent to the Campus BUILDING fiber uplink for low-latency cluster access, distributed systems demos, and dedicated sandbox VLANs.',
    sponsorTargetProfiles: ['Semiconductor & Compute Firms', 'Data & Analytics Platforms', 'Deep-Tech Engineering Teams'],
    coordRole: 'Dean / HOD UIE + 2 Faculty SPOCs',
  },
  {
    id: 'aim',
    trackNumber: '04',
    trackShortName: 'Digital Marketing & Growth',
    departmentShort: 'AIM',
    departmentFull: 'Apex Institute of Management (AIM)',
    trackTitle: 'Digital Marketing & Growth Track — AI MarTech, Brand Strategy & Performance Commerce',
    category: 'hardware-growth',
    leadBody: 'Department',
    arenaZoneLabel: 'Zone A · North-West Full Bay',
    arenaWing: 'North Wing (West)',
    footprintSqFt: 24000,
    cadZone: {
      x: 8,
      y: 8,
      width: 68,
      height: 288,
      podCols: 5,
      podRows: 20,
    },
    zoneFill: '#FEF3C7',
    zoneStroke: '#B45309',
    zoneTextColor: '#78350F',
    showUpTarget: 800,
    funnelMultiplier: 12.5,
    avgTeamSize: 5,
    sponsorTargetLakhs: 7,
    focusThemes: [
      'AI-Driven Performance Marketing, Funnel Analytics & Attribution',
      'Creator Economy, Viral GTM Campaigns & Brand Storytelling',
      'D2C Growth Automation, CRM Personalization & MarTech Tools',
    ],
    departmentDeliverables: [
      'Deliver 10,000 unified registrations & 800 verified on-site participants (160 teams)',
      'Recruit 32 CMO, growth-marketing & brand-strategy mentors plus 8 industry judges',
      'Secure ₹7L in D2C/MarTech track sponsorships & live consumer-brand growth briefs',
    ],
    infrastructureNotes:
      'Spacious North-West bay directly north of the Main Stage apron with rapid access to the North Promenade for live pitch decks, media booths, and campaign showcases.',
    sponsorTargetProfiles: ['D2C & Consumer Brands', 'MarTech & AdTech Platforms', 'Digital Media Agencies'],
    coordRole: 'Director / HOD AIM + 2 Faculty SPOCs',
  },
  {
    id: 'robotics-mechatronics',
    trackNumber: '05',
    trackShortName: 'Hardware & Robotics',
    departmentShort: 'Robotics & Mechatronics',
    departmentFull: 'Department of Robotics & Mechatronics Engineering',
    trackTitle: 'Hardware & Robotics Track — Autonomous Bots, Drones, Embedded IoT & Prototyping',
    category: 'hardware-growth',
    leadBody: 'Department',
    arenaZoneLabel: 'Zone F · South-East Extension (140×80 ft)',
    arenaWing: 'South-East Wing',
    footprintSqFt: 13600,
    cadZone: {
      x: 454,
      y: 472,
      width: 132,
      height: 74,
      podCols: 11,
      podRows: 5,
    },
    zoneFill: '#DCFCE7',
    zoneStroke: '#15803D',
    zoneTextColor: '#14532D',
    showUpTarget: 800,
    funnelMultiplier: 12.5,
    avgTeamSize: 5,
    sponsorTargetLakhs: 8,
    focusThemes: [
      'Autonomous Mobile Robots, Rovers & Drone Swarms',
      'Embedded Edge IoT, PCB Prototyping & Smart Sensors',
      'Industrial Automation, Assistive Tech & Clean-Energy Hardware',
    ],
    departmentDeliverables: [
      'Deliver 10,000 unified registrations & 800 verified hardware builders (160 teams)',
      'Provide 32 hardware/embedded mentors, lab safety marshals & 8 robotics judges',
      'Secure ₹8L in hardware track sponsorships & microcontroller/sensor kit grants',
    ],
    infrastructureNotes:
      'Strategically placed in the 140×80 ft wing directly attached to the campus BUILDING for 3-phase power drops, dedicated soldering benches, and a safe 25×20 ft bot testing pit.',
    sponsorTargetProfiles: ['Semiconductor & Embedded Brands', 'Robotics OEMs', 'Industrial Automation Firms'],
    coordRole: 'HOD Robotics & Mechatronics + Lab Superintendent',
  },
  {
    id: 'tbi-builder',
    trackNumber: '06',
    trackShortName: 'Builder & Startup',
    departmentShort: 'TBI',
    departmentFull: 'Technology Business Incubator (TBI) & Student Innovation Cell (iEDC)',
    trackTitle: 'Builder & Startup Track — 0-to-1 Venture Building, Open Innovation & National Wildcards',
    category: 'tbi-core',
    leadBody: 'TBI Core',
    arenaZoneLabel: 'Zone E · Central Lower Grand Block',
    arenaWing: 'Central Arena',
    footprintSqFt: 34000,
    cadZone: {
      x: 206,
      y: 438,
      width: 238,
      height: 106,
      podCols: 20,
      podRows: 7,
      cutoutBottomLeft: { width: 42, height: 42 },
    },
    zoneFill: '#CCFBF1',
    zoneStroke: '#0F766E',
    zoneTextColor: '#134E4A',
    showUpTarget: 2000,
    funnelMultiplier: 25.0,
    avgTeamSize: 5,
    sponsorTargetLakhs: 18,
    focusThemes: [
      '0-to-1 Venture-Backable Products Shipped in 24 Hours',
      'Pan-India External Student & Founder Wildcard Teams',
      'Direct TBI Pre-Incubation, Seed Grants & Investor Demo Day',
    ],
    departmentDeliverables: [
      'Drive 50,000 national portal registrations & 2,000 verified on-site builders (400 teams)',
      'Curate 80 founder/VC mentors, 20 venture judges, headline keynote speakers & VC grand jury',
      'Anchor ₹45L central Title/Co-Powered pool + ₹18L TBI Builder & Startup seed grants',
    ],
    infrastructureNotes:
      'Occupies the largest contiguous flagship block in the Bus Parking Arena directly facing the Main East-West Sponsor Promenade, 45° Zero to One Stage, and VIP Green Rooms.',
    sponsorTargetProfiles: ['National Title Sponsors', 'VC & Angel Networks', 'Startup India & Ecosystem Grants'],
    coordRole: 'TBI Executive Director & Central Command Team',
  },
];

export interface StrategicComparisonRow {
  dimension: string;
  previousSeason: string;
  unifiedSeason: string;
  measurableGain: string;
}

export const STRATEGIC_COMPARISON: StrategicComparisonRow[] = [
  {
    dimension: 'Registration & Brand Architecture',
    previousSeason: 'Fragmented department hackathon links competing for the same student attention during AI Fest.',
    unifiedSeason: 'Single master Zero to One portal operated by TBI uniting 6 specialized tracks across 5 departments + TBI.',
    measurableGain: '105,000+ unified registrations & single national headline',
  },
  {
    dimension: 'Venue & Scale Impact',
    previousSeason: 'Scattered across individual block labs (150–400 students per room); zero world-record visibility.',
    unifiedSeason: 'One contiguous 183,700 sq ft Bus Parking Arena uniting 6,200 builders for 24 straight hours.',
    measurableGain: 'Eligible for World Record / Guinness audit',
  },
  {
    dimension: 'Sponsorship Bargaining Power',
    previousSeason: 'Departments pitched small ₹50K–₹1L packages individually to overlapping sponsors.',
    unifiedSeason: 'Central ₹45L Title/Co-Powered tier led by TBI + 6 high-impact Track Sponsorships (₹59L).',
    measurableGain: '₹1.04 Cr+ combined cash, grant & cloud pool target',
  },
  {
    dimension: 'Mentors, Judges & Speakers',
    previousSeason: 'Industry leaders declined small isolated tracks; duplicated travel & hospitality costs.',
    unifiedSeason: 'Departments supply domain track mentors/judges; TBI curates national keynote speakers & VC grand jury.',
    measurableGain: '248 mentors & 62 judges under one roof',
  },
  {
    dimension: 'Department Ownership & Credit',
    previousSeason: 'Siloed effort with heavy logistical overhead (food, stage, AV, security) borne by each HOD.',
    unifiedSeason: 'Central ops handled once by TBI/CU Ops; every department owns full academic credit for its Track.',
    measurableGain: '70% lower per-department operational load',
  },
];

export interface ResponsibilityItem {
  pillar: string;
  tbiCentralMandate: string;
  departmentTrackMandate: string;
}

export const GOVERNANCE_MATRIX: ResponsibilityItem[] = [
  {
    pillar: 'Registration & Funnel',
    tbiCentralMandate: 'Launch unified portal on 1 Dec; drive 50,000 TBI/national registrations & track department referral dashboards.',
    departmentTrackMandate: 'Deliver assigned registration funnels (AIT 15k; CSE, UIE, AIM & Robotics 10k each) and confirm on-site quotas.',
  },
  {
    pillar: 'Problem Statements & Track Branding',
    tbiCentralMandate: 'Lead Track 06 (Builder & Startup · 2,000 seats) + enforce uniform Zero to One quality standards across all 6 tracks.',
    departmentTrackMandate: 'Own domain problem statements for GenAI, Cloud, Core Computing, Digital Marketing & Hardware by 15 Dec.',
  },
  {
    pillar: 'Sponsors & Prize Pool',
    tbiCentralMandate: 'Close ₹45L Title, Co-Powered & Ecosystem partners + ₹18L TBI Builder grants; manage central prize escrow.',
    departmentTrackMandate: 'Bring domain Track Sponsors aligned to department industry MoUs (₹7L–₹10L per department track).',
  },
  {
    pillar: 'Mentors, Judges & Speakers',
    tbiCentralMandate: 'Book top-line keynote speakers, unicorn founders, 80 TBI mentors, VC grand jury & world-record adjudicators.',
    departmentTrackMandate: 'Confirm track-specific technical/marketing/hardware mentors (1:25 ratio) & Round 1–2 jury panels (1:20 teams).',
  },
  {
    pillar: '24-Hour Arena Operations',
    tbiCentralMandate: 'Manage Bus Parking tenting, 45° Center Stage AV, 20 Gbps Wi-Fi, DG power, meals, medical & security.',
    departmentTrackMandate: 'Provide 40–50 student volunteers per department to run track helpdesks, attendance & judging flow.',
  },
];

export interface RoadmapPhase {
  phaseNumber: string;
  title: string;
  dateRange: string;
  owner: string;
  milestoneHeadline: string;
  deliverables: string[];
  exitGate: string;
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phaseNumber: 'Phase 01',
    title: 'Go-Live & National Launch',
    dateRange: '1 Dec – 14 Dec 2026',
    owner: 'TBI Central Command',
    milestoneHeadline: 'Hackathon Portal Live on 1 December',
    deliverables: [
      'Launch single unified Zero to One registration portal with 6-track selector & referral tracking',
      'Kick off national 50k TBI Builder & Startup campaign plus AI Fest teaser & sponsor prospectus',
      'File official World Record / Limca & Guinness participation audit protocol',
      'Publish standardized Department Quota MoU & Track Playbook for AIT, CSE, UIE, AIM & Robotics',
    ],
    exitGate: 'Portal live with 15,000+ early registrations & confirmed record audit rules.',
  },
  {
    phaseNumber: 'Phase 02',
    title: 'Department Onboarding & Quota Lock',
    dateRange: '15 Dec 2026 – 5 Jan 2027',
    owner: 'TBI + All 5 Partner Departments',
    milestoneHeadline: 'All 5 Departments Onboarded by 15 December',
    deliverables: [
      '15 Dec Joint Kickoff with AIT, CSE, UIE, AIM, and Robotics & Mechatronics leadership',
      'Lock written Registration (105,000 total) & Show-Up Targets (6,200 total) + Faculty SPOC roster',
      'Publish final 6 Track Problem Statements & close all Track Sponsor commitments',
      'Confirm 248 mentors and 62 judges across industry alumni, founders & partner companies',
    ],
    exitGate: '65,000+ registrations crossed (60%+) and 6/6 Track Sponsors & Jury lists signed.',
  },
  {
    phaseNumber: 'Phase 03',
    title: 'Shortlisting & Arena Engineering',
    dateRange: '6 Jan – 27 Jan 2027',
    owner: 'Track Juries + Campus Estate & IT',
    milestoneHeadline: '6,200 Finalists Confirmed & Bus Parking Rigged',
    deliverables: [
      'Close 105,000+ unified registrations; 6 track juries shortlist top 1,240 teams (+15% waitlist buffer)',
      'Issue QR-coded Arena Zone Passes mapped directly to Bus Parking Track Bays A through F',
      'Install Bus Parking trussing, 66 Wi-Fi 6E APs, dual 10 Gbps fiber, 1,050 kVA DG sets & SE 3-phase hardware feed',
      'Execute full 312-volunteer dress rehearsal & express 25-lane check-in stress test',
    ],
    exitGate: '100% seat confirmation RSVPs locked & 24-hour full-load power/Wi-Fi soak test passed.',
  },
  {
    phaseNumber: 'Phase 04',
    title: '24-Hour Flagship Execution Window',
    dateRange: '28 Jan – 15 Feb 2027',
    owner: 'Unified AI Fest Command (TBI + 5 Depts)',
    milestoneHeadline: '6,200 Builders · One Arena · 24 Continuous Hours',
    deliverables: [
      'Execute 75-minute QR entry across 25 parallel lanes into all 6 Bus Parking Track Zones (A–F)',
      'Run 45° Center Stage Opening Keynote, 2 structured mentor loops, midnight checkpoint & hardware freeze',
      'Conduct simultaneous Track Jury eliminations across all 6 zones to select Top 12 Grand Finalists (2/track)',
      'Main Stage Grand Pitch to TBI VC Jury, World Record Headcount Certification & Award Ceremony',
    ],
    exitGate: '6,000+ verified attendees certified, track & grand winners awarded, and top 25 startups inducted into TBI.',
  },
];

export interface RunOfShowSlot {
  hourLabel: string;
  clockTime: string;
  stage: 'Opening' | 'Build Sprint' | 'Checkpoint' | 'Judging & Finale';
  title: string;
  arenaAction: string;
  owner: string;
}

export const RUN_OF_SHOW_24H: RunOfShowSlot[] = [
  {
    hourLabel: 'H-02 to H00',
    clockTime: '08:00 – 10:00 (Day 1)',
    stage: 'Opening',
    title: '25-Lane QR Check-In & Zone Seating',
    arenaAction: '6,200 participants scan RFID/QR wristbands at North & Central entry chutes and take assigned Track Bays (A–F).',
    owner: 'TBI Ops + 104 Volunteers',
  },
  {
    hourLabel: 'H00 to H01',
    clockTime: '10:00 – 11:00 (Day 1)',
    stage: 'Opening',
    title: 'Grand Opening Keynote & Official Record Count',
    arenaAction: 'CU Leadership, TBI Executive Director & Headline Speakers kick off Zero to One from the 45° Center Stage; simultaneous drone & QR audit count.',
    owner: 'TBI + Record Adjudicators',
  },
  {
    hourLabel: 'H01 to H06',
    clockTime: '11:00 – 16:00 (Day 1)',
    stage: 'Build Sprint',
    title: 'Architecture Sprint & Mentor Loop 01',
    arenaAction: 'All 1,240 teams lock problem specs; 248 department & TBI mentors conduct structured 10-minute table critiques across all 6 tracks.',
    owner: '5 Dept SPOCs + TBI',
  },
  {
    hourLabel: 'H06 to H10',
    clockTime: '16:00 – 20:00 (Day 1)',
    stage: 'Build Sprint',
    title: 'Staggered Dinner Corridor & Sponsor API Clinics',
    arenaAction: 'Wave-based meal distribution (North Wing Zones A–B then Central/SE Zones C–F) prevents queues; Track Sponsors run rapid cloud, growth & hardware clinics.',
    owner: 'Campus Catering + Sponsors',
  },
  {
    hourLabel: 'H10 to H14',
    clockTime: '20:00 – 00:00 (Midnight)',
    stage: 'Checkpoint',
    title: 'Midnight Prototype Checkpoint & Energizer',
    arenaAction: 'Mandatory GitHub, campaign-deck & hardware commit check by Track Marshals; midnight snacks + coffee stations live across central aisles.',
    owner: 'Track Technical Marshals',
  },
  {
    hourLabel: 'H14 to H20',
    clockTime: '00:00 – 06:00 (Day 2)',
    stage: 'Build Sprint',
    title: 'Overnight Build Sprint & Mentor Loop 02',
    arenaAction: 'Security & medical teams on 24/7 watch; overnight mentors unblock GenAI agents, cloud deploys, core-compute benchmarks, growth funnels & robotics rigs.',
    owner: 'Night Shift Ops + Mentors',
  },
  {
    hourLabel: 'H20 to H22',
    clockTime: '06:00 – 08:30 (Day 2)',
    stage: 'Judging & Finale',
    title: 'Code & Hardware Freeze + Track Jury Rounds',
    arenaAction: 'Hard submission cutoff at H20; 62 department & TBI judges evaluate booths in parallel to pick Top 2 teams per Track (12 Grand Finalists).',
    owner: '6 Track Jury Panels',
  },
  {
    hourLabel: 'H22 to H24',
    clockTime: '08:30 – 10:30 (Day 2)',
    stage: 'Judging & Finale',
    title: 'Top 12 Main Stage Demo & Grand Awards',
    arenaAction: '4-minute live demos on the 45° Zero to One Center Stage before VC Grand Jury; 6 Track Prizes, Overall 0-to-1 Champion, TBI Incubation offers & Record Certificate.',
    owner: 'TBI Grand Jury + CU Leadership',
  },
];

export interface SponsorshipTier {
  tier: string;
  slots: string;
  investmentPerSlot: string;
  managedBy: string;
  coreEntitlements: string;
}

export const SPONSORSHIP_TIERS: SponsorshipTier[] = [
  {
    tier: 'Title Partner (Presented By)',
    slots: '1 Slot',
    investmentPerSlot: '₹20 Lakhs',
    managedBy: 'TBI Central',
    coreEntitlements: 'Event naming rights, 45° Main Stage centerpiece branding, keynote address, 100% opt-in talent resume book from 105k funnel, Grand Jury seat.',
  },
  {
    tier: 'Co-Powered By Partners',
    slots: '2 Slots',
    investmentPerSlot: '₹12.5 Lakhs',
    managedBy: 'TBI Central',
    coreEntitlements: 'Prime Central Promenade flagship booth, custom challenge bounty across all 6,200 builders, pre-placement interview fast-track.',
  },
  {
    tier: 'Track Title Sponsors (6 Tracks)',
    slots: '6 Tracks (1–2 / Track)',
    investmentPerSlot: '₹7–18 Lakhs / Track',
    managedBy: 'Respective Dept + TBI',
    coreEntitlements: 'Exclusive track naming & zone gantry branding across AIT, CSE, UIE, AIM, Robotics & TBI tracks, curated problem ownership & track award presentation.',
  },
  {
    tier: 'Cloud, Hardware & MarTech Partners',
    slots: '6–8 Slots',
    investmentPerSlot: 'In-Kind / Credits',
    managedBy: 'TBI + AIT / Robotics / AIM',
    coreEntitlements: 'LLM/GPU & cloud credits, microcontroller/sensor kits, MarTech analytics licenses, domains & developer swag kits for all 1,240 teams.',
  },
];

export interface VenueStructuralZone {
  zoneCode: string;
  structureName: string;
  footprintLocation: string;
  dimensionsArea: string;
  capacityOrSpec: string;
  engineeringAndRole: string;
}

export const VENUE_STRUCTURAL_ZONES: VenueStructuralZone[] = [
  {
    zoneCode: 'STAGE',
    structureName: '45° Dual-Wing Zero to One Center Stage',
    footprintLocation: 'South-West L-Junction (0–110 ft × 334–490 ft)',
    dimensionsArea: '110 × 156 ft chamfered deck',
    capacityOrSpec: 'Panoramic LED visible to both wings',
    engineeringAndRole: 'Anchored at 45° diagonal so North Wing (Zones A–B) and Central/East Wing (Zones C–F) share unobstructed sightlines for keynotes, countdowns & Top 12 Grand Demos.',
  },
  {
    zoneCode: 'AV-FOH',
    structureName: 'Central AV, Lighting & Broadcast Console',
    footprintLocation: 'Directly facing 45° Stage (136–162 ft × 386–428 ft)',
    dimensionsArea: '26 × 42 ft elevated FOH island',
    capacityOrSpec: '4-camera live stream + DMX/line-array',
    engineeringAndRole: 'Dedicated acoustic delay towers routed along North Central Promenade & East-West Promenade to keep speech clarity crisp across 6,200 builders.',
  },
  {
    zoneCode: 'ZONE A',
    structureName: 'Track 04 · Digital Marketing & Growth (AIM)',
    footprintLocation: 'North-West Full Bay (North Wing)',
    dimensionsArea: '68 × 288 ft · 24,000 sq ft',
    capacityOrSpec: '800 builders · 160 circular pods',
    engineeringAndRole: 'Direct north apron sightline to Main Stage; adjacent to Gate A express check-in & North Promenade media/campaign demo booths.',
  },
  {
    zoneCode: 'ZONE B',
    structureName: 'Track 01 · GenAI & Agents (AIT)',
    footprintLocation: 'North-East Full Bay (North Wing)',
    dimensionsArea: '86 × 288 ft · 33,600 sq ft',
    capacityOrSpec: '1,000 builders · 200 circular pods',
    engineeringAndRole: 'Full-length high-density AI wing backed by Wi-Fi 6E spine APs and dedicated low-latency VLAN for agent inference and API demos.',
  },
  {
    zoneCode: 'ZONE C',
    structureName: 'Track 02 · Full-Stack & Cloud (CSE)',
    footprintLocation: 'Central Upper-West Block',
    dimensionsArea: '118 × 112 ft · 16,200 sq ft',
    capacityOrSpec: '800 builders · 160 circular pods',
    engineeringAndRole: 'Front-of-console bay directly facing 45° Stage; dual gigabit switches feeding overhead retractable power reels for zero floor-trip hazards.',
  },
  {
    zoneCode: 'ZONE D',
    structureName: 'Track 03 · Applied AI & Core Computing (UIE)',
    footprintLocation: 'Central Upper-East Block',
    dimensionsArea: '114 × 112 ft · 15,800 sq ft',
    capacityOrSpec: '800 builders · 160 circular pods',
    engineeringAndRole: 'Directly borders Campus BUILDING fiber room for lowest-latency cluster connectivity, sandbox VLANs, and systems benchmarking.',
  },
  {
    zoneCode: 'ZONE E',
    structureName: 'Track 06 · Builder & Startup (TBI Core)',
    footprintLocation: 'Central Lower Grand Block',
    dimensionsArea: '238 × 106 ft · 34,000 sq ft',
    capacityOrSpec: '2,000 builders · 400 circular pods',
    engineeringAndRole: 'Largest flagship contiguous block facing Main East-West Sponsor Promenade, VC Pitch Pod, and South Gate B (13 check-in lanes).',
  },
  {
    zoneCode: 'ZONE F',
    structureName: 'Track 05 · Hardware & Robotics (Robotics & Mechatronics)',
    footprintLocation: 'South-East Extension Wing',
    dimensionsArea: '140 × 80 ft · 13,600 sq ft',
    capacityOrSpec: '800 builders · 160 workbenches',
    engineeringAndRole: 'Directly tapped into Campus BUILDING 3-phase power feed; houses isolated soldering bays, ESD mats, fire-safety marshals & 25×20 ft bot arena.',
  },
  {
    zoneCode: 'BACK-OPS',
    structureName: 'VIP Green Rooms, Driver Rooms & Medical Bays',
    footprintLocation: 'South-West & South-Center Perimeter (y = 492–550 ft)',
    dimensionsArea: 'Dual Green Rooms + 2 Driver/Ops Rooms',
    capacityOrSpec: 'VIP Lounge · Security HQ · 3 Med Bays',
    engineeringAndRole: 'Enclosed climate-controlled speaker/VC holding rooms directly behind stage plus 24/7 ambulance staging, security command & lost-and-found desk.',
  },
  {
    zoneCode: 'PROMENADE',
    structureName: 'North (28 ft) & East-West (18 ft) Corridors + Gates A & B',
    footprintLocation: 'Central Arterial Spine & Entry Plazas',
    dimensionsArea: '46,500 sq ft circulation & utility apron',
    capacityOrSpec: '25 QR Entry Lanes · 6 Sponsor Booths · 2 Exits',
    engineeringAndRole: 'Separates high-footfall meal waves, mentor helpdesks (M-1/M-2), sponsor showcase booths (SP-1 to SP-6), and unobstructed emergency egress.',
  },
];

export interface GuestSpeakerCategory {
  tierCode: string;
  category: string;
  targetCount: string;
  curatedBy: string;
  profileExamples: string;
  arenaRoleAndHospitality: string;
}

export const GUEST_SPEAKER_ROSTER: GuestSpeakerCategory[] = [
  {
    tierCode: 'VIP-01',
    category: 'Chief Guests & Institutional Leadership',
    targetCount: '6–8 Dignitaries',
    curatedBy: 'CU Vice Chancellor Office & TBI',
    profileExamples: 'Chancellor / Pro-VC, Senior Govt IT/DST Officials, Startup India / MeitY Directors',
    arenaRoleAndHospitality: 'H00 Grand Opening Lamp Lighting & Keynote, official World Record certificate unveiling, escorted Green Room protocol.',
  },
  {
    tierCode: 'KEY-02',
    category: 'Headline Tech Founders & AI Visionaries',
    targetCount: '4–6 Keynote Speakers',
    curatedBy: 'TBI Central Command',
    profileExamples: 'Indian Unicorn Founders, AI Research Lab Leads, Hyperscaler CTOs & Deep-Tech Builders',
    arenaRoleAndHospitality: '20-minute main stage fireside chats during Opening (H00) and Evening Inspiration Block, VIP Green Room hospitality & air/hotel logistics.',
  },
  {
    tierCode: 'VC-03',
    category: 'VC Grand Jury & Angel Syndicates',
    targetCount: '12–15 Investors',
    curatedBy: 'TBI Incubation & Investor Cell',
    profileExamples: 'Early-Stage VC Principals, Seed Fund Partners, Angel Network Leads, Corporate Venture Heads',
    arenaRoleAndHospitality: 'Exclusive TBI VC Pitch Pod office hours (H08–H12) + H22–H24 Main Stage Top 12 Grand Finale evaluation & on-spot term-sheet / incubation fast-track.',
  },
  {
    tierCode: 'JURY-04',
    category: 'Domain Track Judges (6 Parallel Panels)',
    targetCount: '62 Senior Judges',
    curatedBy: '5 Partner Depts (42) + TBI (20)',
    profileExamples: 'Principal Engineers, Staff ML Scientists, CMOs, Robotics Architects, Senior Product Managers',
    arenaRoleAndHospitality: '1:20 team judging ratio across Track Bays A–F during H20–H22 Freeze & Evaluation to nominate Top 2 finalists per track.',
  },
  {
    tierCode: 'MENT-05',
    category: '24-Hour Technical & Growth Mentors',
    targetCount: '248 Mentors',
    curatedBy: '5 Partner Depts (168) + TBI (80)',
    profileExamples: 'Industry Alumni, Startup Engineers, Faculty Domain Specialists, Sponsor DevRels & Growth Leads',
    arenaRoleAndHospitality: '1:25 builder ratio operating in 2 structured mentoring loops (H02–H06 & H14–H18) + on-demand Track Helpdesk triage.',
  },
  {
    tierCode: 'AUD-06',
    category: 'World Record Adjudicators & Press',
    targetCount: '4 Auditors + Media Crew',
    curatedBy: 'TBI Operations & CU Media Cell',
    profileExamples: 'Official World Record / Limca Book Witnesses, Drone Aerial Crew, National Tech Press',
    arenaRoleAndHospitality: 'Independent verification of 25-lane QR entry logs, continuous headcount audit at H00–H01, and closing record certification on Main Stage.',
  },
];

export interface EvaluationCriterion {
  criterion: string;
  weightPercent: number;
  round1Focus: string;
  grandFinaleFocus: string;
}

export const EVALUATION_RUBRIC: EvaluationCriterion[] = [
  {
    criterion: '0-to-1 Innovation & Problem Clarity',
    weightPercent: 25,
    round1Focus: 'Originality of approach and sharp alignment with Track Problem Statement.',
    grandFinaleFocus: 'Defensibility, clear wedge into a real market pain point, and differentiation.',
  },
  {
    criterion: 'Technical Execution & Working Prototype',
    weightPercent: 30,
    round1Focus: 'Live deployed code, autonomous agent run, hardware actuation, or live campaign funnel.',
    grandFinaleFocus: 'End-to-end live demo resilience under stage pressure without mocked core logic.',
  },
  {
    criterion: 'Scalability, Architecture & Craft',
    weightPercent: 20,
    round1Focus: 'Clean systems design, compute/latency efficiency, safety compliance & UX polish.',
    grandFinaleFocus: 'Production readiness, unit economics, and ability to handle real user load.',
  },
  {
    criterion: 'Startup Viability & GTM Impact',
    weightPercent: 25,
    round1Focus: 'Clear target customer, measurable ROI or measurable social/campus impact.',
    grandFinaleFocus: 'Venture-backable roadmap, TBI incubation readiness, and founder conviction.',
  },
];

