import { useState } from 'react';
import { Check, QrCode } from 'lucide-react';
import {
  EventDateOption,
  ProposalSummary,
  TrackDepartment,
  calculateTrackMetrics,
} from '../utils/hackathonModel';
import { DOCUMENT_CATALOG } from '../utils/documentBuilder';
import { GOVERNANCE_MATRIX, STRATEGIC_COMPARISON } from '../data/proposalData';
import { DocumentHeader } from './DocumentHeader';
import DepartmentQuotaWorkbench from './DepartmentQuotaWorkbench';

interface Doc1DepartmentsProps {
  tracks: TrackDepartment[];
  summary: ProposalSummary;
  selectedTrackId: string;
  selectedDate: EventDateOption;
  onSelectTrack: (trackId: string) => void;
  onUpdateQuota: (trackId: string, nextShowUp: number, nextFunnel?: number) => void;
  onResetBaseline: () => void;
  isModified: boolean;
  onPrintCurrent: () => void;
  onDownloadCurrent: () => void;
  onOpenExportModal: () => void;
}

export default function Doc1Departments({
  tracks,
  summary,
  selectedTrackId,
  selectedDate,
  onSelectTrack,
  onUpdateQuota,
  onResetBaseline,
  isModified,
  onPrintCurrent,
  onDownloadCurrent,
  onOpenExportModal,
}: Doc1DepartmentsProps) {
  const doc = DOCUMENT_CATALOG[0];
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
    <div data-testid="doc-departments">
      <DocumentHeader
        doc={doc}
        onPrintCurrent={onPrintCurrent}
        onDownloadCurrent={onDownloadCurrent}
        onOpenExportModal={onOpenExportModal}
        metrics={[
          {
            label: 'Confirmed On-Site Builders',
            value: summary.totalShowUp.toLocaleString(),
            detail: `${summary.totalTeams.toLocaleString()} teams · ${summary.meetsRecordTarget ? `+${summary.recordBuffer} record buffer` : 'below 6,000 target'}`,
            accent: true,
          },
          {
            label: 'Unified Portal Registrations',
            value: summary.totalRegistrations.toLocaleString(),
            detail: `Single TBI link · ${(summary.totalRegistrations / Math.max(1, summary.totalShowUp)).toFixed(1)}× avg funnel`,
          },
          {
            label: 'Department / TBI Seat Split',
            value: `${summary.departmentsSharePercent}% / ${summary.tbiSharePercent}%`,
            detail: '5 Partner Academic Depts (4,200) · TBI Core (2,000)',
          },
          {
            label: 'Quota Lock & Execution',
            value: '15 Dec Lock',
            detail: `Portal live 1 Dec · Event slot ${selectedDate.label}`,
          },
        ]}
      />

      {/* Section 1.1: Live Department Quota & Bifurcation Workbench */}
      <DepartmentQuotaWorkbench
        tracks={tracks}
        summary={summary}
        selectedTrackId={selectedTrackId}
        onSelectTrack={onSelectTrack}
        onUpdateQuota={onUpdateQuota}
        onResetBaseline={onResetBaseline}
        isModified={isModified}
      />

      {/* Section 1.2: Complete 6-Track Departmental Dossier Cards */}
      <section className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-[#F4F8F7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              1.2 Complete Track-by-Track Departmental Charter
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              All 6 Zero to One Tracks: Ownership, Focus Themes &amp; Deliverables
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Detailed scope charter for each of the five partner academic departments and TBI Core.
              Every lead owns problem curation, registration attribution, track sponsors, mentors,
              and Round 1–2 judging panels inside their dedicated Bus Parking Arena zone.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tracks.map((track) => {
              const m = calculateTrackMetrics(track);
              return (
                <article
                  key={track.id}
                  className="bg-white border border-[#DCE7E4] rounded-lg p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E6EFEC]">
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#0F766E]">
                          Track {track.trackNumber} · {track.arenaZoneLabel}
                        </p>
                        <h3 className="mt-1 font-serif text-xl font-semibold text-[#0F172A]">
                          {track.trackShortName}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#334155]">
                          Lead: {track.departmentFull}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="w-5 h-5 rounded border shrink-0 mt-1"
                        style={{
                          backgroundColor: track.zoneFill,
                          borderColor: track.zoneStroke,
                        }}
                      />
                    </div>

                    {/* Key Metrics Strip */}
                    <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-[#E6EFEC] text-xs">
                      <div>
                        <dt className="text-[#64748B]">Registrations</dt>
                        <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                          {m.registrationTarget.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#64748B]">Show-Up / Teams</dt>
                        <dd className="mt-0.5 font-mono font-semibold text-[#0F766E] tabular-nums">
                          {m.showUpTarget.toLocaleString()} ({m.teamsCount}T)
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#64748B]">Mentors / Judges</dt>
                        <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                          {m.mentorsRequired} M · {m.judgesRequired} J
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#64748B]">Sponsor Target</dt>
                        <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                          ₹{track.sponsorTargetLakhs} Lakhs
                        </dd>
                      </div>
                    </dl>

                    {/* Focus Domains */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[#0F172A]">Core Focus Domains</p>
                      <ul className="mt-2 space-y-1.5 text-xs text-[#334155]">
                        {track.focusThemes.map((theme) => (
                          <li key={theme} className="flex items-start gap-2">
                            <span className="font-mono text-[#0F766E]">·</span>
                            <span>{theme}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mandatory Deliverables */}
                    <div className="mt-4 pt-4 border-t border-[#E6EFEC]">
                      <p className="text-xs font-semibold text-[#0F172A]">
                        Mandatory Department Deliverables
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs text-[#475569]">
                        {track.departmentDeliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-mono text-[#0F766E] shrink-0">0{idx + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E6EFEC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
                    <span>
                      <strong className="text-[#0F172A]">Accountable Owner:</strong> {track.coordRole}
                    </span>
                    <span className="font-mono tabular-nums">
                      {track.footprintSqFt.toLocaleString()} ft² · {m.sqftPerParticipant} ft²/p
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 1.3: Strategic Shift & Governance Split */}
      <section className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              1.3 Institutional Rationale &amp; Shared Governance
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Why Unify Department Hackathons Under Six Zero to One Tracks
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Last AI Fest, departments hosted separate hackathons across isolated labs. Unifying
              into one flagship arena preserves full department academic credit while cutting
              per-department operational overhead by 70%.
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
                    <td className="py-4 px-5 text-[#475569] align-top leading-relaxed">{row.previousSeason}</td>
                    <td className="py-4 px-5 text-[#0F172A] align-top leading-relaxed">{row.unifiedSeason}</td>
                    <td className="py-4 px-5 font-mono text-xs font-medium text-[#0F766E] align-top leading-relaxed">
                      {row.measurableGain}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TBI vs 5 Departments Governance Split */}
          <div className="mt-12">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
              Governance Split: TBI Central Command vs. 5 Partner Departments
            </h3>
            <p className="mt-1.5 text-sm text-[#475569]">
              Clear accountability boundaries across AIT, CSE, UIE, AIM, Robotics &amp; Mechatronics, and TBI.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-5 border border-[#DCE7E4] bg-[#F8FBFA] rounded-lg divide-y md:divide-y-0 md:divide-x divide-[#DCE7E4]">
              {GOVERNANCE_MATRIX.map((item) => (
                <div key={item.pillar} className="p-5 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#0F172A]">{item.pillar}</h4>
                    <div className="mt-3 pt-3 border-t border-[#DCE7E4]">
                      <p className="text-[11px] font-mono font-semibold text-[#0F766E]">TBI Central</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#334155]">
                        {item.tbiCentralMandate}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#DCE7E4]">
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

      {/* Section 1.4: Single-Link Unified Registration Attribution Prototype */}
      <section className="py-16 sm:py-20 bg-[#F4F8F7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#DCE7E4] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DCE7E4] bg-[#F8FBFA] flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono font-medium text-[#0F766E]">
                  1.4 Single-Link Attribution Mechanism (Goes Live 1 December)
                </p>
                <h2 className="mt-0.5 font-serif text-xl font-semibold text-[#0F172A]">
                  Zero to One Unified Registration Portal &amp; Department Quota Routing
                </h2>
              </div>
              <p className="text-xs font-mono text-[#475569]">URL Blueprint: zerotoone.cuchd.in</p>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!teamName.trim()) return;
                  setSubmittedPass(true);
                }}
                className="lg:col-span-7 space-y-5"
              >
                <p className="text-sm text-[#475569] leading-relaxed">
                  Every participant registers through one master Zero to One TBI portal targeting
                  105,000 registrations. Selecting a track automatically credits that lead
                  department&apos;s quota and assigns the team&apos;s exact Bus Parking Arena bay.
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
                    Zero to One pass updated for team &ldquo;{teamName}&rdquo; under{' '}
                    {activeTrack.trackShortName} Track · {activeTrack.departmentShort} (
                    {activeTrack.arenaZoneLabel}).
                  </p>
                )}
              </form>

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
                      <dd className="mt-0.5 font-mono text-[#6EE7B7]">
                        {deptRefCode || 'Z2O-UNIFIED'}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                    <span>
                      TRACK CAP: {activeMetrics.showUpTarget} PAX ({activeMetrics.teamsCount} TEAMS)
                    </span>
                    <span>24H ARENA PASS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
