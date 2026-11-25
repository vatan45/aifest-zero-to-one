import { useState } from 'react';
import { FileText, Minus, Plus } from 'lucide-react';
import {
  TrackDepartment,
  calculateTrackMetrics,
  TOTAL_ARENA_SQFT,
} from '../utils/hackathonModel';

type CadLayerMode = 'tracks' | 'ops' | 'sponsors';

interface ArenaMasterplanProps {
  tracks: TrackDepartment[];
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onAdjustQuota: (trackId: string, nextShowUp: number) => void;
  onOpenOriginalBlueprint: () => void;
}

/**
 * Generates clean 6-seat cluster pod dot coordinates inside a CAD zone rectangle,
 * respecting optional bottom-left cutouts (such as the Driver Room in Lower Central).
 */
function generatePodCenters(track: TrackDepartment): Array<{ cx: number; cy: number }> {
  const { x, y, width, height, podCols, podRows, cutoutBottomLeft } = track.cadZone;
  const padX = 7;
  const padY = 14;
  const usableW = Math.max(10, width - padX * 2);
  const usableH = Math.max(10, height - padY - 7);

  const stepX = podCols > 1 ? usableW / (podCols - 1) : 0;
  const stepY = podRows > 1 ? usableH / (podRows - 1) : 0;

  const pods: Array<{ cx: number; cy: number }> = [];
  for (let r = 0; r < podRows; r++) {
    for (let c = 0; c < podCols; c++) {
      const cx = x + padX + c * stepX;
      const cy = y + padY + r * stepY;

      if (cutoutBottomLeft) {
        const cutRight = x + cutoutBottomLeft.width;
        const cutTop = y + height - cutoutBottomLeft.height;
        if (cx < cutRight && cy > cutTop) {
          continue;
        }
      }
      pods.push({ cx, cy });
    }
  }
  return pods;
}

