import { useState } from 'react';
import { Minus, Plus, RotateCcw, Search } from 'lucide-react';
import {
  TrackDepartment,
  TrackFilterCategory,
  ProposalSummary,
  calculateTrackMetrics,
  filterTracks,
} from '../utils/hackathonModel';

interface DepartmentQuotaWorkbenchProps {
  tracks: TrackDepartment[];
  summary: ProposalSummary;
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onUpdateQuota: (trackId: string, nextShowUp: number, nextFunnel?: number) => void;
  onResetBaseline: () => void;
  isModified: boolean;
}

const FILTER_TABS: Array<{ id: TrackFilterCategory; label: string }> = [
  { id: 'all', label: 'All Tracks (6)' },
  { id: 'software-ai', label: 'AI & Computing' },
  { id: 'hardware-growth', label: 'Hardware & Marketing' },
  { id: 'tbi-core', label: 'TBI Startup Core' },
];

export default function DepartmentQuotaWorkbench({
  tracks,
  summary,
  selectedTrackId,
  onSelectTrack,
  onUpdateQuota,
  onResetBaseline,
  isModified,
}: DepartmentQuotaWorkbenchProps) {
  const [category, setCategory] = useState<TrackFilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleTracks = filterTracks(tracks, category, searchQuery);

  // Funnel conversion stage figures computed live from total registrations & show-up target
  const round1Submissions = Math.round(summary.totalRegistrations * 0.65);
  const shortlistedWithWaitlist = Math.round(summary.totalShowUp * 1.15);

  return (
    <section id="departments" className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-white">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              1.1 Department Quotas &amp; Accountability Ledger
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Capacity Targets Across All 5 Partner Departments + TBI Core
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Every department commits to a capacity-proportioned Registration Target and Confirmed
              Show-Up Quota on 15 December, alongside Track Sponsors, Mentors, and Judges. Adjust
              any target below to stress-test the 6,000+ record threshold and downstream logistics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-[#475569]">Record Threshold (6,000+)</p>
              <p
                data-testid="record-threshold-status"
                className={`font-mono text-sm font-semibold tabular-nums ${
                  summary.meetsRecordTarget ? 'text-[#0F766E]' : 'text-[#B91C1C]'
                }`}
              >
                {summary.meetsRecordTarget
                  ? `Target Met (+${summary.recordBuffer.toLocaleString()} buffer)`
                  : `Shortfall (${summary.recordBuffer.toLocaleString()} seats)`}
              </p>
            </div>

            {isModified && (
              <button
                type="button"
                onClick={onResetBaseline}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-[#F8FBFA] border border-[#CBD5E1] hover:border-[#0F766E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Baseline
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Live Search */}
        <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter departments by domain"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFF6F4] border border-[#DCE7E4] rounded-md"
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                aria-pressed={category === tab.id}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === tab.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <label htmlFor="department-search" className="sr-only">
              Search department or track theme
            </label>
            <input
              id="department-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter department or theme..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F8FBFA] border border-[#CBD5E1] rounded-md text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:border-[#0F766E]"
            />
          </div>
        </div>

        {/* High-Density Interactive Quota Table */}
        <div className="mt-5 overflow-x-auto border border-[#DCE7E4] rounded-lg">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                <th className="py-3.5 px-4">Assigned Track &amp; Lead Dept</th>
                <th className="py-3.5 px-4">Arena Bay</th>
                <th className="py-3.5 px-4 text-right">Reg. Target</th>
                <th className="py-3.5 px-4 text-center">Funnel</th>
                <th className="py-3.5 px-4 text-center">Show-Up Quota</th>
                <th className="py-3.5 px-4 text-right">Teams</th>
                <th className="py-3.5 px-4 text-right">Mentors / Judges</th>
                <th className="py-3.5 px-4 text-right">Track Sponsor</th>
                <th className="py-3.5 px-4 text-right">Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EFEC] text-sm">
              {visibleTracks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 px-4 text-center text-sm text-[#475569]">
                    No department tracks match &ldquo;{searchQuery}&rdquo;.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('all');
                        setSearchQuery('');
                      }}
                      className="font-semibold text-[#0F766E] underline underline-offset-4 cursor-pointer"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                visibleTracks.map((track) => {
                  const m = calculateTrackMetrics(track);
                  const isSelected = track.id === selectedTrackId;

                  return (
                    <tr
                      key={track.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#F0FDF9]' : 'hover:bg-[#F8FBFA]'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectTrack(track.id)}
                          className="text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F766E]"
                        >
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-mono text-xs font-semibold text-[#0F766E]">
                              T{track.trackNumber}
                            </span>
                            <span className="font-semibold text-[#0F172A] group-hover:underline">
                              {track.trackShortName}
                            </span>
                            <span className="text-xs font-medium text-[#475569]">
                              · {track.departmentShort}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1 max-w-[280px]">
                            {track.focusThemes.join(' · ')}
                          </p>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#4B4E57] whitespace-nowrap">
                        <div>{track.arenaZoneLabel.split(' · ')[0]}</div>
                        <div className="font-mono text-[11px] text-[#737782] tabular-nums">
                          {track.footprintSqFt.toLocaleString()} ft²
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-sm font-medium text-[#141518] tabular-nums">
                        {m.registrationTarget.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <label htmlFor={`funnel-${track.id}`} className="sr-only">
                          Funnel ratio for {track.departmentShort}
                        </label>
                        <select
                          id={`funnel-${track.id}`}
                          value={track.funnelMultiplier.toFixed(1)}
                          onChange={(e) =>
                            onUpdateQuota(track.id, track.showUpTarget, Number(e.target.value))
                          }
                          className="font-mono text-xs bg-white border border-[#D4D1C8] rounded px-2 py-1 text-[#141518] focus:outline-none focus:border-[#141518] cursor-pointer"
                        >
                          <option value="5.0">5.0×</option>
                          <option value="10.0">10.0×</option>
                          <option value="12.5">12.5×</option>
                          <option value="15.0">15.0×</option>
                          <option value="20.0">20.0×</option>
                          <option value="25.0">25.0×</option>
                          <option value="30.0">30.0×</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Decrease ${track.departmentShort} target by 50`}
                            onClick={() => onUpdateQuota(track.id, track.showUpTarget - 50)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded border border-[#D4D1C8] bg-white hover:border-[#141518] text-[#141518] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-sm font-semibold text-[#141518] tabular-nums w-12 text-center">
                            {m.showUpTarget.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${track.departmentShort} target by 50`}
                            onClick={() => onUpdateQuota(track.id, track.showUpTarget + 50)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded border border-[#D4D1C8] bg-white hover:border-[#141518] text-[#141518] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#3F434D] tabular-nums">
                        {m.teamsCount}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#3F434D] tabular-nums whitespace-nowrap">
                        {m.mentorsRequired} M / {m.judgesRequired} J
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-[#141518] tabular-nums whitespace-nowrap">
                        ₹{track.sponsorTargetLakhs}L
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono text-xs text-[#141518] tabular-nums">
                          {m.sqftPerParticipant} ft²/p
                        </span>
                        <span
                          className={`block text-[11px] font-medium ${
                            m.densityStatus === 'Overcrowded'
                              ? 'text-[#B91C1C]'
                              : m.densityStatus === 'High Density'
                                ? 'text-[#B45309]'
                                : 'text-[#15803D]'
                          }`}
                        >
                          {m.densityStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Grand Totals Footer Row */}
            <tfoot>
              <tr className="border-t-2 border-[#0F172A] bg-[#F8FBFA] font-semibold text-sm text-[#0F172A]">
                <td className="py-4 px-4" colSpan={2}>
                  Grand Unified Total (All 6 Tracks · 5 Departments + TBI)
                </td>
                <td
                  data-testid="total-registrations"
                  className="py-4 px-4 text-right font-mono tabular-nums"
                >
                  {summary.totalRegistrations.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center font-mono text-xs text-[#475569] tabular-nums">
                  {(summary.totalRegistrations / Math.max(1, summary.totalShowUp)).toFixed(1)}× avg
                </td>
                <td
                  data-testid="total-showup"
                  className="py-4 px-4 text-center font-mono text-base text-[#0F766E] tabular-nums"
                >
                  {summary.totalShowUp.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-nums">
                  {summary.totalTeams.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono text-xs tabular-nums whitespace-nowrap">
                  {summary.totalMentors} M / {summary.totalJudges} J
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                  ₹{summary.departmentSponsorLakhs}L + ₹{summary.centralTbiSponsorLakhs}L
                </td>
                <td className="py-4 px-4 text-right font-mono text-xs tabular-nums whitespace-nowrap">
                  {summary.avgSqFtPerParticipant} ft²/p
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Single-Link Unified Funnel Progression Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#DCE7E4] bg-[#F8FBFA] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#DCE7E4]">
          <div className="p-5">
            <p className="text-xs font-mono text-[#475569]">Stage 01 · 1 Dec – 10 Jan</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
              {summary.totalRegistrations.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#0F172A]">Single Portal Registrations</p>
            <p className="mt-1 text-xs text-[#475569]">
              Unified TBI link with automatic department referral tracking.
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-mono text-[#475569]">Stage 02 · 11 Jan – 16 Jan</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
              {round1Submissions.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#0F172A]">Verified Idea Submissions</p>
            <p className="mt-1 text-xs text-[#475569]">
              Problem-statement decks &amp; GitHub profiles screened by dept juries.
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-mono text-[#475569]">Stage 03 · 17 Jan – 22 Jan</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[#0F172A] tabular-nums">
              {shortlistedWithWaitlist.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#0F172A]">Shortlist + 15% Buffer</p>
            <p className="mt-1 text-xs text-[#475569]">
              Waitlist buffer absorbs no-shows so every track fulfills 100% seat quota.
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-mono text-[#0F766E]">Stage 04 · Event Day Check-In</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-[#0F766E] tabular-nums">
              {summary.totalShowUp.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#0F172A]">Verified Arena Show-Up</p>
            <p className="mt-1 text-xs text-[#475569]">
              QR-audited across 25 lanes for official World Record certification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
