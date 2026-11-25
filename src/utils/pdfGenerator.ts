import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  EventDateOption,
  LogisticsRequirements,
  ProposalSummary,
  TrackDepartment,
  calculateTrackMetrics,
} from './hackathonModel';
import {
  DOCUMENT_CATALOG,
  DocumentId,
  buildDateMilestoneSchedule,
} from './documentBuilder';
import {
  EVALUATION_RUBRIC,
  GOVERNANCE_MATRIX,
  GUEST_SPEAKER_ROSTER,
  ROADMAP_PHASES,
  RUN_OF_SHOW_24H,
  SPONSORSHIP_TIERS,
  STRATEGIC_COMPARISON,
  VENUE_STRUCTURAL_ZONES,
} from '../data/proposalData';

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

const BRAND_INK: [number, number, number] = [15, 23, 42]; // #0F172A
const BRAND_TEAL: [number, number, number] = [15, 118, 110]; // #0F766E
const BRAND_MIST: [number, number, number] = [244, 248, 247]; // #F4F8F7
const BRAND_BORDER: [number, number, number] = [203, 213, 225]; // #CBD5E1
const BRAND_MUTED: [number, number, number] = [71, 85, 105]; // #475569

/**
 * Normalizes non-WinAnsi Unicode symbols (like Indian Rupee ₹) to crisp ASCII-safe
 * PDF typography for built-in jsPDF Helvetica fonts so zero garbled glyphs occur.
 */
export function sanitizePdfText(value: string): string {
  return value
    .replace(/₹/g, 'INR ')
    .replace(/[–—]/g, '-')
    .replace(/×/g, 'x')
    .replace(/·/g, '|')
    .replace(/°/g, ' deg')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→/g, '->')
    .replace(/²/g, '2')
    .replace(/★/g, '*');
}

function getNextY(pdf: JsPdfWithAutoTable, fallbackY: number, pad = 7): number {
  return (pdf.lastAutoTable?.finalY ?? fallbackY) + pad;
}

function ensureSpace(pdf: JsPdfWithAutoTable, y: number, neededMm: number): number {
  if (y + neededMm > 276) {
    pdf.addPage();
    return 18;
  }
  return y;
}

function drawDocumentMasthead(
  pdf: JsPdfWithAutoTable,
  docNumber: string,
  docCode: string,
  title: string,
  subtitle: string,
  audience: string,
  kpis: Array<{ label: string; value: string; sub: string }>
): number {
  // Top gradient-inspired accent bars
  pdf.setFillColor(...BRAND_TEAL);
  pdf.rect(0, 0, 140, 3, 'F');
  pdf.setFillColor(37, 99, 235);
  pdf.rect(140, 0, 70, 3, 'F');

  let y = 13;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...BRAND_TEAL);
  pdf.text(
    sanitizePdfText(`${docNumber} / 04  |  REF: ${docCode}  |  ZERO TO ONE HACKATHON - CU AI FEST`),
    14,
    y
  );

  y += 7;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(...BRAND_INK);
  const titleLines = pdf.splitTextToSize(sanitizePdfText(title), 182);
  pdf.text(titleLines, 14, y);
  y += titleLines.length * 6.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...BRAND_MUTED);
  const subLines = pdf.splitTextToSize(sanitizePdfText(subtitle), 182);
  pdf.text(subLines, 14, y);
  y += subLines.length * 4.5 + 1.5;

  pdf.setFontSize(8);
  pdf.setTextColor(...BRAND_INK);
  pdf.text(sanitizePdfText(`Primary Audience: ${audience}`), 14, y);
  y += 5;

  // 4-column KPI strip
  const boxW = 44;
  const gap = 2;
  const boxH = 19;
  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (boxW + gap);
    pdf.setFillColor(...BRAND_MIST);
    pdf.setDrawColor(...BRAND_BORDER);
    pdf.roundedRect(x, y, boxW, boxH, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...BRAND_MUTED);
    pdf.text(sanitizePdfText(kpi.label), x + 2.5, y + 5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...(idx === 0 ? BRAND_TEAL : BRAND_INK));
    pdf.text(sanitizePdfText(kpi.value), x + 2.5, y + 11.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...BRAND_MUTED);
    const subTrunc = pdf.splitTextToSize(sanitizePdfText(kpi.sub), boxW - 5)[0] ?? '';
    pdf.text(subTrunc, x + 2.5, y + 16.2);
  });

  return y + boxH + 8;
}

