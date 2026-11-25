import {
  ProposalSummary,
  LogisticsRequirements,
  EventDateOption,
} from '../utils/hackathonModel';
import { SPONSORSHIP_TIERS } from '../data/proposalData';

interface OperationsAndSponsorsProps {
  summary: ProposalSummary;
  logistics: LogisticsRequirements;
  selectedDate: EventDateOption;
  onOpenPrintModal: () => void;
}

export default function OperationsAndSponsors({
  summary,
  logistics,
  selectedDate,
  onOpenPrintModal,
}: OperationsAndSponsorsProps) {
  return (
    <section id="operations" className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 06. Mega-Scale Arena Operations Engineering */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              06. Mega-Scale Engineering &amp; Sponsorship Architecture
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              24-Hour Arena Infrastructure Scaled for {summary.totalShowUp.toLocaleString()} Builders
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Every engineering estimate below updates automatically from your live Department
              Quota Workbench—giving Campus Estate, IT Networking, and Catering exact procurement
              quantities before tendering begins.
            </p>
          </div>
          <p className="text-xs font-mono text-[#475569] tabular-nums shrink-0">
            Live Basis: {summary.totalShowUp.toLocaleString()} participants · 24h continuous load
          </p>
        </div>

        {/* 4-Column Dynamic Infrastructure Grid */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#DCE7E4] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#DCE7E4] bg-[#F4F8F7]">
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
              45° Center Stage LED/audio, plus direct 3-phase Building tap for SE Mechatronics &amp; Robotics.
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

        {/* Sponsorship Architecture Table */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                Unified Sponsorship Architecture &amp; Revenue Target
              </h3>
              <p className="mt-1 text-sm text-[#475569]">
                TBI closes central Title &amp; Co-Powered partners while each department brings domain
                Track Sponsors aligned with their industry MoUs.
              </p>
            </div>
            <p className="font-mono text-sm font-semibold text-[#0F766E] tabular-nums">
              Target Pool: ₹{summary.totalSponsorLakhs} Lakhs (₹{summary.centralTbiSponsorLakhs}L TBI + ₹
              {summary.departmentSponsorLakhs}L Tracks)
            </p>
          </div>

          <div className="mt-5 overflow-x-auto border border-[#DCE7E4] rounded-lg">
            <table className="w-full text-left border-collapse min-w-[740px]">
              <thead>
                <tr className="border-b border-[#DCE7E4] bg-[#F4F8F7] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-5 w-[22%]">Sponsorship Tier</th>
                  <th className="py-3.5 px-5 w-[14%]">Inventory</th>
                  <th className="py-3.5 px-5 w-[15%]">Target Value</th>
                  <th className="py-3.5 px-5 w-[16%]">Commercial Lead</th>
                  <th className="py-3.5 px-5 w-[33%]">Key Arena &amp; Digital Entitlements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE9] text-sm">
                {SPONSORSHIP_TIERS.map((row) => (
                  <tr key={row.tier} className="hover:bg-[#F4F8F7]/70">
                    <td className="py-4 px-5 font-semibold text-[#0F172A] align-top">{row.tier}</td>
                    <td className="py-4 px-5 font-mono text-xs text-[#475569] align-top">
                      {row.slots}
                    </td>
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
        </div>

        {/* Institutional Sign-Off & Action Block (Print-Ready) */}
        <div className="mt-14 border border-[#0F172A] rounded-lg p-6 sm:p-8 bg-[#F4F8F7]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#CBD5E1]">
            <div>
              <p className="text-xs font-mono font-semibold text-[#0F766E]">
                Executive Proposal Approval Sheet · Zero to One Hackathon (CU AI Fest)
              </p>
              <h3 className="mt-1.5 font-serif text-2xl font-semibold text-[#0F172A]">
                Ready for Chandigarh University Leadership &amp; Department Sign-Off
              </h3>
              <p className="mt-1.5 text-sm text-[#475569]">
                Proposed Window: <strong className="text-[#0F172A]">{selectedDate.label} 2027</strong> ·
                Target Attendance:{' '}
                <strong className="text-[#0F172A] font-mono tabular-nums">
                  {summary.totalShowUp.toLocaleString()} participants
                </strong>{' '}
                · Portal Go-Live: <strong className="text-[#0F172A]">1 December 2026</strong> · Dept
                Kickoff: <strong className="text-[#0F172A]">15 December 2026</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="no-print px-5 py-3 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Export / Print Proposal Brief
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
                <p className="mt-2 font-mono text-[11px] text-[#64748B]">Signature &amp; Date: _______________</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
