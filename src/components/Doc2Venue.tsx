import { Box, FileText } from 'lucide-react';
import {
  LogisticsRequirements,
  ProposalSummary,
  TrackDepartment,
} from '../utils/hackathonModel';
import { DOCUMENT_CATALOG } from '../utils/documentBuilder';
import { VENUE_STRUCTURAL_ZONES } from '../data/proposalData';
import { DocumentHeader } from './DocumentHeader';
import ArenaMasterplan from './ArenaMasterplan';

interface Doc2VenueProps {
  tracks: TrackDepartment[];
  summary: ProposalSummary;
  logistics: LogisticsRequirements;
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onAdjustQuota: (trackId: string, nextShowUp: number) => void;
  onOpenOriginalBlueprint: () => void;
  onOpen3DReality: () => void;
  onPrintCurrent: () => void;
  onDownloadCurrent: () => void;
  onOpenExportModal: () => void;
}

const AERIAL_RENDER_SRC = '/src/assets/images/z2o_golden_hour_fig1_final_1795601025824.jpg';
const OFFICIAL_THEME_BANNER = '/assets/aistudio/Screenshot_2026-11-25_at_2.33.38_PM_a87ef155.png';

const VENUE_PLATES = [
  {
    id: 'stage',
    plateNumber: 'Plate 01',
    title: 'Zero to One Dual-Wing Center Stage & AV Console',
    subtitle: '45° Corner Panoramic LED · Visible to Both North & East Wings · Central AV Console',
    image: '/src/assets/images/z2o_stage_nodate_1795612862246.jpg',
    alt: 'Photorealistic architectural render of the Zero to One Hackathon main keynote stage with emerald-to-cobalt 01 branding, foreground AV console, and circular hacking pods extending into both perpendicular wings',
    specs: [
      '45° chamfered corner placement ensures unobstructed stage & LED sightlines across both the North Wing and Central/East Wing lanes',
      'Signature Zero to One emerald-mint to cobalt-indigo 01 identity paired with Chandigarh University & Student Innovation Cell lockup',
      'Central AV/Lighting Console island positioned directly in front of the stage with dual backstage Green Rooms along the south wall',
    ],
  },
  {
    id: 'wayfinding',
    plateNumber: 'Plate 02',
    title: 'Zero to One Track Entrance Gantry & Circular Pod Bays',
    subtitle: 'Mint-to-Cobalt 01 Gantries · 6-Seat Coding Pods · Overhead Retractable Power',
    image: '/src/assets/images/z2o_track_gantry_mockup_1795597582632.jpg',
    alt: 'Exhibition architecture mockup of a Zero to One Hackathon department track entrance gantry accented with emerald-to-cobalt 01 graphics over circular team tables and a mentor helpdesk',
    specs: [
      'Every one of the 6 unified tracks receives a Zero to One truss gantry carrying Lead Department + Track Sponsor identity',
      'Overhead retractable power reels feed 1,240+ circular 6-seat team pods cleanly without floor cable hazards',
      'Dedicated Track Mentor Helpdesk stationed at each bay entrance for 24-hour technical triage and judging coordination',
    ],
  },
  {
    id: 'checkin',
    plateNumber: 'Plate 03',
    title: 'Zero to One 25-Lane Express QR Check-In Plaza',
    subtitle: '75-Minute Throughput for 6,200+ Builders · Live RFID Record Audit',
    image: '/src/assets/images/z2o_checkin_plaza_mockup_1795597584473.jpg',
    alt: 'Architectural campus photograph of the Zero to One Hackathon express QR check-in plaza with numbered lanes, mint-to-cobalt kiosk branding, and large building facade banners',
    specs: [
      'Split across Gate A (North Wing, 12 lanes) and Gate B (South-Central, 13 lanes) with matching Zero to One facade banners',
      '15-second QR scan & wristband issuance verifies official World Record attendance headcount in real time',
      'Live attendance telemetry streams directly to TBI Central Command & all 5 partner Department HOD quota dashboards',
    ],
  },
];