function drawSectionHeading(pdf: JsPdfWithAutoTable, y: number, kicker: string, heading: string): number {
  const safeY = ensureSpace(pdf, y, 22);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...BRAND_TEAL);
  pdf.text(sanitizePdfText(kicker.toUpperCase()), 14, safeY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...BRAND_INK);
  pdf.text(sanitizePdfText(heading), 14, safeY + 5.2);

  pdf.setDrawColor(...BRAND_BORDER);
  pdf.line(14, safeY + 7.2, 196, safeY + 7.2);
  return safeY + 11;
}

function addPageFooters(pdf: JsPdfWithAutoTable, docLabel: string, selectedDate: EventDateOption) {
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(...BRAND_BORDER);
    pdf.line(14, 285, 196, 285);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...BRAND_MUTED);
    pdf.text(
      sanitizePdfText(
        `Zero to One Hackathon (CU AI Fest) | ${docLabel} | Event Window: ${selectedDate.label} 2027`
      ),
      14,
      290
    );
    pdf.text(`Page ${p} of ${totalPages}`, 196, 290, { align: 'right' });
  }
}

export interface VenueImageSet {
  aerialDataUrl?: string;
  stageDataUrl?: string;
  gantryDataUrl?: string;
  checkinDataUrl?: string;
}

async function loadImageAsJpegDataUrl(url: string): Promise<string | undefined> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return undefined;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxW = 1100;
        const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      } catch {
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
}

async function loadVenueImages(): Promise<VenueImageSet> {
  const [aerialDataUrl, stageDataUrl, gantryDataUrl, checkinDataUrl] = await Promise.all([
    loadImageAsJpegDataUrl('/src/assets/images/z2o_golden_hour_fig1_final_1795601025824.jpg'),
    loadImageAsJpegDataUrl('/src/assets/images/z2o_stage_nodate_1795612862246.jpg'),
    loadImageAsJpegDataUrl('/src/assets/images/z2o_track_gantry_mockup_1795597582632.jpg'),
    loadImageAsJpegDataUrl('/src/assets/images/z2o_checkin_plaza_mockup_1795597584473.jpg'),
  ]);
  return { aerialDataUrl, stageDataUrl, gantryDataUrl, checkinDataUrl };
}

