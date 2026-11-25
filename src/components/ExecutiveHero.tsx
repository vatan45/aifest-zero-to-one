import { ArrowDownRight, FileText } from 'lucide-react';
import { ProposalSummary, EventDateOption } from '../utils/hackathonModel';
import { GOVERNANCE_MATRIX, STRATEGIC_COMPARISON } from '../data/proposalData';

interface ExecutiveHeroProps {
  summary: ProposalSummary;
  selectedDate: EventDateOption;
  onOpenOriginalBlueprint: () => void;
}

const AERIAL_RENDER_SRC = '/src/assets/images/z2o_golden_hour_fig1_final_1795601025824.jpg';

export default function ExecutiveHero({
  summary,
  selectedDate,
  onOpenOriginalBlueprint,
}: ExecutiveHeroProps) {
  return (
    <section id="overview" className="pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#DCE7E4]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Institutional Proposal Header Split (2-column balanced height) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#475569] tracking-wide">
                Chandigarh University · AI Fest Flagship · TBI &amp; Student Innovation Cell (iEDC)
              </p>

              <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold leading-[1.08] tracking-tight text-[#0F172A]">
                Zero to One Hackathon: 6,000+ Builders, One L-Wing Arena.
              </h1>

              <p className="mt-3 text-sm sm:text-base font-semibold text-[#0F766E]">
                &ldquo;An idea in the morning, a startup by night.&rdquo;
              </p>

              <p className="mt-3 text-base leading-relaxed text-[#334155] max-w-2xl">
                Last AI Fest, departments hosted separate hackathons across isolated labs. This
                season, we unite five partner academic departments and TBI across six flagship tracks
                inside the 183,700 sq ft Bus Parking Arena—anchored by a 45° diagonal{' '}
                <strong className="text-[#0F172A]">Zero to One</strong> center stage visible
                simultaneously to both perpendicular seating wings.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#arena-map"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Inspect Arena CAD Masterplan
                <ArrowDownRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenOriginalBlueprint}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#0F766E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#0F766E]" />
                Reference A3 Layout PDF
              </button>
            </div>
          </div>

          {/* Right: Editorial Architectural Render Plate matching exact A3 L-Shape + Dual-Wing Center Stage */}
          <div className="lg:col-span-6 flex flex-col">
            <figure className="flex-1 flex flex-col bg-white border border-[#DCE7E4] rounded-lg overflow-hidden">
              <div className="relative flex-1 min-h-[280px] bg-[#E6F0EE]">
                <img
                  src={AERIAL_RENDER_SRC}
                  alt="L-shaped Bus Parking A3 architectural render of the Zero to One Hackathon showing the 45-degree centerpiece main stage facing both perpendicular seating wings and the central AV control console"
                  referrerPolicy="no-referrer"
                  className="w-full h-full lg:h-full object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs text-[#475569] border-t border-[#DCE7E4] bg-white">
                <span className="font-semibold text-[#0F172A]">Fig. 1</span> — Bus Parking A3
                L-footprint rendered with the 45° <strong className="text-[#0F172A]">Zero to One</strong>{' '}
                centerpiece stage &amp; central AV console positioned for full dual-wing sightlines across both seating lanes.
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Full-Width 4-Column Operational Utility Strip (adjacent to hero claims) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#DCE7E4] bg-white rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#DCE7E4]">
          <div className="p-5">
            <p className="text-xs font-medium text-[#475569]">Confirmed Show-Up Target</p>
            <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#0F172A] tabular-nums">
              {summary.totalShowUp.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-[#475569] tabular-nums">
              {summary.totalTeams.toLocaleString()} teams · {summary.totalRegistrations.toLocaleString()} unified registrations
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#475569]">Bus Parking Arena Footprint</p>
            <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#0F172A] tabular-nums">
              {summary.totalArenaSqFt.toLocaleString()} ft²
            </p>
            <p className="mt-1 text-xs text-[#475569] tabular-nums">
              550 × 590 ft L-footprint · {summary.avgSqFtPerParticipant} ft² / builder
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#475569]">Activation Milestones</p>
            <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#0F172A] tabular-nums">
              1 Dec / 15 Dec
            </p>
            <p className="mt-1 text-xs text-[#475569]">
              Portal live 1 Dec · All 5 departments onboard 15 Dec
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#475569]">Selected 24-Hour Window</p>
            <p className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#0F766E] tabular-nums">
              {selectedDate.label}
            </p>
            <p className="mt-1 text-xs text-[#475569]">
              28 Jan – 15 Feb window · {selectedDate.dayPair} ({selectedDate.daysFromLaunchDec1}d from launch)
            </p>
          </div>
        </div>

        {/* 01. Strategic Shift: Siloed vs Unified Architecture */}
        <div className="mt-16">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">01. Strategic Architecture</p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Why Unify Department Hackathons Under Six Zero to One Tracks
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#475569] leading-relaxed">
              Every participating department retains full academic identity, track leadership, and sponsor
              attribution—while TBI eliminates duplicated infrastructure overhead and unlocks national world-record
              scale through a single unified Zero to One registration link.
            </p>
          </div>

          <div className="mt-7 overflow-x-auto bg-white border border-[#DCE7E4] rounded-lg">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-5 w-[18%]">Strategic Dimension</th>
                  <th className="py-3.5 px-5 w-[28%]">Last AI Fest (Fragmented Model)</th>
                  <th className="py-3.5 px-5 w-[32%]">This Season (Unified Zero to One Model)</th>
                  <th className="py-3.5 px-5 w-[22%]">Measurable Institutional Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EFECEB] text-sm">
                {STRATEGIC_COMPARISON.map((row) => (
                  <tr key={row.dimension} className="hover:bg-[#F8FBFA]/80 transition-colors">
                    <td className="py-4 px-5 font-semibold text-[#0F172A] align-top">{row.dimension}</td>
                    <td className="py-4 px-5 text-[#475569] align-top leading-relaxed">
                      {row.previousSeason}
                    </td>
                    <td className="py-4 px-5 text-[#0F172A] align-top leading-relaxed">
                      {row.unifiedSeason}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs font-medium text-[#0F766E] align-top leading-relaxed">
                      {row.measurableGain}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TBI vs Department Shared Governance Matrix */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                Governance Split: TBI Central Command vs. Department Track Leads
              </h3>
              <p className="mt-1.5 text-sm text-[#475569]">
                Clear accountability boundaries across AIT, CSE, UIE, AIM, Robotics &amp; Mechatronics,
                and TBI.
              </p>
            </div>
            <p className="text-xs font-mono text-[#475569] tabular-nums">
              Share of {summary.totalShowUp.toLocaleString()} Seats: Departments {summary.departmentsSharePercent}% · TBI Core{' '}
              {summary.tbiSharePercent}%
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-5 border border-[#DCE7E4] bg-white rounded-lg divide-y md:divide-y-0 md:divide-x divide-[#DCE7E4]">
            {GOVERNANCE_MATRIX.map((item) => (
              <div key={item.pillar} className="p-5 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A]">{item.pillar}</h4>
                  <div className="mt-3 pt-3 border-t border-[#E7EFECEB]">
                    <p className="text-[11px] font-mono font-semibold text-[#0F766E]">TBI Central</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#334155]">
                      {item.tbiCentralMandate}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#E7EFECEB]">
                  <p className="text-[11px] font-mono font-semibold text-[#0F172A]">5 Departments</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                    {item.departmentTrackMandate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