export default function Doc2Venue({
  tracks,
  summary,
  logistics,
  selectedTrackId,
  onSelectTrack,
  onAdjustQuota,
  onOpenOriginalBlueprint,
  onOpen3DReality,
  onPrintCurrent,
  onDownloadCurrent,
  onOpenExportModal,
}: Doc2VenueProps) {
  const doc = DOCUMENT_CATALOG[1];

  return (
    <div data-testid="doc-venue">
      <DocumentHeader
        doc={doc}
        onPrintCurrent={onPrintCurrent}
        onDownloadCurrent={onDownloadCurrent}
        onOpenExportModal={onOpenExportModal}
        metrics={[
          {
            label: 'Total Arena Footprint',
            value: `${summary.totalArenaSqFt.toLocaleString()} ft²`,
            detail: '550 × 590 ft Bus Parking A3 L-footprint',
            accent: true,
          },
          {
            label: 'Seating Capacity & Density',
            value: `${summary.avgSqFtPerParticipant} ft²/p`,
            detail: `${summary.totalShowUp.toLocaleString()} builders · ${summary.totalTeams.toLocaleString()} pods across Zones A–F`,
          },
          {
            label: 'Network & Power Backbone',
            value: `${logistics.wifiAccessPoints} APs · ${logistics.powerKva.toLocaleString()} kVA`,
            detail: `${logistics.uplinkGbps} Gbps dual fiber + Building 3-phase feed`,
          },
          {
            label: 'Entry Throughput & Catering',
            value: `${logistics.checkinLanes} Lanes · ${logistics.totalMealPacks.toLocaleString()} Meals`,
            detail: `${logistics.volunteersTotal} staff across 3 shifts · ${logistics.medicalStations} med bays`,
          },
        ]}
      />

      {/* Section 2.1: Hero Architectural Aerial Render (Fig. 1) */}
      <section className="py-12 sm:py-16 border-b border-[#DCE7E4] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono font-medium text-[#0F766E]">
                  2.1 Architectural Concept &amp; L-Wing Massing
                </p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                  One Contiguous Bus Parking Hangar Built Around a 45° Center Stage
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#475569] leading-relaxed">
                  The Bus Parking A3 site forms a crisp 550 × 590 ft L-shaped arena totaling
                  183,700 sq ft. Placing the <strong className="text-[#0F172A]">Zero to One</strong>{' '}
                  main stage on a 45° diagonal chamfer at the inner South-West junction aligns
                  sightlines straight down both the North Wing (AIM &amp; AIT) and the Central/East
                  Wing (CSE, UIE, TBI &amp; Robotics).
                </p>

                <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-[#334155]">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-[#0F766E] shrink-0">01.</span>
                    <span>
                      <strong>Zero Blind Spots:</strong> Both perpendicular seating wings look directly onto the panoramic diagonal LED backdrop.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-[#0F766E] shrink-0">02.</span>
                    <span>
                      <strong>Dedicated 3-Phase Hardware Wing:</strong> Zone F (140×80 ft) attaches directly to the adjacent Campus BUILDING for Robotics &amp; Mechatronics power &amp; safety.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-[#0F766E] shrink-0">03.</span>
                    <span>
                      <strong>Separated Logistics Corridors:</strong> 28 ft North Promenade and 18 ft East-West Promenade isolate sponsor booths, food waves, and emergency egress.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-[#E6EFEC] flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onOpen3DReality}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md transition-colors cursor-pointer"
                >
                  <Box className="w-4 h-4 text-[#5EEAD4]" />
                  Explore 3D Arena Reality
                </button>
                <button
                  type="button"
                  onClick={onOpenOriginalBlueprint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Inspect Original Bus Parking A3 PDF
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col">
              <figure className="flex-1 flex flex-col bg-white border border-[#DCE7E4] rounded-lg overflow-hidden">
                <div className="relative flex-1 min-h-[300px] bg-[#E6F0EE]">
                  <img
                    src={AERIAL_RENDER_SRC}
                    alt="L-shaped Bus Parking A3 architectural render of the Zero to One Hackathon showing the 45-degree centerpiece main stage facing both perpendicular seating wings and the central AV control console"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="px-4 py-3 text-xs text-[#475569] border-t border-[#DCE7E4] bg-[#F8FBFA]">
                  <span className="font-semibold text-[#0F172A]">Fig. 1</span> — Bus Parking A3
                  L-footprint rendered with the 45° <strong className="text-[#0F172A]">Zero to One</strong>{' '}
                  centerpiece stage &amp; central AV console positioned for full dual-wing sightlines across both seating lanes.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.2: Interactive 1:1 CAD Masterplan & Track Inspector */}
      <ArenaMasterplan
        tracks={tracks}
        selectedTrackId={selectedTrackId}
        onSelectTrack={onSelectTrack}
        onAdjustQuota={onAdjustQuota}
        onOpenOriginalBlueprint={onOpenOriginalBlueprint}
      />

      {/* Section 2.3: Complete Structural & Zone-by-Zone Specification Ledger */}
      <section className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-[#F4F8F7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              2.3 Complete Structural Inventory &amp; Zone Engineering
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Every Physical Structure, Track Bay, Backstage Room &amp; Corridor
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Full structural handover schedule for Campus Estate, structural truss contractors, AV
              riggers, and fire-safety auditors covering all 10 functional areas inside the Bus Parking Arena.
            </p>
          </div>

          <div className="mt-7 overflow-x-auto bg-white border border-[#DCE7E4] rounded-lg">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-4 w-[10%]">Zone Code</th>
                  <th className="py-3.5 px-4 w-[22%]">Structure / Assigned Track</th>
                  <th className="py-3.5 px-4 w-[18%]">Arena Location</th>
                  <th className="py-3.5 px-4 w-[15%]">Dimensions / Area</th>
                  <th className="py-3.5 px-4 w-[15%]">Capacity / Spec</th>
                  <th className="py-3.5 px-4 w-[20%]">Engineering &amp; Operational Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFEC] text-xs sm:text-sm">
                {VENUE_STRUCTURAL_ZONES.map((zone) => (
                  <tr key={zone.zoneCode} className="hover:bg-[#F8FBFA] transition-colors">
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-[#0F766E] align-top whitespace-nowrap">
                      {zone.zoneCode}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#0F172A] align-top">
                      {zone.structureName}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#475569] align-top">
                      {zone.footprintLocation}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#0F172A] align-top tabular-nums">
                      {zone.dimensionsArea}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#334155] align-top tabular-nums">
                      {zone.capacityOrSpec}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#475569] leading-relaxed align-top">
                      {zone.engineeringAndRole}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4-Column Live Engineering Quantities */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                24-Hour Arena Utilities &amp; Site Engineering Quantities
              </h3>
              <p className="text-xs font-mono text-[#475569] tabular-nums">
                Auto-scaled for {summary.totalShowUp.toLocaleString()} participants · 24h continuous load
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#DCE7E4] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#DCE7E4] bg-white">
              <div className="p-5 sm:p-6">
                <p className="text-xs font-mono text-[#0F766E]">01. Network &amp; VLAN</p>
                <p
                  data-testid="ops-wifi-aps"
                  className="mt-2 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {logistics.wifiAccessPoints} APs · {logistics.uplinkGbps} Gbps
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  High-density Wi-Fi 6E mesh (1 AP / 95 builders), dual redundant 10 Gbps leased fiber
                  uplinks, plus low-latency compute VLANs for Zone B AIT GenAI &amp; Zone D UIE Core Computing.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs font-mono text-[#0F766E]">02. Electrical &amp; Hardware</p>
                <p
                  data-testid="ops-power-kva"
                  className="mt-2 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {logistics.powerKva.toLocaleString()} kVA (N+1)
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  Synchronized DG backup powering {summary.totalTeams.toLocaleString()} pod power drops,
                  45° Center Stage LED/audio, plus direct 3-phase Building tap for Zone F Robotics &amp; Mechatronics.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs font-mono text-[#0F766E]">03. Catering &amp; Hydration</p>
                <p
                  data-testid="ops-meals"
                  className="mt-2 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {logistics.totalMealPacks.toLocaleString()} Meals
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  4 staggered wave cycles (Dinner, Midnight Snack, Breakfast, Lunch) +{' '}
                  {logistics.waterLiters.toLocaleString()}L filtered water stations and{' '}
                  {logistics.portableWashrooms} sanitation bays.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs font-mono text-[#0F766E]">04. Crowd, Safety &amp; Audit</p>
                <p
                  data-testid="ops-volunteers"
                  className="mt-2 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums"
                >
                  {logistics.checkinLanes} Lanes · {logistics.volunteersTotal} Staff
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  {logistics.volunteersPerShift} student marshals per 8-hour shift across 3 rotations,{' '}
                  {logistics.medicalStations} ambulance/medical bays near Driver Rooms, and QR World Record audit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2.4: Zero to One Stage, Gantry & Check-In Production Mockups */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              2.4 Production Visuals &amp; Wayfinding Architecture
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Zero to One Stage, Track Gantries &amp; 25-Lane Check-In Plaza
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Architectural visual specifications for stage fabrication, department track entry
              gantries, and express check-in plazas inheriting Chandigarh University&apos;s Zero to One identity.
            </p>
          </div>

          {/* Official Theme Identity Anchor */}
          <div className="mt-8 bg-[#F8FBFA] border border-[#DCE7E4] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 bg-[#0B1215] flex items-center justify-center overflow-hidden">
              <img
                src={OFFICIAL_THEME_BANNER}
                alt="Official Chandigarh University Student Innovation Cell Zero to One Hackathon stage banner creative with emerald-to-cobalt 01 emblem and tagline An idea in the morning, a startup by night"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-5 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono font-medium text-[#0F766E]">
                  Official Theme Reference · Master Creative DNA
                </p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-[#0F172A]">
                  Zero to One — &ldquo;An idea in the morning, a startup by night&rdquo;
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  All stage LED backdrops, department track gantries, check-in plazas, and digital
                  passes propagate this master visual language across all 6 tracks.
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-[#DCE7E4] text-xs">
                  <div>
                    <dt className="text-[#64748B]">Primary Gradient</dt>
                    <dd className="mt-1 font-mono font-medium text-[#0F172A] flex items-center gap-2">
                      <span className="inline-block w-8 h-3 rounded-xs z2o-gradient-bar shrink-0" />
                      Mint → Cobalt
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#64748B]">Institutional Lockup</dt>
                    <dd className="mt-1 font-semibold text-[#0F172A]">CU + TBI / iEDC</dd>
                  </div>
                  <div>
                    <dt className="text-[#64748B]">LED Surface Canvas</dt>
                    <dd className="mt-1 font-mono text-[#0F172A]">High-Key Ice White</dd>
                  </div>
                  <div>
                    <dt className="text-[#64748B]">Typographic Contrast</dt>
                    <dd className="mt-1 font-semibold text-[#0F172A]">Bold Ink Black</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-5 h-1.5 w-full rounded-full z2o-gradient-bar" aria-hidden="true" />
            </div>
          </div>

          {/* Plate 01 Featured Center Stage (Date-Free) */}
          <article className="mt-6 bg-white border border-[#DCE7E4] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-8 bg-[#E6F0EE] min-h-[260px]">
              <img
                src={VENUE_PLATES[0].image}
                alt={VENUE_PLATES[0].alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-4 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono font-medium text-[#0F766E]">
                  {VENUE_PLATES[0].plateNumber} · Dual-Wing Center Stage
                </p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-[#0F172A]">
                  {VENUE_PLATES[0].title}
                </h3>
                <p className="mt-1.5 text-xs text-[#475569]">{VENUE_PLATES[0].subtitle}</p>
                <ul className="mt-5 space-y-2.5 text-xs leading-relaxed text-[#334155]">
                  {VENUE_PLATES[0].specs.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-[#0F766E] shrink-0">0{i + 1}.</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-6 pt-4 border-t border-[#E6EFED] text-xs font-mono text-[#475569]">
                CAD Reference: SW 45° Junction (0–110&apos; × 334–490&apos;)
              </p>
            </div>
          </article>

          {/* Plates 02 & 03 Side-by-Side */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {VENUE_PLATES.slice(1).map((plate) => (
              <article
                key={plate.id}
                className="bg-white border border-[#DCE7E4] rounded-lg overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#E6F0EE] overflow-hidden">
                  <img
                    src={plate.image}
                    alt={plate.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-mono font-medium text-[#0F766E]">{plate.plateNumber}</p>
                    <h3 className="mt-1.5 font-serif text-xl font-semibold text-[#0F172A]">
                      {plate.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#475569]">{plate.subtitle}</p>
                    <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[#334155]">
                      {plate.specs.map((spec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-mono text-[#0F766E] shrink-0">0{i + 1}.</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