function renderDoc1IntoPdf(
  pdf: JsPdfWithAutoTable,
  tracks: TrackDepartment[],
  summary: ProposalSummary,
  selectedDate: EventDateOption
) {
  const doc = DOCUMENT_CATALOG[0];
  let y = drawDocumentMasthead(pdf, doc.docNumber, doc.docCode, doc.title, doc.subtitle, doc.primaryAudience, [
    {
      label: 'Confirmed Show-Up',
      value: summary.totalShowUp.toLocaleString(),
      sub: `${summary.totalTeams.toLocaleString()} teams (+${summary.recordBuffer} buffer)`,
    },
    {
      label: 'Unified Registrations',
      value: summary.totalRegistrations.toLocaleString(),
      sub: `${(summary.totalRegistrations / Math.max(1, summary.totalShowUp)).toFixed(1)}x avg funnel`,
    },
    {
      label: 'Seat Split (Dept / TBI)',
      value: `${summary.departmentsSharePercent}% / ${summary.tbiSharePercent}%`,
      sub: '5 Partner Depts + TBI Core',
    },
    {
      label: 'Quota Lock & Slot',
      value: '15 Dec 2026',
      sub: `Portal 1 Dec | Slot ${selectedDate.label}`,
    },
  ]);

  y = drawSectionHeading(pdf, y, 'Section 1.1', 'Department Quotas & 6-Track Allocation Ledger');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.8, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Track & Lead Dept', 'Zone', 'Reg Target', 'Funnel', 'Show-Up', 'Teams', 'Ment/Judg', 'Sponsor', 'Density']],
    body: [
      ...tracks.map((t) => {
        const m = calculateTrackMetrics(t);
        return [
          sanitizePdfText(`T${t.trackNumber} ${t.trackShortName} (${t.departmentShort})`),
          sanitizePdfText(t.arenaZoneLabel.split(' · ')[0]),
          m.registrationTarget.toLocaleString(),
          `${t.funnelMultiplier.toFixed(1)}x`,
          m.showUpTarget.toLocaleString(),
          String(m.teamsCount),
          `${m.mentorsRequired}M / ${m.judgesRequired}J`,
          `INR ${t.sponsorTargetLakhs}L`,
          `${m.sqftPerParticipant} ft2/p`,
        ];
      }),
      [
        'GRAND TOTAL (6 Tracks | 5 Depts + TBI)',
        'A - F',
        summary.totalRegistrations.toLocaleString(),
        `${(summary.totalRegistrations / Math.max(1, summary.totalShowUp)).toFixed(1)}x`,
        summary.totalShowUp.toLocaleString(),
        summary.totalTeams.toLocaleString(),
        `${summary.totalMentors}M / ${summary.totalJudges}J`,
        `INR ${summary.totalSponsorLakhs}L`,
        `${summary.avgSqFtPerParticipant} ft2/p`,
      ],
    ],
    didParseCell(data) {
      if (data.row.index === tracks.length && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 244, 240];
      }
    },
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 1.2', 'Track-by-Track Departmental Charter & Deliverables');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.6, cellPadding: 2.4, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    columnStyles: { 0: { cellWidth: 34, fontStyle: 'bold' }, 1: { cellWidth: 52 }, 2: { cellWidth: 64 }, 3: { cellWidth: 32 } },
    head: [['Track & Lead', 'Core Focus Domains', 'Mandatory Deliverables', 'Accountable Owner']],
    body: tracks.map((t) => [
      sanitizePdfText(`T${t.trackNumber} ${t.trackShortName}\n${t.departmentFull}`),
      sanitizePdfText(t.focusThemes.map((f) => `- ${f}`).join('\n')),
      sanitizePdfText(t.departmentDeliverables.map((d, i) => `${i + 1}. ${d}`).join('\n')),
      sanitizePdfText(`${t.coordRole}\n${t.arenaZoneLabel}`),
    ]),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 1.3', 'Strategic Shift & TBI vs. 5 Departments Governance Split');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.6, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Strategic Dimension', 'Previous Season (Siloed)', 'This Season (Unified Zero to One)', 'Institutional Gain']],
    body: STRATEGIC_COMPARISON.map((r) => [
      sanitizePdfText(r.dimension),
      sanitizePdfText(r.previousSeason),
      sanitizePdfText(r.unifiedSeason),
      sanitizePdfText(r.measurableGain),
    ]),
  });

  y = getNextY(pdf, y, 6);
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.6, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Governance Pillar', 'TBI Central Command Mandate', '5 Partner Departments Mandate']],
    body: GOVERNANCE_MATRIX.map((g) => [
      sanitizePdfText(g.pillar),
      sanitizePdfText(g.tbiCentralMandate),
      sanitizePdfText(g.departmentTrackMandate),
    ]),
  });
}