export default function ArenaMasterplan({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onAdjustQuota,
  onOpenOriginalBlueprint,
}: ArenaMasterplanProps) {
  const [layerMode, setLayerMode] = useState<CadLayerMode>('tracks');

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? tracks[0];
  const selectedMetrics = calculateTrackMetrics(selectedTrack);

  return (
    <section id="arena-map" className="py-16 sm:py-20 border-b border-[#DCE7E4] bg-white">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Layer Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-mono font-medium text-[#0F766E]">
              2.2 Bus Parking A3 Arena Masterplan · Zero to One Dual-Wing Layout
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Interactive Track Zoning &amp; 45° Center-Corner Stage Sightlines
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#475569] leading-relaxed">
              Mapped 1:1 onto the {TOTAL_ARENA_SQFT.toLocaleString()} sq ft Bus Parking A3 layout
              (550 × 590 ft L-footprint). The 45° chamfered Zero to One main stage faces diagonally
              across the AV console so both the North Wing and Central/East Wing enjoy clear stage visibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Blueprint overlay mode"
              className="inline-flex items-center gap-1 p-1 bg-[#EFF6F4] border border-[#DCE7E4] rounded-md"
            >
              {(
                [
                  { id: 'tracks', label: 'Track Allocation' },
                  { id: 'ops', label: 'Ops & Crowd Flow' },
                  { id: 'sponsors', label: 'Sponsors & Mentors' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLayerMode(tab.id)}
                  aria-pressed={layerMode === tab.id}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    layerMode === tab.id
                      ? 'bg-[#0F172A] text-white'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenOriginalBlueprint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#0F766E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
              Original PDF
            </button>
          </div>
        </div>

        {/* Accessible Quick Track Selector Bar (explicit Track ↔ Department mapping) */}
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Select arena track zone">
          {tracks.map((track) => {
            const isSelected = track.id === selectedTrack.id;
            const shortDept =
              track.id === 'robotics-mechatronics'
                ? 'Robotics'
                : track.id === 'tbi-builder'
                  ? 'TBI'
                  : track.departmentShort;
            return (
              <button
                key={track.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTrack(track.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-[#F8FBFA] text-[#334155] border-[#DCE7E4] hover:border-[#0F766E] hover:text-[#0F172A]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-block w-2.5 h-2.5 rounded-[2px] border shrink-0"
                  style={{
                    backgroundColor: track.zoneFill,
                    borderColor: track.zoneStroke,
                  }}
                />
                <span className="font-mono">{track.trackNumber}</span>
                <span>{track.trackShortName}</span>
                <span className={`font-normal ${isSelected ? 'text-[#5EEAD4]' : 'text-[#64748B]'}`}>
                  · {shortDept}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main CAD Canvas + Right Inspector Split */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive CAD SVG Blueprint (8 columns) */}
          <div className="lg:col-span-8 border border-[#CBD5E1] rounded-lg overflow-hidden blueprint-grid">
            <div className="px-4 py-2.5 border-b border-[#DCE7E4] bg-[#F8FBFA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
              <span className="font-mono font-medium text-[#0F172A]">
                DRAWING NO. CU-Z2O-BP01 · SCALE 1:1 FT · BUS PARKING ARENA
              </span>
              <span className="font-mono tabular-nums">
                Layer: {layerMode === 'tracks' ? '6 Unified Track Zones' : layerMode === 'ops' ? 'Power, Wi-Fi 6E & Safety' : 'Sponsor Promenade & Mentor Hubs'}
              </span>
            </div>

            <div className="p-3 sm:p-5 overflow-x-auto">
              <svg
                viewBox="-55 -42 685 648"
                className="w-full h-auto min-w-[540px] max-h-[720px] select-none"
                role="img"
                aria-label="Interactive CAD floor plan of Chandigarh University Bus Parking Hackathon Arena divided into 6 unified tracks"
                data-testid="arena-cad-svg"
              >
                <defs>
                  {/* Architectural diagonal crosshatch for adjacent BUILDING */}
                  <pattern
                    id="buildingHatch"
                    width="10"
                    height="10"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#CBD5E1" strokeWidth="1.2" />
                  </pattern>
                  {/* Zero to One emerald-mint to cobalt-blue stage front LED gradient */}
                  <linearGradient id="z2oStageLed" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#0D9488" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>

                {/* Exact Outer Bus Parking Arena Footprint Polygon */}
                <path
                  d="M 0 0 L 200 0 L 200 300 L 450 300 L 450 470 L 590 470 L 590 550 L 0 550 Z"
                  fill="#FFFFFF"
                  stroke="#141518"
                  strokeWidth="2"
                />

                {/* Adjacent Campus BUILDING (140 x 170 ft) */}
                <rect
                  x="450"
                  y="300"
                  width="140"
                  height="170"
                  fill="url(#buildingHatch)"
                  stroke="#64748B"
                  strokeWidth="1.5"
                />
                <rect x="476" y="370" width="88" height="30" fill="#FFFFFF" fillOpacity="0.92" rx="2" />
                <text
                  x="520"
                  y="386"
                  textAnchor="middle"
                  className="font-sans font-bold"
                  fontSize="13"
                  fill="#1E293B"
                >
                  BUILDING
                </text>
                <text
                  x="520"
                  y="397"
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="8"
                  fill="#475569"
                >
                  3-Phase Power &amp; Fiber
                </text>

                {/* Main Corridor Aisles (subtle cool mist guidance lines) */}
                <rect x="78" y="4" width="28" height="296" fill="#EFF6F4" />
                <text
                  x="92"
                  y="152"
                  textAnchor="middle"
                  transform="rotate(-90 92 152)"
                  className="font-mono"
                  fontSize="8"
                  fill="#475569"
                  letterSpacing="1.5"
                >
                  NORTH CENTRAL PROMENADE (28 FT)
                </text>

                <rect x="202" y="420" width="246" height="16" fill="#EFF6F4" />
                {layerMode === 'tracks' && (
                  <text
                    x="325"
                    y="431"
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="7.5"
                    fill="#475569"
                    letterSpacing="1.4"
                  >
                    MAIN EAST-WEST PROMENADE (18 FT)
                  </text>
                )}

                {/* Dual-Wing Stage Sightline Rays (proving visibility to North Wing & East/Central Wing) */}
                <g pointerEvents="none" opacity="0.78">
                  <line
                    x1="68"
                    y1="340"
                    x2="44"
                    y2="296"
                    stroke="#0D9488"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1="82"
                    y1="354"
                    x2="92"
                    y2="296"
                    stroke="#0D9488"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1="96"
                    y1="368"
                    x2="152"
                    y2="296"
                    stroke="#0D9488"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1="110"
                    y1="398"
                    x2="202"
                    y2="372"
                    stroke="#2563EB"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1="110"
                    y1="436"
                    x2="202"
                    y2="462"
                    stroke="#2563EB"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                </g>

                {/* Fixed Infrastructure: SW 45° Chamfered ZERO TO ONE CENTER STAGE */}
                <polygon
                  points="2,334 62,334 110,382 110,490 2,490"
                  fill="#0F172A"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
                {/* Panoramic Zero to One LED edge facing BOTH wings at 45° */}
                <polyline
                  points="62,334 110,382 110,476"
                  fill="none"
                  stroke="url(#z2oStageLed)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <text
                  x="53"
                  y="404"
                  textAnchor="middle"
                  className="font-mono font-semibold"
                  fontSize="7.2"
                  fill="#5EEAD4"
                  letterSpacing="0.8"
                >
                  01 · ZERO TO ONE
                </text>
                <text
                  x="53"
                  y="421"
                  textAnchor="middle"
                  className="font-sans font-bold"
                  fontSize="14.5"
                  fill="#FFFFFF"
                  letterSpacing="1.2"
                >
                  STAGE
                </text>
                <text
                  x="53"
                  y="436"
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="6.6"
                  fill="#CBD5E1"
                >
                  45° DUAL-WING VIEW
                </text>

                {/* Fixed Infrastructure: AV CONSOLE facing Stage */}
                <rect
                  x="136"
                  y="386"
                  width="26"
                  height="42"
                  fill="#F1F5F9"
                  stroke="#141518"
                  strokeWidth="1.3"
                  rx="2"
                />
                <line x1="143" y1="391" x2="143" y2="423" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="150" y1="391" x2="150" y2="423" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
                <text
                  x="130"
                  y="407"
                  textAnchor="middle"
                  transform="rotate(-90 130 407)"
                  className="font-mono font-semibold"
                  fontSize="7.5"
                  fill="#141518"
                >
                  CONSOLE
                </text>

                {/* Fixed Infrastructure: DRIVER ROOM (West) */}
                <rect
                  x="2"
                  y="492"
                  width="78"
                  height="56"
                  fill="#F3F1EC"
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                <text x="41" y="517" textAnchor="middle" className="font-sans font-semibold" fontSize="8.5" fill="#1E293B">
                  DRIVER
                </text>
                <text x="41" y="528" textAnchor="middle" className="font-sans font-semibold" fontSize="8.5" fill="#1E293B">
                  ROOM
                </text>
                <text x="41" y="540" textAnchor="middle" className="font-mono" fontSize="6.5" fill="#64748B">
                  OPS / MED BAY
                </text>

                {/* Fixed Infrastructure: GREEN ROOMs (Two rooms with divider) */}
                <rect
                  x="84"
                  y="518"
                  width="36"
                  height="30"
                  fill="#F3F1EC"
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                <rect
                  x="122"
                  y="518"
                  width="36"
                  height="30"
                  fill="#F3F1EC"
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                <text x="121" y="505" textAnchor="middle" className="font-sans font-semibold" fontSize="6.8" fill="#1E293B">
                  GREEN ROOMS
                </text>
                <text x="121" y="514" textAnchor="middle" className="font-mono" fontSize="5.8" fill="#64748B">
                  VIP &amp; SPEAKERS
                </text>

                {/* Fixed Infrastructure: DRIVER ROOM (Center) */}
                <rect
                  x="162"
                  y="506"
                  width="42"
                  height="42"
                  fill="#F3F1EC"
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                <text x="183" y="525" textAnchor="middle" className="font-sans font-semibold" fontSize="7.5" fill="#1E293B">
                  DRIVER
                </text>
                <text x="183" y="535" textAnchor="middle" className="font-sans font-semibold" fontSize="7.5" fill="#1E293B">
                  ROOM
                </text>

                {/* 6 INTERACTIVE UNIFIED TRACK ZONES */}
                {tracks.map((track) => {
                  const isSelected = track.id === selectedTrack.id;
                  const { x, y, width, height, cutoutBottomLeft } = track.cadZone;
                  const pods = generatePodCenters(track);
                  const metrics = calculateTrackMetrics(track);

                  // Build zone polygon path (supports L-shaped cutout around Center Driver Room)
                  const zonePath = cutoutBottomLeft
                    ? `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x + cutoutBottomLeft.width} ${y + height} L ${x + cutoutBottomLeft.width} ${y + height - cutoutBottomLeft.height} L ${x} ${y + height - cutoutBottomLeft.height} Z`
                    : `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;

                  const labelCenterX = cutoutBottomLeft
                    ? x + cutoutBottomLeft.width + (width - cutoutBottomLeft.width) / 2
                    : x + width / 2;
                  const labelCenterY = y + height / 2;

                  return (
                    <g
                      key={track.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Track ${track.trackNumber}: ${track.departmentShort}, ${metrics.showUpTarget} participants in ${track.arenaZoneLabel}`}
                      onClick={() => onSelectTrack(track.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTrack(track.id);
                        }
                      }}
                      className="cursor-pointer focus:outline-none group"
                    >
                      <path
                        d={zonePath}
                        fill={track.zoneFill}
                        fillOpacity={isSelected ? 0.92 : 0.62}
                        stroke={isSelected ? '#141518' : track.zoneStroke}
                        strokeWidth={isSelected ? 2.5 : 1.25}
                        className="transition-opacity duration-150"
                      />

                      {/* Geometric Team Pod Matrix matching PDF floral/cluster seats */}
                      {pods.map((pod, idx) => (
                        <circle
                          key={idx}
                          cx={pod.cx}
                          cy={pod.cy}
                          r={2.1}
                          fill={track.zoneStroke}
                          fillOpacity={isSelected ? 0.48 : 0.3}
                        />
                      ))}

                      {/* Crisp Architectural Label Plate (Track Name + Lead Dept + Pax) */}
                      <rect
                        x={labelCenterX - Math.min(54, width / 2 - 2)}
                        y={labelCenterY - 18}
                        width={Math.min(108, width - 4)}
                        height={36}
                        rx="3"
                        fill="#FFFFFF"
                        fillOpacity={isSelected ? 0.98 : 0.93}
                        stroke={isSelected ? '#0F172A' : track.zoneStroke}
                        strokeWidth={isSelected ? 1.5 : 0.85}
                      />
                      <text
                        x={labelCenterX}
                        y={labelCenterY - 3.5}
                        textAnchor="middle"
                        className="font-sans font-bold"
                        fontSize={width < 80 ? '6.7' : '8.2'}
                        fill={track.zoneTextColor}
                      >
                        T{track.trackNumber} ·{' '}
                        {track.id === 'ait'
                          ? 'GenAI'
                          : track.id === 'cse'
                            ? 'Full-Stack'
                            : track.id === 'uie'
                              ? 'Core AI'
                              : track.id === 'aim'
                                ? 'Marketing'
                                : track.id === 'robotics-mechatronics'
                                  ? 'Hardware'
                                  : track.id === 'tbi-builder'
                                    ? 'Startup'
                                    : track.trackShortName}
                      </text>
                      <text
                        x={labelCenterX}
                        y={labelCenterY + 10.5}
                        textAnchor="middle"
                        className="font-mono font-medium"
                        fontSize={width < 80 ? '6.2' : '6.9'}
                        fill="#0F172A"
                      >
                        {track.id === 'robotics-mechatronics'
                          ? 'Robotics'
                          : track.id === 'tbi-builder'
                            ? 'TBI'
                            : track.departmentShort}{' '}
                        · {metrics.showUpTarget.toLocaleString()}p
                      </text>
                    </g>
                  );
                })}

                {/* OVERLAY LAYER 2: OPS, POWER, WI-FI & CROWD FLOW */}
                {layerMode === 'ops' && (
                  <g pointerEvents="none">
                    {/* 3-Phase Power Conduit from Building along East-West Corridor & SE Robotics Feed */}
                    <path
                      d="M 488 470 L 488 482 L 454 482 M 450 428 L 162 428 L 110 428"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="2.2"
                      strokeDasharray="6 3"
                    />
                    <rect x="456" y="452" width="76" height="14" rx="2" fill="#DC2626" />
                    <text x="494" y="462" textAnchor="middle" className="font-mono font-semibold" fontSize="7" fill="#FFFFFF">
                      3-PHASE FEED
                    </text>

                    {/* North & South Check-In Entry Chutes */}
                    <rect x="44" y="-12" width="112" height="15" rx="2" fill="#141518" />
                    <text x="100" y="-2" textAnchor="middle" className="font-mono font-semibold" fontSize="6.6" fill="#FFFFFF">
                      ENTRY GATE A (12 LANES)
                    </text>

                    <rect x="270" y="542" width="114" height="15" rx="2" fill="#141518" />
                    <text x="327" y="552" textAnchor="middle" className="font-mono font-semibold" fontSize="6.6" fill="#FFFFFF">
                      ENTRY GATE B (13 LANES)
                    </text>

                    {/* Emergency Exits */}
                    <rect x="194" y="218" width="44" height="14" rx="2" fill="#15803D" />
                    <text x="216" y="228" textAnchor="middle" className="font-mono font-semibold" fontSize="6.5" fill="#FFFFFF">
                      EXIT E1
                    </text>
                    <rect x="542" y="542" width="44" height="14" rx="2" fill="#15803D" />
                    <text x="564" y="552" textAnchor="middle" className="font-mono font-semibold" fontSize="6.5" fill="#FFFFFF">
                      EXIT E2
                    </text>

                    {/* High-Density Wi-Fi 6E Mesh Spine Nodes (Placed along corridors, zero label collision) */}
                    {[
                      { x: 92, y: 40 },
                      { x: 92, y: 266 },
                      { x: 184, y: 356 },
                      { x: 331, y: 318 },
                      { x: 432, y: 428 },
                      { x: 572, y: 486 },
                    ].map((node, i) => (
                      <g key={i}>
                        <circle cx={node.x} cy={node.y} r="14" fill="#2563EB" fillOpacity="0.12" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 2" />
                        <circle cx={node.x} cy={node.y} r="4" fill="#2563EB" />
                        <rect x={node.x - 13} y={node.y - 16} width="26" height="9" rx="1.5" fill="#FFFFFF" fillOpacity="0.92" />
                        <text x={node.x} y={node.y - 9} textAnchor="middle" className="font-mono font-bold" fontSize="6.2" fill="#1E40AF">
                          AP-6E
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* OVERLAY LAYER 3: SPONSOR BOOTHS & MENTOR PODS */}
                {layerMode === 'sponsors' && (
                  <g pointerEvents="none">
                    {/* Sponsor Booth Row along Main East-West Promenade & North Promenade */}
                    {[218, 258, 298, 338, 378, 412].map((bx, i) => (
                      <g key={i}>
                        <rect x={bx} y={421} width="28" height="14" rx="2" fill="#0F766E" stroke="#FFFFFF" strokeWidth="0.8" />
                        <text x={bx + 14} y={430.5} textAnchor="middle" className="font-mono font-semibold" fontSize="6.5" fill="#FFFFFF">
                          SP-{i + 1}
                        </text>
                      </g>
                    ))}

                    {/* TBI Pitch & VC Lounge Hub Marker at Central L-Junction */}
                    <rect x="116" y="304" width="80" height="24" rx="3" fill="#1D4ED8" />
                    <text x="156" y="315" textAnchor="middle" className="font-mono font-bold" fontSize="7" fill="#FFFFFF">
                      TBI VC PITCH POD
                    </text>
                    <text x="156" y="324" textAnchor="middle" className="font-mono" fontSize="6" fill="#DBEAFE">
                      KEYNOTE &amp; JURY HUB
                    </text>

                    {/* North Promenade Mentor Helpdesks */}
                    {[68, 226].map((my, i) => (
                      <g key={i}>
                        <rect x="79" y={my} width="26" height="20" rx="2" fill="#0F172A" />
                        <text x="92" y={my + 12.5} textAnchor="middle" className="font-mono font-semibold" fontSize="6.5" fill="#FFFFFF">
                          M-{i + 1}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* EXACT ARCHITECTURAL DIMENSION LINES (Matching Bus Parking A3 PDF) */}
                <g stroke="#4B4E57" strokeWidth="0.9" fill="#141518" className="font-mono">
                  {/* Top: 200 ft */}
                  <line x1="0" y1="-20" x2="200" y2="-20" />
                  <line x1="0" y1="-26" x2="0" y2="-4" />
                  <line x1="200" y1="-26" x2="200" y2="-4" />
                  <rect x="82" y="-29" width="36" height="16" fill="#FCFBF8" stroke="none" />
                  <text x="100" y="-17" textAnchor="middle" fontSize="11" stroke="none">
                    200&apos;
                  </text>

                  {/* North Wing Right: 300 ft */}
                  <line x1="216" y1="0" x2="216" y2="300" />
                  <line x1="204" y1="0" x2="222" y2="0" />
                  <line x1="204" y1="300" x2="222" y2="300" />
                  <rect x="206" y="132" width="20" height="36" fill="#FCFBF8" stroke="none" />
                  <text x="216" y="154" textAnchor="middle" transform="rotate(-90 216 154)" fontSize="11" stroke="none">
                    300&apos;
                  </text>

                  {/* Far Left Full Height: 550 ft */}
                  <line x1="-26" y1="0" x2="-26" y2="550" />
                  <line x1="-32" y1="0" x2="-4" y2="0" />
                  <line x1="-32" y1="550" x2="-4" y2="550" />
                  <rect x="-38" y="254" width="24" height="42" fill="#FCFBF8" stroke="none" />
                  <text x="-26" y="279" textAnchor="middle" transform="rotate(-90 -26 279)" fontSize="11" stroke="none">
                    550&apos;
                  </text>

                  {/* Central Arena Width: 250 ft */}
                  <line x1="200" y1="282" x2="450" y2="282" />
                  <line x1="450" y1="276" x2="450" y2="296" />
                  <rect x="307" y="273" width="36" height="16" fill="#FCFBF8" stroke="none" />
                  <text x="325" y="285" textAnchor="middle" fontSize="11" stroke="none">
                    250&apos;
                  </text>

                  {/* Building Height: 170 ft (clean exterior right edge above 80' SE wing) */}
                  <line x1="606" y1="300" x2="606" y2="470" />
                  <line x1="594" y1="300" x2="612" y2="300" />
                  <rect x="596" y="368" width="20" height="34" fill="#FCFBF8" stroke="none" />
                  <text x="606" y="389" textAnchor="middle" transform="rotate(-90 606 389)" fontSize="11" stroke="none">
                    170&apos;
                  </text>

                  {/* Bottom Main Width: 450 ft */}
                  <line x1="0" y1="578" x2="450" y2="578" />
                  <line x1="0" y1="556" x2="0" y2="584" />
                  <line x1="450" y1="556" x2="450" y2="584" />
                  <rect x="206" y="569" width="38" height="16" fill="#FCFBF8" stroke="none" />
                  <text x="225" y="581" textAnchor="middle" fontSize="11" stroke="none">
                    450&apos;
                  </text>

                  {/* SE Wing Width: 140 ft */}
                  <line x1="450" y1="578" x2="590" y2="578" />
                  <line x1="590" y1="556" x2="590" y2="584" />
                  <rect x="502" y="569" width="36" height="16" fill="#FCFBF8" stroke="none" />
                  <text x="520" y="581" textAnchor="middle" fontSize="11" stroke="none">
                    140&apos;
                  </text>

                  {/* SE Wing Height: 80 ft */}
                  <line x1="606" y1="470" x2="606" y2="550" />
                  <line x1="594" y1="470" x2="612" y2="470" />
                  <line x1="594" y1="550" x2="612" y2="550" />
                  <rect x="596" y="495" width="20" height="30" fill="#FCFBF8" stroke="none" />
                  <text x="606" y="514" textAnchor="middle" transform="rotate(-90 606 514)" fontSize="11" stroke="none">
                    80&apos;
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right: Live Selected Track Inspector Panel (4 columns) */}
          <aside
            aria-label="Selected track specifications"
            data-testid="track-inspector"
            className="lg:col-span-4 bg-[#F8FBFA] border border-[#DCE7E4] rounded-lg p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#DCE7E4]">
              <div>
                <p className="text-xs font-mono font-medium text-[#0F766E]">
                  Track {selectedTrack.trackNumber} · {selectedTrack.arenaZoneLabel}
                </p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-[#0F172A]">
                  {selectedTrack.trackShortName} Track
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#0F172A]">
                  Lead Dept: {selectedTrack.departmentShort}
                </p>
                <p className="mt-0.5 text-xs text-[#475569]">{selectedTrack.departmentFull}</p>
              </div>
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded shrink-0 border mt-1"
                style={{
                  backgroundColor: selectedTrack.zoneFill,
                  borderColor: selectedTrack.zoneStroke,
                }}
              />
            </div>

            <div className="py-4 border-b border-[#DCE7E4]">
              <p className="text-xs font-medium text-[#475569]">Track Scope &amp; Focus Domains</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">{selectedTrack.trackTitle}</p>
              <ul className="mt-2 space-y-1 text-xs text-[#334155]">
                {selectedTrack.focusThemes.map((theme) => (
                  <li key={theme} className="flex items-start gap-1.5">
                    <span className="font-mono text-[#0F766E]">·</span>
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[#475569]">Owner: {selectedTrack.coordRole}</p>
            </div>

            {/* Live Editable Show-Up Quota inside Inspector */}
            <div className="py-4 border-b border-[#DCE7E4]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#475569]">
                  Show-Up Quota (Adjust ±50)
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Decrease ${selectedTrack.departmentShort} show-up quota`}
                    onClick={() =>
                      onAdjustQuota(selectedTrack.id, selectedTrack.showUpTarget - 50)
                    }
                    className="w-8 h-8 inline-flex items-center justify-center rounded border border-[#CBD5E1] bg-white hover:border-[#0F766E] text-[#0F172A] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums w-14 text-center">
                    {selectedMetrics.showUpTarget.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${selectedTrack.departmentShort} show-up quota`}
                    onClick={() =>
                      onAdjustQuota(selectedTrack.id, selectedTrack.showUpTarget + 50)
                    }
                    className="w-8 h-8 inline-flex items-center justify-center rounded border border-[#CBD5E1] bg-white hover:border-[#0F766E] text-[#0F172A] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Clean Architectural Definition Grid */}
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-[#475569]">Registration Target</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                    {selectedMetrics.registrationTarget.toLocaleString()} ({selectedTrack.funnelMultiplier.toFixed(1)}×)
                  </dd>
                </div>
                <div>
                  <dt className="text-[#475569]">Teams (5/pod)</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                    {selectedMetrics.teamsCount.toLocaleString()} teams
                  </dd>
                </div>
                <div>
                  <dt className="text-[#475569]">Track Mentors / Judges</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                    {selectedMetrics.mentorsRequired} M · {selectedMetrics.judgesRequired} J
                  </dd>
                </div>
                <div>
                  <dt className="text-[#475569]">Zone Area / Density</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                    {selectedTrack.footprintSqFt.toLocaleString()} ft² · {selectedMetrics.sqftPerParticipant} ft²/p
                  </dd>
                </div>
                <div>
                  <dt className="text-[#475569]">Track Sponsor Target</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[#0F766E] tabular-nums">
                    ₹{selectedTrack.sponsorTargetLakhs} Lakhs
                  </dd>
                </div>
                <div>
                  <dt className="text-[#475569]">Spatial Status</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[#0F172A]">
                    {selectedMetrics.densityStatus}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Infrastructure & Engineering Notes */}
            <div className="py-4 border-b border-[#DCE7E4]">
              <p className="text-xs font-semibold text-[#0F172A]">Zone Engineering &amp; Placement</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                {selectedTrack.infrastructureNotes}
              </p>
            </div>

            {/* Department Deliverables */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-[#0F172A]">Mandatory Department Deliverables</p>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#334155]">
                {selectedTrack.departmentDeliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[#0F766E] shrink-0">0{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
