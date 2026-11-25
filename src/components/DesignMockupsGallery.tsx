import { useState } from 'react';
import { Check, QrCode } from 'lucide-react';
import { TrackDepartment, calculateTrackMetrics } from '../utils/hackathonModel';

interface DesignMockupsGalleryProps {
  tracks: TrackDepartment[];
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
}

const OFFICIAL_THEME_BANNER = '/assets/aistudio/Screenshot_2026-11-25_at_2.33.38_PM_a87ef155.png';

const DESIGN_PLATES = [
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

export default function DesignMockupsGallery({
  tracks,
  selectedTrackId,
  onSelectTrack,
}: DesignMockupsGalleryProps) {
  const [teamName, setTeamName] = useState('Apex Founders');
  const [deptRefCode, setDeptRefCode] = useState('Z2O-AIT-2027');
  const [submittedPass, setSubmittedPass] = useState(false);

  const activeTrack = tracks.find((t) => t.id === selectedTrackId) ?? tracks[0];
  const activeMetrics = calculateTrackMetrics(activeTrack);
  const assignedGate = activeTrack.arenaWing.startsWith('North')
    ? 'Gate A · North Wing (Lanes 01–12)'
    : 'Gate B · South-Central (Lanes 13–25)';

  const handleTrackChange = (id: string) => {
    onSelectTrack(id);
    const chosen = tracks.find((t) => t.id === id);
    if (chosen) {
      const cleanCode = chosen.departmentShort.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 8);
      setDeptRefCode(`Z2O-${cleanCode}-2027`);
    }
    setSubmittedPass(false);
  };

  return (
    <section id="mockups" className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-[#F4F8F7]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-mono font-medium text-[#0F766E]">
            03. Zero to One Brand Identity &amp; Production Mockups
          </p>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
            Personalized Creative System: Stage, Track Gantries &amp; Unified Portal
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
            Every physical and digital creative across the Bus Parking Arena inherits Chandigarh
            University&apos;s official <strong className="text-[#0F172A]">Zero to One Hackathon</strong>{' '}
            identity—combining crisp light architectural glass, emerald-mint to cobalt-indigo{' '}
            <span className="font-mono font-semibold text-[#0F766E]">01</span> geometry, and the CU +
            Student Innovation Cell / TBI lockup.
          </p>
        </div>

        {/* Official Reference Theme & Identity Anchor Plate (User's exact Zero to One artwork) */}
        <div className="mt-8 bg-white border border-[#DCE7E4] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
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
                passes strictly propagate this master visual language so all 5 partner departments and TBI
                present as one unmistakable flagship CU brand.
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-[#E6EFED] text-xs">
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

        {/* Plate 01 Full-Width Featured Dual-Wing Stage Production Render */}
        <article className="mt-6 bg-white border border-[#DCE7E4] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 bg-[#E6F0EE] min-h-[260px]">
            <img
              src={DESIGN_PLATES[0].image}
              alt={DESIGN_PLATES[0].alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-4 p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono font-medium text-[#0F766E]">
                {DESIGN_PLATES[0].plateNumber} · Dual-Wing Center Stage
              </p>
              <h3 className="mt-2 font-serif text-xl font-semibold text-[#0F172A]">
                {DESIGN_PLATES[0].title}
              </h3>
              <p className="mt-1.5 text-xs text-[#475569]">{DESIGN_PLATES[0].subtitle}</p>
              <ul className="mt-5 space-y-2.5 text-xs leading-relaxed text-[#334155]">
                {DESIGN_PLATES[0].specs.map((spec, i) => (
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
          {DESIGN_PLATES.slice(1).map((plate) => (
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

        {/* Plate 04: Interactive Single-Link Zero to One Registration Portal & Zone Pass Mockup */}
        <div className="mt-8 bg-white border border-[#DCE7E4] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE7E4] bg-[#F8FBFA] flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono font-medium text-[#0F766E]">
                Plate 04 · Interactive Digital Prototype (Goes Live 1 December)
              </p>
              <h3 className="mt-0.5 font-serif text-xl font-semibold text-[#0F172A]">
                Zero to One Unified Registration Portal &amp; Arena Zone Pass
              </h3>
            </div>
            <p className="text-xs font-mono text-[#475569]">
              URL Blueprint: zerotoone.cuchd.in
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Student Registration Form Mockup */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!teamName.trim()) return;
                setSubmittedPass(true);
              }}
              className="lg:col-span-7 space-y-5"
            >
              <p className="text-sm text-[#475569] leading-relaxed">
                Instead of fragmented department forms, every participant registers through one master
                Zero to One TBI portal targeting 105,000 registrations. Selecting a track automatically
                credits that lead department&apos;s quota and assigns the team&apos;s exact Bus Parking Arena bay.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="mockup-track-select"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Select Hackathon Track (1 of 6)
                  </label>
                  <select
                    id="mockup-track-select"
                    value={activeTrack.id}
                    onChange={(e) => handleTrackChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        Track {t.trackNumber} · {t.trackShortName} ({t.departmentShort})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mockup-ref-code"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Department Attribution Code
                  </label>
                  <input
                    id="mockup-ref-code"
                    type="text"
                    value={deptRefCode}
                    onChange={(e) => {
                      setDeptRefCode(e.target.value);
                      setSubmittedPass(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm font-mono bg-[#F8FBFA] border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mockup-team-name"
                  className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                >
                  Team Name (5 Members Standard Pod)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="mockup-team-name"
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => {
                      setTeamName(e.target.value);
                      setSubmittedPass(false);
                    }}
                    placeholder="Enter team name"
                    className="flex-1 px-3 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-md text-[#0F172A] focus:outline-none focus:border-[#0F766E]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Preview Arena Pass
                  </button>
                </div>
              </div>

              {submittedPass && (
                <p className="text-xs font-medium text-[#0F766E] flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0" />
                  Zero to One pass updated for team &ldquo;{teamName}&rdquo; under {activeTrack.trackShortName} Track · {activeTrack.departmentShort} ({activeTrack.arenaZoneLabel}).
                </p>
              )}
            </form>

            {/* Right: Generated Digital Zero to One Arena Zone Pass Specimen */}
            <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-lg overflow-hidden">
              <div className="h-1.5 w-full z2o-gradient-bar" aria-hidden="true" />
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/15">
                  <div>
                    <p className="text-[11px] font-mono text-[#5EEAD4]">
                      ZERO TO ONE HACKATHON · CU AI FEST
                    </p>
                    <p className="mt-1 font-serif text-lg font-semibold text-white">
                      {teamName.trim() || 'Unnamed Team'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      An idea in the morning, a startup by night
                    </p>
                  </div>
                  <div className="p-2 bg-white text-[#0F172A] rounded">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <dt className="text-slate-400">Assigned Track &amp; Dept</dt>
                    <dd className="mt-0.5 font-semibold text-white">
                      T{activeTrack.trackNumber} · {activeTrack.trackShortName}
                    </dd>
                    <dd className="text-[11px] text-[#5EEAD4]">{activeTrack.departmentShort}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Bus Parking Bay</dt>
                    <dd className="mt-0.5 font-mono text-white">{activeTrack.arenaZoneLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Express Check-In</dt>
                    <dd className="mt-0.5 text-white">{assignedGate}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Dept Quota Attribution</dt>
                    <dd className="mt-0.5 font-mono text-[#6EE7B7]">{deptRefCode || 'Z2O-UNIFIED'}</dd>
                  </div>
                </dl>

                <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                  <span>TRACK CAP: {activeMetrics.showUpTarget} PAX ({activeMetrics.teamsCount} TEAMS)</span>
                  <span>24H ARENA PASS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