function renderDoc2IntoPdf(
  pdf: JsPdfWithAutoTable,
  tracks: TrackDepartment[],
  summary: ProposalSummary,
  logistics: LogisticsRequirements,
  images?: VenueImageSet
) {
  const doc = DOCUMENT_CATALOG[1];
  let y = drawDocumentMasthead(pdf, doc.docNumber, doc.docCode, doc.title, doc.subtitle, doc.primaryAudience, [
    {
      label: 'Arena Footprint',
      value: `${summary.totalArenaSqFt.toLocaleString()} ft2`,
      sub: '550 x 590 ft Bus Parking A3',
    },
    {
      label: 'Seating & Density',
      value: `${summary.avgSqFtPerParticipant} ft2/p`,
      sub: `${summary.totalShowUp.toLocaleString()} pax | Zones A-F`,
    },
    {
      label: 'Wi-Fi 6E & Power',
      value: `${logistics.wifiAccessPoints} AP | ${logistics.powerKva} kVA`,
      sub: `${logistics.uplinkGbps} Gbps + 3-phase hardware`,
    },
    {
      label: 'Entry & Catering',
      value: `${logistics.checkinLanes} Lanes | ${logistics.totalMealPacks.toLocaleString()}`,
      sub: `${logistics.volunteersTotal} staff | ${logistics.medicalStations} med bays`,
    },
  ]);

  if (images?.aerialDataUrl) {
    y = drawSectionHeading(pdf, y, 'Section 2.1', 'Architectural Massing & 45 deg Dual-Wing Center Stage (Fig. 1)');
    const imgW = 182;
    const imgH = 92;
    y = ensureSpace(pdf, y, imgH + 14);
    pdf.addImage(images.aerialDataUrl, 'JPEG', 14, y, imgW, imgH);
    pdf.setDrawColor(...BRAND_BORDER);
    pdf.rect(14, y, imgW, imgH);
    y += imgH + 4;
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.8);
    pdf.setTextColor(...BRAND_MUTED);
    pdf.text(
      'Fig. 1 - Bus Parking A3 L-footprint rendered with the 45 deg Zero to One center stage & AV console serving both perpendicular wings.',
      14,
      y
    );
    y += 7;
  }

  y = drawSectionHeading(pdf, y, 'Section 2.2', 'Complete Structural & Zone-by-Zone Inventory (10 Arena Areas)');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.4, cellPadding: 2.2, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    columnStyles: { 0: { cellWidth: 19, fontStyle: 'bold' }, 1: { cellWidth: 38 }, 2: { cellWidth: 30 }, 3: { cellWidth: 28 }, 4: { cellWidth: 67 } },
    head: [['Code', 'Structure / Track', 'Location', 'Size & Spec', 'Engineering & Operational Role']],
    body: VENUE_STRUCTURAL_ZONES.map((z) => [
      sanitizePdfText(z.zoneCode),
      sanitizePdfText(z.structureName),
      sanitizePdfText(z.footprintLocation),
      sanitizePdfText(`${z.dimensionsArea}\n${z.capacityOrSpec}`),
      sanitizePdfText(z.engineeringAndRole),
    ]),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 2.3', '6-Track Bus Parking Bay Density & Engineering Specs');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.6, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Zone & Wing', 'Track & Lead', 'Area (ft2)', 'Show-Up / Pods', 'Density', 'Zone Infrastructure Notes']],
    body: tracks.map((t) => {
      const m = calculateTrackMetrics(t);
      return [
        sanitizePdfText(`${t.arenaZoneLabel}\n(${t.arenaWing})`),
        sanitizePdfText(`T${t.trackNumber} ${t.trackShortName} (${t.departmentShort})`),
        t.footprintSqFt.toLocaleString(),
        `${m.showUpTarget.toLocaleString()} / ${m.teamsCount}`,
        `${m.sqftPerParticipant} ft2/p (${m.densityStatus})`,
        sanitizePdfText(t.infrastructureNotes),
      ];
    }),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 2.4', '24-Hour Arena Utilities & Site Engineering Quantities');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.6, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Engineering Domain', 'Scaled Quantity', 'Technical Specification']],
    body: [
      [
        '01. Network & VLAN',
        `${logistics.wifiAccessPoints} Wi-Fi 6E APs | ${logistics.uplinkGbps} Gbps Fiber`,
        'High-density Wi-Fi 6E mesh (1 AP / 95 builders), dual redundant 10 Gbps leased lines + dedicated compute VLANs for Zone B AIT GenAI & Zone D UIE Core Computing.',
      ],
      [
        '02. Electrical & Hardware',
        `${logistics.powerKva.toLocaleString()} kVA (N+1 DG Backup)`,
        `Powers ${summary.totalTeams.toLocaleString()} overhead pod power drops, 45 deg Center Stage LED/AV console, plus direct 3-phase Building tap for Zone F Robotics & Mechatronics.`,
      ],
      [
        '03. Catering & Hydration',
        `${logistics.totalMealPacks.toLocaleString()} Meal Packs | ${logistics.waterLiters.toLocaleString()}L Water`,
        `4 staggered wave cycles (Dinner, Midnight Snack, Breakfast, Lunch) separating North & Central wings + ${logistics.portableWashrooms} sanitation bays.`,
      ],
      [
        '04. Crowd, Safety & Audit',
        `${logistics.checkinLanes} QR Lanes | ${logistics.volunteersTotal} Staff`,
        `Gates A (12 lanes) & B (13 lanes) for 75-minute check-in, ${logistics.volunteersPerShift} marshals per 8h shift x 3 shifts, ${logistics.medicalStations} medical bays near Driver Rooms.`,
      ],
    ],
  });

  if (images?.stageDataUrl) {
    pdf.addPage();
    y = 18;
    y = drawSectionHeading(pdf, y, 'Section 2.5', 'Zero to One Venue Production Plates (Stage, Gantries & Check-In)');
    pdf.addImage(images.stageDataUrl, 'JPEG', 14, y, 182, 92);
    pdf.setDrawColor(...BRAND_BORDER);
    pdf.rect(14, y, 182, 92);
    y += 96;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...BRAND_INK);
    pdf.text('Plate 01 - Zero to One Dual-Wing Center Stage & Foreground AV Console (Date-Free Panoramic LED)', 14, y);
    y += 8;

    if (images.gantryDataUrl && images.checkinDataUrl) {
      pdf.addImage(images.gantryDataUrl, 'JPEG', 14, y, 88, 66);
      pdf.rect(14, y, 88, 66);
      pdf.addImage(images.checkinDataUrl, 'JPEG', 108, y, 88, 66);
      pdf.rect(108, y, 88, 66);
      y += 70;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('Plate 02 - Department Track Gantry & 6-Seat Pods', 14, y);
      pdf.text('Plate 03 - 25-Lane Express QR Check-In Plaza', 108, y);
    }
  }
}

