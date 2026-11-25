import {
  ProposalSummary,
  TrackDepartment,
  calculateTrackMetrics,
} from '../utils/hackathonModel';
import { DOCUMENT_CATALOG } from '../utils/documentBuilder';
import {
  EVALUATION_RUBRIC,
  GUEST_SPEAKER_ROSTER,
  SPONSORSHIP_TIERS,
} from '../data/proposalData';
import { DocumentHeader } from './DocumentHeader';

interface Doc3SponsorsGuestsProps {
  tracks: TrackDepartment[];
  summary: ProposalSummary;
  onPrintCurrent: () => void;
  onDownloadCurrent: () => void;
  onOpenExportModal: () => void;
}

export default function Doc3SponsorsGuests({
  tracks,
  summary,
  onPrintCurrent,
  onDownloadCurrent,
  onOpenExportModal,
}: Doc3SponsorsGuestsProps) {
  const doc = DOCUMENT_CATALOG[2];

  const deptMentors = tracks
    .filter((t) => t.leadBody === 'Department')
    .reduce((acc, t) => acc + calculateTrackMetrics(t).mentorsRequired, 0);
  const tbiMentors = summary.totalMentors - deptMentors;

  const deptJudges = tracks
    .filter((t) => t.leadBody === 'Department')
    .reduce((acc, t) => acc + calculateTrackMetrics(t).judgesRequired, 0);
  const tbiJudges = summary.totalJudges - deptJudges;

  return (
    <div data-testid="doc-sponsors">
      <DocumentHeader
        doc={doc}
        onPrintCurrent={onPrintCurrent}
        onDownloadCurrent={onDownloadCurrent}
        onOpenExportModal={onOpenExportModal}
        metrics={[
          {
            label: 'Combined Sponsorship Pool',
            value: `₹${summary.totalSponsorLakhs} Lakhs`,
            detail: `₹${summary.centralTbiSponsorLakhs}L TBI Central + ₹${summary.departmentSponsorLakhs}L across 6 tracks`,
            accent: true,
          },
          {
            label: 'Active 24h Mentor Corps',
            value: `${summary.totalMentors} Mentors`,
            detail: `${deptMentors} from 5 Depts + ${tbiMentors} from TBI (1:25 ratio)`,
          },
          {
            label: 'Track Jury & VC Grand Jury',
            value: `${summary.totalJudges} Judges + 15 VCs`,
            detail: `${deptJudges} Dept + ${tbiJudges} TBI track judges (1:20 teams)`,
          },
          {
            label: 'Keynotes, VIPs & Auditors',
            value: '16–20 VIP Guests',
            detail: 'Chief Guests, Unicorn Founders & 4 Record Witnesses',
          },
        ]}
      />

      {/* Section 3.1: Unified Sponsorship Commercial Architecture */}
      <section className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-mono font-medium text-[#0F766E]">
                3.1 Commercial Sponsorship Architecture
              </p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Central Title Tiers + 6 Domain-Aligned Track Sponsorships
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
                Unifying all departments into a 105,000-registration national funnel multiplies
                sponsor ROI. TBI closes high-value central Title &amp; Co-Powered partners while each
                department leverages its industry MoUs to bring domain-specific Track Sponsors.
              </p>
            </div>
            <p className="font-mono text-sm font-semibold text-[#0F766E] tabular-nums shrink-0">
              Target Pool: ₹{summary.totalSponsorLakhs}L (₹{summary.centralTbiSponsorLakhs}L TBI + ₹
              {summary.departmentSponsorLakhs}L Tracks)
            </p>
          </div>

          <div className="mt-7 overflow-x-auto border border-[#DCE7E4] rounded-lg">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-5 w-[22%]">Sponsorship Tier</th>
                  <th className="py-3.5 px-5 w-[14%]">Inventory</th>
                  <th className="py-3.5 px-5 w-[15%]">Target Value</th>
                  <th className="py-3.5 px-5 w-[16%]">Commercial Lead</th>
                  <th className="py-3.5 px-5 w-[33%]">Key Arena &amp; Digital Entitlements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFEC] text-sm">
                {SPONSORSHIP_TIERS.map((row) => (
                  <tr key={row.tier} className="hover:bg-[#F8FBFA]/80">
                    <td className="py-4 px-5 font-semibold text-[#0F172A] align-top">{row.tier}</td>
                    <td className="py-4 px-5 font-mono text-xs text-[#475569] align-top">{row.slots}</td>
                    <td className="py-4 px-5 font-mono text-xs font-semibold text-[#0F766E] align-top tabular-nums">
                      {row.investmentPerSlot}
                    </td>
                    <td className="py-4 px-5 text-xs font-medium text-[#0F172A] align-top">
                      {row.managedBy}
                    </td>
                    <td className="py-4 px-5 text-xs leading-relaxed text-[#475569] align-top">
                      {row.coreEntitlements}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Track-by-Track Sponsorship Target Breakdown */}
          <div className="mt-12">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
              Track-by-Track Sponsor Quotas &amp; Target Industry Profiles
            </h3>
            <p className="mt-1.5 text-sm text-[#475569]">
              Exact sponsorship revenue commitment, arena bay signage rights, and corporate target
              verticals assigned to each track lead.
            </p>

            <div className="mt-5 overflow-x-auto border border-[#DCE7E4] rounded-lg">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                    <th className="py-3.5 px-4">Track &amp; Lead Body</th>
                    <th className="py-3.5 px-4">Arena Bay Branding</th>
                    <th className="py-3.5 px-4 text-right">Sponsor Target</th>
                    <th className="py-3.5 px-4">Target Sponsor Verticals</th>
                    <th className="py-3.5 px-4">Commercial Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EFEC] text-xs sm:text-sm">
                  {tracks.map((track) => (
                    <tr key={track.id} className="hover:bg-[#F8FBFA]">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-[#0F766E] mr-2">
                          T{track.trackNumber}
                        </span>
                        <span className="font-semibold text-[#0F172A]">{track.trackShortName}</span>
                        <span className="text-xs text-[#475569] ml-1.5">· {track.departmentShort}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#475569]">{track.arenaZoneLabel}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F766E] tabular-nums">
                        ₹{track.sponsorTargetLakhs} Lakhs
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#334155]">
                        {track.sponsorTargetProfiles.join(' · ')}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#475569]">{track.coordRole}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#0F172A] bg-[#F8FBFA] text-sm font-semibold text-[#0F172A]">
                    <td className="py-3.5 px-4" colSpan={2}>
                      Total Track Sponsorships + TBI Central Title/Co-Powered Pool
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#0F766E] tabular-nums">
                      ₹{summary.departmentSponsorLakhs}L + ₹{summary.centralTbiSponsorLakhs}L = ₹
                      {summary.totalSponsorLakhs}L
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#475569]" colSpan={2}>
                      Central prize escrow &amp; unified sponsor invoice settlement via TBI
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.2: Mentors & Jury Deployment Architecture */}
      <section className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-[#F4F8F7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              3.2 Mentors &amp; Jury Deployment Matrix
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              {summary.totalMentors} Mentors &amp; {summary.totalJudges} Track Judges Deployed Across Zones A–F
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Every track staffs a strict 1:25 mentor-to-builder ratio for 24-hour unblocking and a
              1:20 judge-to-team ratio for fair parallel booth evaluations between H20 and H22,
              feeding the Top 2 teams per track (12 Grand Finalists) to the Main Stage VC Grand Jury.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Track-wise Mentor & Judge Table */}
            <div className="lg:col-span-7 overflow-x-auto bg-white border border-[#DCE7E4] rounded-lg">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                    <th className="py-3 px-4">Track &amp; Dept</th>
                    <th className="py-3 px-4 text-right">Builders / Teams</th>
                    <th className="py-3 px-4 text-right">Mentors (1:25)</th>
                    <th className="py-3 px-4 text-right">Judges (1:20T)</th>
                    <th className="py-3 px-4 text-right">Finale Slots</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EFEC] text-xs sm:text-sm">
                  {tracks.map((track) => {
                    const m = calculateTrackMetrics(track);
                    return (
                      <tr key={track.id} className="hover:bg-[#F8FBFA]">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-[#0F766E] mr-1.5">
                            T{track.trackNumber}
                          </span>
                          <span className="font-semibold text-[#0F172A]">{track.trackShortName}</span>
                          <span className="block text-[11px] text-[#64748B]">{track.departmentShort}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-[#334155] tabular-nums">
                          {m.showUpTarget.toLocaleString()} / {m.teamsCount}T
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F172A] tabular-nums">
                          {m.mentorsRequired}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F766E] tabular-nums">
                          {m.judgesRequired}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-[#334155] tabular-nums">
                          Top 2
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#0F172A] bg-[#F8FBFA] font-semibold text-sm text-[#0F172A]">
                    <td className="py-3.5 px-4">Total Across All 6 Tracks</td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums">
                      {summary.totalShowUp.toLocaleString()} / {summary.totalTeams.toLocaleString()}T
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      {summary.totalMentors}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#0F766E] tabular-nums">
                      {summary.totalJudges}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums">
                      12 Finalists
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Right: Standardized Evaluation Rubric */}
            <div className="lg:col-span-5 bg-white border border-[#DCE7E4] rounded-lg p-5 sm:p-6">
              <p className="text-xs font-mono font-medium text-[#0F766E]">
                Standardized 100-Point Judging Rubric
              </p>
              <h3 className="mt-1 font-serif text-lg font-semibold text-[#0F172A]">
                Round 1 Track Booths → Main Stage VC Grand Jury
              </h3>
              <div className="mt-4 divide-y divide-[#E6EFEC]">
                {EVALUATION_RUBRIC.map((item) => (
                  <div key={item.criterion} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#0F172A]">{item.criterion}</p>
                      <span className="font-mono text-xs font-semibold text-[#0F766E] tabular-nums">
                        {item.weightPercent}%
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#475569] leading-relaxed">
                      <strong className="text-[#334155]">Booths:</strong> {item.round1Focus}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#475569] leading-relaxed">
                      <strong className="text-[#334155]">Finale:</strong> {item.grandFinaleFocus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.3: Top-Line Guests, Keynote Speakers & VIP Protocol */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              3.3 Headline Guests, Speakers &amp; VIP Hospitality Protocol
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Curated Keynote Speakers, VC Grand Jury &amp; Record Witnesses
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              TBI curates flagship national speakers, startup founders, VC partners, and official
              World Record adjudicators—supported by dedicated backstage VIP Green Rooms directly
              behind the 45° Zero to One Center Stage.
            </p>
          </div>

          <div className="mt-7 overflow-x-auto border border-[#DCE7E4] rounded-lg">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-4 w-[10%]">Tier</th>
                  <th className="py-3.5 px-4 w-[20%]">Guest / Speaker Category</th>
                  <th className="py-3.5 px-4 w-[13%]">Target Count</th>
                  <th className="py-3.5 px-4 w-[16%]">Curated By</th>
                  <th className="py-3.5 px-4 w-[20%]">Target Profiles</th>
                  <th className="py-3.5 px-4 w-[21%]">Arena Role &amp; Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFEC] text-xs sm:text-sm">
                {GUEST_SPEAKER_ROSTER.map((guest) => (
                  <tr key={guest.tierCode} className="hover:bg-[#F8FBFA]">
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-[#0F766E] align-top whitespace-nowrap">
                      {guest.tierCode}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#0F172A] align-top">
                      {guest.category}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#0F172A] align-top whitespace-nowrap">
                      {guest.targetCount}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#334155] align-top">{guest.curatedBy}</td>
                    <td className="py-4 px-4 text-xs text-[#475569] leading-relaxed align-top">
                      {guest.profileExamples}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#475569] leading-relaxed align-top">
                      {guest.arenaRoleAndHospitality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Backstage Hospitality & Protocol Strip */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 border border-[#DCE7E4] bg-[#F8FBFA] rounded-lg divide-y md:divide-y-0 md:divide-x divide-[#DCE7E4]">
            <div className="p-5">
              <p className="text-xs font-mono font-semibold text-[#0F766E]">Protocol 01 · Arrival &amp; Escort</p>
              <p className="mt-1.5 text-sm font-semibold text-[#0F172A]">Dedicated VIP Entry &amp; Faculty Liaison</p>
              <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                Separate vehicle drop-off behind South-West stage perimeter with 1:1 TBI executive
                liaisons escorting Chief Guests, Unicorn Founders, and VC Partners directly into the
                climate-controlled Green Rooms.
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs font-mono font-semibold text-[#0F766E]">Protocol 02 · Mentor &amp; Jury Lounge</p>
              <p className="mt-1.5 text-sm font-semibold text-[#0F172A]">24-Hour Refreshments &amp; Triage Desk</p>
              <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                All {summary.totalMentors} mentors and {summary.totalJudges} judges receive RFID VIP
                badges, overnight coffee/meal lounge access, and digital judging tablets pre-loaded
                with their assigned Track Bay team roster.
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs font-mono font-semibold text-[#0F766E]">Protocol 03 · Startup &amp; Sponsor ROI</p>
              <p className="mt-1.5 text-sm font-semibold text-[#0F172A]">TBI VC Pitch Pod &amp; Resume Book</p>
              <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                Dedicated VC Pitch Pod at the Central L-Junction enables curated 15-minute investor
                meetings during the hackathon, while Title/Track Sponsors receive the opt-in talent
                dossier from the {summary.totalRegistrations.toLocaleString()}-builder funnel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
