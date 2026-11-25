import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { EventDateOption } from '../utils/hackathonModel';
import { ROADMAP_PHASES, RUN_OF_SHOW_24H, RunOfShowSlot } from '../data/proposalData';

interface ExecutionTimelineProps {
  dateOptions: EventDateOption[];
  selectedDateIso: string;
  onSelectDate: (isoDate: string) => void;
}

type StageFilter = 'All' | RunOfShowSlot['stage'];

const STAGE_FILTERS: StageFilter[] = ['All', 'Opening', 'Build Sprint', 'Checkpoint', 'Judging & Finale'];

export default function ExecutionTimeline({
  dateOptions,
  selectedDateIso,
  onSelectDate,
}: ExecutionTimelineProps) {
  const [stageFilter, setStageFilter] = useState<StageFilter>('All');

  const selectedDate =
    dateOptions.find((d) => d.isoDate === selectedDateIso) ?? dateOptions[2] ?? dateOptions[0];

  const visibleRunOfShow =
    stageFilter === 'All'
      ? RUN_OF_SHOW_24H
      : RUN_OF_SHOW_24H.filter((slot) => slot.stage === stageFilter);

  return (
    <section id="timeline" className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-[#F4F8F7]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-mono font-medium text-[#0F766E]">
            4.1 Master Execution Roadmap, Date Window &amp; 24-Hour Run-of-Show
          </p>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
            1 December Go-Live to 28 Jan – 15 Feb Execution Window
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
            A disciplined four-phase operational schedule: unified registration portal launches on
            1 December, all five partner departments lock quotas and faculty coordinators on 15 December,
            and the Bus Parking Arena hosts the 24-hour Zero to One Hackathon on any selected date between
            28 January and 15 February.
          </p>
        </div>

        {/* 4-Phase Master Schedule Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-[#DCE7E4] bg-white rounded-lg divide-y md:divide-y-0 md:divide-x divide-[#DCE7E4]">
          {ROADMAP_PHASES.map((phase) => (
            <article key={phase.phaseNumber} className="p-5 sm:p-6 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="font-semibold text-[#0F766E]">{phase.phaseNumber}</span>
                  <span className="text-[#475569]">{phase.dateRange}</span>
                </div>
                <h3 className="mt-2.5 font-serif text-lg font-semibold text-[#0F172A]">
                  {phase.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#475569]">
                  Owner: {phase.owner}
                </p>

                <p className="mt-3 pt-3 border-t border-[#E6EFEC] text-xs font-semibold text-[#0F172A]">
                  {phase.milestoneHeadline}
                </p>

                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#475569]">
                  {phase.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-[#64748B] shrink-0">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E6EFEC]">
                <p className="text-[11px] font-mono text-[#475569]">Exit Gate</p>
                <p className="mt-0.5 text-xs font-medium text-[#0F172A]">{phase.exitGate}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Event Date Selector (28 Jan – 15 Feb 2027) */}
        <div className="mt-10 bg-white border border-[#DCE7E4] rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#DCE7E4]">
            <div>
              <p className="text-xs font-mono font-medium text-[#0F766E]">
                Interactive Date Slot Planner (28 Jan – 15 Feb 2027)
              </p>
              <h3 className="mt-1 font-serif text-xl font-semibold text-[#0F172A]">
                Select Proposed 24-Hour Hackathon Dates
              </h3>
              <p className="mt-1 text-xs text-[#475569]">
                Choose any start date inside the approved window to recalculate T-minus shortlist locks
                and arena handover dates. Weekend slots (Fri–Sat / Sat–Sun) are marked with a star for
                maximum academic attendance.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#0F172A] shrink-0">
              <Calendar className="w-4 h-4 text-[#0F766E]" />
              <span data-testid="selected-event-date">
                Locked Slot: {selectedDate.label} 2027 ({selectedDate.dayPair})
              </span>
            </div>
          </div>

          {/* 19-Day Window Selector Grid */}
          <div
            role="radiogroup"
            aria-label="Select hackathon start date between 28 January and 15 February"
            className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2"
          >
            {dateOptions.map((option) => {
              const isSelected = option.isoDate === selectedDate.isoDate;
              return (
                <button
                  key={option.isoDate}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectDate(option.isoDate)}
                  className={`px-3 py-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : option.isWeekendRecommended
                        ? 'bg-[#F0FDF9] text-[#0F172A] border-[#99F6E4] hover:border-[#0F766E]'
                        : 'bg-white text-[#334155] border-[#DCE7E4] hover:border-[#0F766E]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-semibold tabular-nums whitespace-nowrap">
                      {option.label}
                    </span>
                    {option.isWeekendRecommended && (
                      <span
                        title="Recommended weekend slot"
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-[#5EEAD4]' : 'text-[#0F766E]'
                        }`}
                      >
                        ★
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] ${
                      isSelected ? 'text-slate-300' : 'text-[#475569]'
                    }`}
                  >
                    {option.dayPair}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Dynamically Computed Countdown Strip for Selected Date */}
          <dl className="mt-6 pt-5 border-t border-[#E6EFEC] grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <dt className="text-[#475569]">Runway from 1 Dec Go-Live</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                {selectedDate.daysFromLaunchDec1} Days
              </dd>
            </div>
            <div>
              <dt className="text-[#475569]">Runway from 15 Dec Dept Onboarding</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                {selectedDate.daysFromDeptDec15} Days
              </dd>
            </div>
            <div>
              <dt className="text-[#475569]">Final Shortlist &amp; RSVP Lock (T-10)</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                {selectedDate.shortlistLockDate} 2027
              </dd>
            </div>
            <div>
              <dt className="text-[#475569]">Bus Parking Arena Handover (T-2)</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F766E] tabular-nums">
                {selectedDate.arenaHandoverDate} 2027
              </dd>
            </div>
          </dl>
        </div>

        {/* 24-Hour Run-of-Show Schedule */}
        <div className="mt-10 bg-white border border-[#DCE7E4] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE7E4] bg-[#F8FBFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                24-Hour Arena Run-of-Show ({selectedDate.label} 2027)
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">
                Synchronized execution across 45° Dual-Wing Center Stage, AV Console, and Track Bays A–F.
              </p>
            </div>

            <div
              role="group"
              aria-label="Filter 24-hour schedule by stage"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFF6F4] border border-[#DCE7E4] rounded-md"
            >
              {STAGE_FILTERS.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  aria-pressed={stageFilter === stage}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    stageFilter === stage
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] text-xs font-semibold text-[#475569]">
                  <th className="py-3 px-5 w-[13%]">Clock / Hour</th>
                  <th className="py-3 px-5 w-[14%]">Phase</th>
                  <th className="py-3 px-5 w-[23%]">Milestone</th>
                  <th className="py-3 px-5 w-[35%]">Bus Parking Arena Execution</th>
                  <th className="py-3 px-5 w-[15%]">Command Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFEC] text-xs sm:text-sm">
                {visibleRunOfShow.map((slot) => (
                  <tr key={slot.hourLabel} className="hover:bg-[#F8FBFA] transition-colors">
                    <td className="py-3.5 px-5 align-top">
                      <span className="font-mono font-semibold text-[#0F172A] block tabular-nums">
                        {slot.hourLabel}
                      </span>
                      <span className="font-mono text-[11px] text-[#475569] tabular-nums">
                        {slot.clockTime}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 align-top font-mono text-xs text-[#0F766E]">
                      {slot.stage}
                    </td>
                    <td className="py-3.5 px-5 align-top font-semibold text-[#0F172A]">
                      {slot.title}
                    </td>
                    <td className="py-3.5 px-5 align-top text-[#475569] leading-relaxed">
                      {slot.arenaAction}
                    </td>
                    <td className="py-3.5 px-5 align-top text-xs font-medium text-[#0F172A]">
                      {slot.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