function renderDoc3IntoPdf(
  pdf: JsPdfWithAutoTable,
  tracks: TrackDepartment[],
  summary: ProposalSummary
) {
  const doc = DOCUMENT_CATALOG[2];
  const deptMentors = tracks
    .filter((t) => t.leadBody === 'Department')
    .reduce((acc, t) => acc + calculateTrackMetrics(t).mentorsRequired, 0);
  const tbiMentors = summary.totalMentors - deptMentors;

  let y = drawDocumentMasthead(pdf, doc.docNumber, doc.docCode, doc.title, doc.subtitle, doc.primaryAudience, [
    {
      label: 'Sponsorship Target Pool',
      value: `INR ${summary.totalSponsorLakhs}L`,
      sub: `INR ${summary.centralTbiSponsorLakhs}L TBI + INR ${summary.departmentSponsorLakhs}L Tracks`,
    },
    {
      label: 'Active 24h Mentors',
      value: `${summary.totalMentors} Mentors`,
      sub: `${deptMentors} Depts + ${tbiMentors} TBI (1:25)`,
    },
    {
      label: 'Jury & VC Panel',
      value: `${summary.totalJudges} Judges + 15 VCs`,
      sub: '1:20 teams -> Top 12 Finale',
    },
    {
      label: 'VIPs & Adjudicators',
      value: '16-20 VIP Guests',
      sub: 'Keynotes, Dignitaries & Auditors',
    },
  ]);

  y = drawSectionHeading(pdf, y, 'Section 3.1', 'Unified Sponsorship Tiers & Commercial Entitlements');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.7, cellPadding: 2.4, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Sponsorship Tier', 'Inventory', 'Target Value', 'Commercial Lead', 'Key Arena & Digital Entitlements']],
    body: SPONSORSHIP_TIERS.map((s) => [
      sanitizePdfText(s.tier),
      sanitizePdfText(s.slots),
      sanitizePdfText(s.investmentPerSlot),
      sanitizePdfText(s.managedBy),
      sanitizePdfText(s.coreEntitlements),
    ]),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 3.2', 'Track-by-Track Sponsor Quotas, Mentors & Judges Deployment');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.6, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Track & Lead Dept', 'Sponsor Target', 'Target Industry Profiles', 'Mentors (1:25)', 'Judges (1:20T)', 'Finale']],
    body: [
      ...tracks.map((t) => {
        const m = calculateTrackMetrics(t);
        return [
          sanitizePdfText(`T${t.trackNumber} ${t.trackShortName} (${t.departmentShort})`),
          `INR ${t.sponsorTargetLakhs} Lakhs`,
          sanitizePdfText(t.sponsorTargetProfiles.join(', ')),
          String(m.mentorsRequired),
          String(m.judgesRequired),
          'Top 2',
        ];
      }),
      [
        'TOTAL (6 Tracks + INR 45L TBI Central)',
        `INR ${summary.totalSponsorLakhs} Lakhs`,
        'Title, Co-Powered, Cloud, Hardware & MarTech Partners',
        String(summary.totalMentors),
        String(summary.totalJudges),
        '12 Finalists',
      ],
    ],
    didParseCell(data) {
      if (data.row.index === tracks.length && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 244, 240];
      }
    },
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 3.3', 'Headline Guests, Keynote Speakers, VC Grand Jury & Protocol');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.5, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Tier', 'Guest / Speaker Category', 'Count', 'Curated By', 'Profiles', 'Arena Role & VIP Hospitality']],
    body: GUEST_SPEAKER_ROSTER.map((g) => [
      sanitizePdfText(g.tierCode),
      sanitizePdfText(g.category),
      sanitizePdfText(g.targetCount),
      sanitizePdfText(g.curatedBy),
      sanitizePdfText(g.profileExamples),
      sanitizePdfText(g.arenaRoleAndHospitality),
    ]),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 3.4', 'Standardized 100-Point Judging Rubric (Booths -> Grand Finale)');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.7, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Evaluation Criterion', 'Weight', 'Round 1 Track Booth Evaluation', 'Main Stage VC Grand Finale']],
    body: EVALUATION_RUBRIC.map((r) => [
      sanitizePdfText(r.criterion),
      `${r.weightPercent}%`,
      sanitizePdfText(r.round1Focus),
      sanitizePdfText(r.grandFinaleFocus),
    ]),
  });
}

