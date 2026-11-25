import {
  EventDateOption,
  ProposalSummary,
} from '../utils/hackathonModel';
import {
  DOCUMENT_CATALOG,
  buildDateMilestoneSchedule,
} from '../utils/documentBuilder';
import { DocumentHeader } from './DocumentHeader';
import ExecutionTimeline from './ExecutionTimeline';

interface Doc4TimelineProps {
  summary: ProposalSummary;
  dateOptions: EventDateOption[];
  selectedDateIso: string;
  selectedDate: EventDateOption;
  onSelectDate: (isoDate: string) => void;
  onPrintCurrent: () => void;
  onDownloadCurrent: () => void;
  onOpenExportModal: () => void;
}

export default function Doc4Timeline({
  summary,
  dateOptions,
  selectedDateIso,
  selectedDate,
  onSelectDate,
  onPrintCurrent,
  onDownloadCurrent,
  onOpenExportModal,
}: Doc4TimelineProps) {
  const doc = DOCUMENT_CATALOG[3];
  const dateMilestones = buildDateMilestoneSchedule(selectedDate);

  return (
    <div data-testid="doc-timeline">
      <DocumentHeader
        doc={doc}
        onPrintCurrent={onPrintCurrent}
        onDownloadCurrent={onDownloadCurrent}
        onOpenExportModal={onOpenExportModal}
        metrics={[
          {
            label: 'Portal Go-Live & Kickoff',
            value: '1 Dec / 15 Dec',
            detail: 'Unified portal live 1 Dec · 5 Depts lock quotas 15 Dec',
          },
          {
            label: 'Selected 24-Hour Slot',
            value: selectedDate.label,
            detail: `${selectedDate.dayPair} · ${selectedDate.daysFromLaunchDec1} days from launch`,
            accent: true,
          },
          {
            label: 'Shortlist & QR Pass Lock',
            value: `${selectedDate.shortlistLockDate}`,
            detail: 'T-10 cutoff · 6,200 finalists + 15% waitlist buffer',
          },
          {
            label: 'Bus Parking Arena Handover',
            value: `${selectedDate.arenaHandoverDate}`,
            detail: 'T-2 soak test · 66 APs, 1,050 kVA DG & 312 staff',
          },
        ]}
      />

      {/* Section 4.1: 4-Phase Roadmap, Interactive 28 Jan – 15 Feb Slot Planner & 24h Run-of-Show */}
      <ExecutionTimeline
        dateOptions={dateOptions}
        selectedDateIso={selectedDateIso}
        onSelectDate={onSelectDate}
      />

      {/* Section 4.2: Complete Chronological Date-by-Date Milestone Calendar */}
      <section className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-mono font-medium text-[#0F766E]">
                4.2 Complete Date-by-Date Execution Calendar
              </p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Chronological Milestones from 1 Dec 2026 to Post-Event Incubation
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
                Every T-minus operational gate below automatically recalculates when you switch the
                24-hour execution date above (currently locked to{' '}
                <strong className="text-[#0F172A]">{selectedDate.label} 2027</strong>).
              </p>
            </div>
            <p className="text-xs font-mono text-[#0F766E] shrink-0">
              12 Locked Gates · T-0 = {selectedDate.label} 2027
            </p>
          </div>

          <div className="mt-7 overflow-x-auto border border-[#DCE7E4] rounded-lg">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] bg-[#F8FBFA] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-4 w-[8%]">ID</th>
                  <th className="py-3.5 px-4 w-[14%]">Target Date</th>
                  <th className="py-3.5 px-4 w-[13%]">Stage</th>
                  <th className="py-3.5 px-4 w-[22%]">Milestone</th>
                  <th className="py-3.5 px-4 w-[27%]">Execution Deliverable &amp; Exit Gate</th>
                  <th className="py-3.5 px-4 w-[16%]">Accountable Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFEC] text-xs sm:text-sm">
                {dateMilestones.map((row) => {
                  const isEventDay = row.phase === 'Event Day';
                  return (
                    <tr
                      key={row.milestoneId}
                      className={isEventDay ? 'bg-[#F0FDF9]' : 'hover:bg-[#F8FBFA] transition-colors'}
                    >
                      <td className="py-4 px-4 font-mono text-xs font-semibold text-[#0F766E] align-top">
                        {row.milestoneId}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs font-semibold text-[#0F172A] align-top tabular-nums whitespace-nowrap">
                        {row.dateLabel}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-[#475569] align-top whitespace-nowrap">
                        {row.phase}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#0F172A] align-top">
                        {row.milestoneTitle}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#475569] leading-relaxed align-top">
                        <p>{row.deliverableDetail}</p>
                        <p className="mt-1 font-mono text-[11px] text-[#0F766E]">
                          Gate: {row.exitCriteria}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-[#0F172A] align-top">
                        {row.owner}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4.3: Institutional Sign-Off Sheet */}
      <section className="py-14 sm:py-16 bg-[#F4F8F7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#0F172A] rounded-lg p-6 sm:p-8 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#CBD5E1]">
              <div>
                <p className="text-xs font-mono font-semibold text-[#0F766E]">
                  Executive Proposal Approval Sheet · Zero to One Hackathon (CU AI Fest)
                </p>
                <h2 className="mt-1.5 font-serif text-2xl font-semibold text-[#0F172A]">
                  Chandigarh University Leadership &amp; Department Master Sign-Off
                </h2>
                <p className="mt-1.5 text-sm text-[#475569]">
                  Locked Execution Slot:{' '}
                  <strong className="text-[#0F172A]">{selectedDate.label} 2027</strong> · Target
                  Attendance:{' '}
                  <strong className="text-[#0F172A] font-mono tabular-nums">
                    {summary.totalShowUp.toLocaleString()} builders ({summary.totalRegistrations.toLocaleString()} reg)
                  </strong>{' '}
                  · Portal Live: <strong className="text-[#0F172A]">1 Dec 2026</strong> · Dept
                  Kickoff: <strong className="text-[#0F172A]">15 Dec 2026</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenExportModal}
                className="no-print px-5 py-3 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Export All 4 Documents
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              {[
                { role: 'Executive Sponsor', office: 'Vice Chancellor / Pro-VC Office, CU' },
                { role: 'Central Program Lead', office: 'Executive Director, TBI & iEDC Chandigarh University' },
                { role: 'Academic Track Leads', office: 'HODs: AIT, CSE, UIE, AIM, Robotics & Mechatronics' },
                { role: 'Campus Operations', office: 'Estate, IT Networking, Security & Catering Heads' },
              ].map((sig) => (
                <div key={sig.role} className="pt-8 border-t border-[#94A3B8]">
                  <p className="font-semibold text-[#0F172A]">{sig.role}</p>
                  <p className="mt-0.5 text-[#475569]">{sig.office}</p>
                  <p className="mt-2 font-mono text-[11px] text-[#64748B]">
                    Signature &amp; Date: _______________
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