function renderDoc4IntoPdf(
  pdf: JsPdfWithAutoTable,
  summary: ProposalSummary,
  selectedDate: EventDateOption
) {
  const doc = DOCUMENT_CATALOG[3];
  const milestones = buildDateMilestoneSchedule(selectedDate);

  let y = drawDocumentMasthead(pdf, doc.docNumber, doc.docCode, doc.title, doc.subtitle, doc.primaryAudience, [
    {
      label: 'Portal & Dept Kickoff',
      value: '1 Dec / 15 Dec',
      sub: 'Portal live 1 Dec | 5 Depts 15 Dec',
    },
    {
      label: 'Selected 24h Event Slot',
      value: sanitizePdfText(selectedDate.label),
      sub: `${selectedDate.dayPair} (${selectedDate.daysFromLaunchDec1}d runway)`,
    },
    {
      label: 'Shortlist Lock (T-10)',
      value: `${selectedDate.shortlistLockDate}`,
      sub: '6,200 finalists + 15% waitlist',
    },
    {
      label: 'Arena Handover (T-2)',
      value: `${selectedDate.arenaHandoverDate}`,
      sub: 'Full Wi-Fi, DG & volunteer test',
    },
  ]);

  y = drawSectionHeading(pdf, y, 'Section 4.1', '4-Phase Master Execution Roadmap (1 Dec 2026 - 15 Feb 2027)');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.6, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Phase & Window', 'Title & Owner', 'Core Deliverables', 'Exit Gate']],
    body: ROADMAP_PHASES.map((p) => [
      sanitizePdfText(`${p.phaseNumber}\n${p.dateRange}`),
      sanitizePdfText(`${p.title}\nOwner: ${p.owner}`),
      sanitizePdfText(p.deliverables.map((d) => `- ${d}`).join('\n')),
      sanitizePdfText(p.exitGate),
    ]),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 4.2', `Complete Date-by-Date Milestone Calendar (T-0 = ${selectedDate.label} 2027)`);
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.4, cellPadding: 2.2, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    columnStyles: { 0: { cellWidth: 13, fontStyle: 'bold' }, 1: { cellWidth: 24, fontStyle: 'bold' }, 2: { cellWidth: 22 }, 3: { cellWidth: 36 }, 4: { cellWidth: 61 }, 5: { cellWidth: 26 } },
    head: [['ID', 'Date', 'Stage', 'Milestone', 'Deliverable & Exit Criteria', 'Owner']],
    body: milestones.map((m) => [
      m.milestoneId,
      sanitizePdfText(m.dateLabel),
      sanitizePdfText(m.phase),
      sanitizePdfText(m.milestoneTitle),
      sanitizePdfText(`${m.deliverableDetail}\nGate: ${m.exitCriteria}`),
      sanitizePdfText(m.owner),
    ]),
  });

  y = getNextY(pdf, y, 8);
  y = drawSectionHeading(pdf, y, 'Section 4.3', `Complete 24-Hour Arena Run-of-Show (${selectedDate.label} 2027)`);
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.5, cellPadding: 2.3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.15 },
    headStyles: { fillColor: BRAND_INK, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BRAND_MIST },
    head: [['Hour / Clock Time', 'Phase', 'Milestone', 'Bus Parking Arena Execution', 'Command Owner']],
    body: RUN_OF_SHOW_24H.map((slot) => [
      sanitizePdfText(`${slot.hourLabel}\n${slot.clockTime}`),
      sanitizePdfText(slot.stage),
      sanitizePdfText(slot.title),
      sanitizePdfText(slot.arenaAction),
      sanitizePdfText(slot.owner),
    ]),
  });

  // Leadership Approval & Sign-off Block
  y = getNextY(pdf, y, 10);
  y = ensureSpace(pdf, y, 36);
  y = drawSectionHeading(pdf, y, 'Section 4.4', 'Chandigarh University Leadership & Department Sign-Off Sheet');
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.8, cellPadding: 3, textColor: BRAND_INK, lineColor: BRAND_BORDER, lineWidth: 0.2 },
    headStyles: { fillColor: BRAND_MIST, textColor: BRAND_INK, fontStyle: 'bold' },
    head: [['Executive Sponsor', 'Central Program Lead', 'Academic Track Leads', 'Campus Operations']],
    body: [
      [
        'Vice Chancellor / Pro-VC Office, CU\n\nSignature & Date:\n______________________',
        'Executive Director, TBI & iEDC CU\n\nSignature & Date:\n______________________',
        'HODs: AIT, CSE, UIE, AIM, Robotics\n\nSignature & Date:\n______________________',
        'Estate, IT, Security & Catering\n\nSignature & Date:\n______________________',
      ],
    ],
  });
}

/**
 * Pure synchronous PDF builder (usable both in browser and Node unit tests).
 */
export function buildProposalPdf(
  docId: DocumentId | 'all',
  tracks: TrackDepartment[],
  summary: ProposalSummary,
  logistics: LogisticsRequirements,
  selectedDate: EventDateOption,
  venueImages?: VenueImageSet
): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as JsPdfWithAutoTable;

  if (docId === 'departments') {
    renderDoc1IntoPdf(pdf, tracks, summary, selectedDate);
    addPageFooters(pdf, 'DOC 01 - Department Bifurcation & Tracks', selectedDate);
  } else if (docId === 'venue') {
    renderDoc2IntoPdf(pdf, tracks, summary, logistics, venueImages);
    addPageFooters(pdf, 'DOC 02 - Venue Masterplan, Structure & Zoning', selectedDate);
  } else if (docId === 'sponsors') {
    renderDoc3IntoPdf(pdf, tracks, summary);
    addPageFooters(pdf, 'DOC 03 - Sponsorship, Mentors, Judges & Guests', selectedDate);
  } else if (docId === 'timeline') {
    renderDoc4IntoPdf(pdf, summary, selectedDate);
    addPageFooters(pdf, 'DOC 04 - Master Timeline, Dates & 24h Run-of-Show', selectedDate);
  } else {
    renderDoc1IntoPdf(pdf, tracks, summary, selectedDate);
    pdf.addPage();
    renderDoc2IntoPdf(pdf, tracks, summary, logistics, venueImages);
    pdf.addPage();
    renderDoc3IntoPdf(pdf, tracks, summary);
    pdf.addPage();
    renderDoc4IntoPdf(pdf, summary, selectedDate);
    addPageFooters(pdf, 'Complete 4-Document Institutional Master Pack', selectedDate);
  }

  return pdf;
}

export function getPdfFilename(docId: DocumentId | 'all', selectedDate: EventDateOption): string {
  const suffixMap: Record<DocumentId | 'all', string> = {
    departments: 'DOC01_Departments_and_Tracks',
    venue: 'DOC02_Venue_and_Structure',
    sponsors: 'DOC03_Sponsors_Mentors_and_Guests',
    timeline: 'DOC04_Timeline_Dates_and_RunOfShow',
    all: 'Complete_4_Document_Master_Pack',
  };
  return `CU_Zero_to_One_${suffixMap[docId]}_${selectedDate.isoDate}.pdf`;
}

/**
 * Generates a real downloadable A4 PDF file directly in the browser (works reliably
 * inside sandboxed iframes where window.print() is blocked).
 */
export async function downloadProposalPdf(
  docId: DocumentId | 'all',
  tracks: TrackDepartment[],
  summary: ProposalSummary,
  logistics: LogisticsRequirements,
  selectedDate: EventDateOption
): Promise<string> {
  const needsVenueImages = docId === 'venue' || docId === 'all';
  const venueImages = needsVenueImages ? await loadVenueImages() : undefined;
  const pdf = buildProposalPdf(docId, tracks, summary, logistics, selectedDate, venueImages);
  const filename = getPdfFilename(docId, selectedDate);

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

  return filename;
}
