import * as THREE from 'three';
import { TrackDepartment, calculateTrackMetrics } from '../utils/hackathonModel';
import { ExplorerAreaConfig, buildExplorerAreas } from './explorerAreas';

export interface ProceduralTexturePack {
  mainStageLed: THREE.CanvasTexture;
  stageImagWing: THREE.CanvasTexture;
  concreteColor: THREE.CanvasTexture;
  concreteBump: THREE.CanvasTexture;
  asphaltColor: THREE.CanvasTexture;
  grassColor: THREE.CanvasTexture;
  buildingFacade: THREE.CanvasTexture;
  cuA3MainFacade: THREE.CanvasTexture;
  cuA3SideFacade: THREE.CanvasTexture;
  cuA3OverhangBand: THREE.CanvasTexture;
  cuUniversityRooftopSign: THREE.CanvasTexture;
  cuAcademicBlockA3Sign: THREE.CanvasTexture;
  cuEntranceMural: THREE.CanvasTexture;
  cuCafeSign: THREE.CanvasTexture;
  verticalBanner: THREE.CanvasTexture;
  vcPitchSign: THREE.CanvasTexture;
  vcPitchScreen: THREE.CanvasTexture;
  mentorDeskM1Sign: THREE.CanvasTexture;
  mentorDeskM2Sign: THREE.CanvasTexture;
  hydrationSign: THREE.CanvasTexture;
  exitSign: THREE.CanvasTexture;
  gateASign: THREE.CanvasTexture;
  gateBSign: THREE.CanvasTexture;
  skyGradient: THREE.CanvasTexture;
  trackGantries: Map<string, THREE.CanvasTexture>;
  trackFloorDecals: Map<string, THREE.CanvasTexture>;
  hologramPanels: Map<string, THREE.CanvasTexture>;
  hologramBeaconSign: THREE.CanvasTexture;
  sponsorSigns: THREE.CanvasTexture[];
  dispose: () => void;
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, Math.max(1, maxAnisotropy));
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates the official Zero to One Hackathon panoramic stage LED backdrop.
 * Matches the user's provided CU + Student Innovation Cell iEDC + emerald-to-cobalt 01
 * creative without any wrong August date.
 */
function createMainStageLedCanvas(totalShowUp: number): HTMLCanvasElement {
  const w = 2048;
  const h = 768;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // High-key ice-white to soft mint-teal architectural gradient backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#DFF6EE');
  bgGrad.addColorStop(0.42, '#F7FCFA');
  bgGrad.addColorStop(0.76, '#EFF8F5');
  bgGrad.addColorStop(1, '#D7EEEA');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle vertical architectural grid lines & diagonal upward momentum motif
  ctx.strokeStyle = 'rgba(13, 148, 136, 0.08)';
  ctx.lineWidth = 2;
  for (let x = 64; x < w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 64; y < h; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Subtle rising geometric arrow motif on left wing
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.16)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(90, 620);
  ctx.lineTo(290, 420);
  ctx.lineTo(290, 505);
  ctx.moveTo(290, 420);
  ctx.lineTo(205, 420);
  ctx.stroke();

  // Top & Bottom signature Zero to One emerald-to-cobalt accent rails
  const railGrad = ctx.createLinearGradient(0, 0, w, 0);
  railGrad.addColorStop(0, '#10B981');
  railGrad.addColorStop(0.5, '#0D9488');
  railGrad.addColorStop(1, '#2563EB');
  ctx.fillStyle = railGrad;
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 14, w, 14);

  // Top Institutional Lockup: Chandigarh University | Student Innovation Cell iEDC · TBI
  const lockY = 104;
  // Crimson CU Crest Box
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(640, lockY - 38, 62, 62);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CU', 671, lockY + 4);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#991B1B';
  ctx.font = '800 32px system-ui, -apple-system, sans-serif';
  ctx.fillText('CHANDIGARH', 718, lockY - 6);
  ctx.fillText('UNIVERSITY', 718, lockY + 28);

  // Vertical divider
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(962, lockY - 36, 3, 62);

  // Student Innovation Cell / iEDC / TBI
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('Student Innovation Cell', 986, lockY - 8);
  ctx.fillStyle = '#0F766E';
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('TBI · iEDC · AI FEST FLAGSHIP', 986, lockY + 24);

  // Centerpiece Hero Lockup: Signature Gradient "01" Emblem + "ZERO to ONE"
  const logoCenterY = 365;
  const zeroGrad = ctx.createLinearGradient(515, 225, 860, 495);
  zeroGrad.addColorStop(0, '#34D399');
  zeroGrad.addColorStop(0.48, '#0D9488');
  zeroGrad.addColorStop(1, '#2563EB');

  // "0" thick gradient ring
  ctx.strokeStyle = zeroGrad;
  ctx.lineWidth = 54;
  ctx.beginPath();
  ctx.arc(645, logoCenterY, 108, 0, Math.PI * 2);
  ctx.stroke();

  // "1" solid gradient pillar
  ctx.fillStyle = zeroGrad;
  ctx.beginPath();
  ctx.roundRect(802, logoCenterY - 134, 58, 268, 12);
  ctx.fill();

  // Vertical separator
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(904, logoCenterY - 126, 4, 252);

  // Bold ink-black ZERO to ONE typography
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'left';
  ctx.font = '900 132px system-ui, -apple-system, sans-serif';
  ctx.fillText('ZERO', 944, logoCenterY - 18);

  ctx.fillStyle = '#0F766E';
  ctx.font = '700 44px system-ui, -apple-system, sans-serif';
  ctx.fillText('to', 948, logoCenterY + 34);

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 132px system-ui, -apple-system, sans-serif';
  ctx.fillText('ONE', 1002, logoCenterY + 114);

  // HACKATHON + Official Tagline
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = '700 30px monospace';
  ctx.fillText('H A C K A T H O N', w / 2, 558);

  ctx.fillStyle = '#0F172A';
  ctx.font = '700 40px Georgia, serif';
  ctx.fillText('“An idea in the morning, a startup by night”', w / 2, 622);

  // Bottom Scale Spec Strip (NO wrong August date!)
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(350, 660, w - 700, 56, 8);
  ctx.fill();

  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 24px monospace';
  ctx.fillText(
    `${totalShowUp.toLocaleString()}+ BUILDERS   ·   6 UNIFIED TRACKS   ·   24 HOURS   ·   CHANDIGARH UNIVERSITY`,
    w / 2,
    697
  );

  // Left & Right Wing Track Index Panels (visible from angled wing seats)
  const drawSideBadge = (bx: number, title: string, items: string[]) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
    ctx.beginPath();
    ctx.roundRect(bx, 220, 320, 310, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 118, 110, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F766E';
    ctx.font = '700 20px monospace';
    ctx.fillText(title, bx + 24, 260);

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 23px system-ui, sans-serif';
    items.forEach((line, i) => {
      ctx.fillText(line, bx + 24, 312 + i * 68);
    });
  };

  drawSideBadge(86, 'NORTH WING TRACKS', [
    'T01 · GenAI & Agents (AIT)',
    'T04 · Digital Marketing (AIM)',
    '1,800 Builders · Zones A–B',
  ]);

  drawSideBadge(w - 406, 'CENTRAL & SE TRACKS', [
    'T02 · Full-Stack & Cloud (CSE)',
    'T03 · Core Computing (UIE)',
    'T05 Hardware · T06 TBI Startup',
  ]);

  return canvas;
}

/**
 * Generates tall twin side IMAG broadcast LED textures (countdown clock + live track pulse).
 */
function createStageImagWingCanvas(totalShowUp: number): HTMLCanvasElement {
  const w = 512;
  const h = 768;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#07111F');
  bg.addColorStop(0.55, '#0C1E33');
  bg.addColorStop(1, '#081826');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Top emerald-to-cobalt accent bar
  const rail = ctx.createLinearGradient(0, 0, w, 0);
  rail.addColorStop(0, '#10B981');
  rail.addColorStop(1, '#2563EB');
  ctx.fillStyle = rail;
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 14, w, 14);

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 22px monospace';
  ctx.fillText('ZERO TO ONE · LIVE IMAG', w / 2, 64);

  // 24:00:00 Hack Clock box
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.beginPath();
  ctx.roundRect(36, 96, w - 72, 136, 14);
  ctx.fill();
  ctx.strokeStyle = '#14B8A6';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#99F6E4';
  ctx.font = '700 20px monospace';
  ctx.fillText('24-HOUR BUILD CLOCK', w / 2, 136);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 72px monospace';
  ctx.fillText('24:00:00', w / 2, 210);

  // Live Arena Capacity Metrics
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '800 34px system-ui, sans-serif';
  ctx.fillText(`${totalShowUp.toLocaleString()}+ BUILDERS`, w / 2, 294);
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 21px monospace';
  ctx.fillText('248 MENTORS · 62 JUDGES · 15 VCs', w / 2, 332);

  // 6 Track Status Rows
  const rows = [
    ['T01 AIT', 'GenAI & Agents', '#0D9488'],
    ['T02 CSE', 'Full-Stack Cloud', '#2563EB'],
    ['T03 UIE', 'Core Computing', '#4F46E5'],
    ['T04 AIM', 'Digital Marketing', '#D97706'],
    ['T05 ROB', 'Hardware & IoT', '#059669'],
    ['T06 TBI', 'Builder Startup', '#0891B2'],
  ];
  rows.forEach(([code, name, color], idx) => {
    const ry = 374 + idx * 54;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(36, ry, w - 72, 42, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(36, ry, 10, 42);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5EEAD4';
    ctx.font = '700 20px monospace';
    ctx.fillText(code, 58, ry + 28);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '600 21px system-ui, sans-serif';
    ctx.fillText(name, 162, ry + 28);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 18px monospace';
  ctx.fillText('CHANDIGARH UNIVERSITY · AI FEST', w / 2, 728);

  return canvas;
}

/**
 * Generates an interior startup demo pitch slide for the glass TBI VC Pitch Pod.
 */
function createVcPitchScreenCanvas(): HTMLCanvasElement {
  const w = 512;
  const h = 288;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2563EB';
  ctx.fillRect(0, 0, w, 10);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 18px monospace';
  ctx.fillText('TBI STARTUP DEMO · SEED ROUND PITCH', 28, 48);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 34px system-ui, sans-serif';
  ctx.fillText('ZERO TO ONE VENTURES', 28, 96);

  // Clean bar chart bars illustrating growth
  const bars = [56, 84, 118, 152, 194];
  bars.forEach((bh, i) => {
    ctx.fillStyle = i === bars.length - 1 ? '#10B981' : '#3B82F6';
    ctx.fillRect(300 + i * 36, 250 - bh * 0.72, 24, bh * 0.72);
  });

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillText('15 VC Partners · Fast-Track', 28, 148);
  ctx.fillText('Incubation & Seed Grants', 28, 180);

  ctx.fillStyle = '#10B981';
  ctx.font = '700 22px monospace';
  ctx.fillText('TRACK T06 · 2,000 BUILDERS', 28, 236);

  return canvas;
}

/**
 * Generates crisp double-sided hanging truss gantry signage for each of the 6 tracks.
 */
function createTrackGantryCanvas(track: TrackDepartment): HTMLCanvasElement {
  const metrics = calculateTrackMetrics(track);
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Sleek dark architectural frame
  ctx.fillStyle = '#0B1220';
  ctx.fillRect(0, 0, w, h);

  // Zero to One mint-cobalt top border
  const topGrad = ctx.createLinearGradient(0, 0, w, 0);
  topGrad.addColorStop(0, '#10B981');
  topGrad.addColorStop(0.5, track.zoneStroke);
  topGrad.addColorStop(1, '#2563EB');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 16);
  ctx.fillRect(0, h - 10, w, 10);

  // Left track number & color block
  ctx.fillStyle = track.zoneStroke;
  ctx.fillRect(24, 34, 152, 188);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '700 24px monospace';
  ctx.fillText('TRACK', 100, 92);
  ctx.font = '900 78px system-ui, sans-serif';
  ctx.fillText(track.trackNumber, 100, 174);

  // Main Track Title & Lead Department
  ctx.textAlign = 'left';
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 24px monospace';
  const zoneShort = track.arenaZoneLabel.split('·')[0].trim().toUpperCase();
  ctx.fillText(`${zoneShort}  ·  LEAD: ${track.departmentShort.toUpperCase()}`, 204, 78);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 50px system-ui, -apple-system, sans-serif';
  ctx.fillText(track.trackShortName, 204, 144);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 24px monospace';
  ctx.fillText(
    `${metrics.showUpTarget.toLocaleString()} BUILDERS  ·  ${metrics.teamsCount} TEAMS  ·  ₹${track.sponsorTargetLakhs}L TRACK POOL`,
    204,
    200
  );

  // Subtle 01 emblem on far right
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(920, 128, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(964, 92, 16, 72);

  return canvas;
}

/**
 * Generates architectural floor decal marking for each track bay so aerial & cutaway views
 * immediately read zone code, track, and lead department.
 */
function createTrackFloorDecalCanvas(track: TrackDepartment): HTMLCanvasElement {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Soft tinted concrete epoxy wash
  ctx.fillStyle = track.zoneFill;
  ctx.fillRect(0, 0, w, h);

  // Subtle micro grid
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= w; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(w, i);
    ctx.stroke();
  }

  // Crisp perimeter border stripe
  ctx.strokeStyle = track.zoneStroke;
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  return canvas;
}

function createConcreteCanvas(isBump: boolean): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isBump ? '#808080' : '#D9DEDB';
  ctx.fillRect(0, 0, size, size);

  // Deterministic pseudo-random speckle for realistic architectural concrete
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 4800; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = Math.floor(110 + rand() * 50);
    ctx.fillStyle = isBump
      ? `rgba(${v},${v},${v},0.28)`
      : `rgba(${v + 75},${v + 78},${v + 74},0.22)`;
    ctx.fillRect(x, y, 2 + rand() * 3, 2 + rand() * 3);
  }

  // Concrete expansion joints
  ctx.strokeStyle = isBump ? '#404040' : 'rgba(71, 85, 105, 0.24)';
  ctx.lineWidth = 2;
  for (let step = 0; step < size; step += 128) {
    ctx.beginPath();
    ctx.moveTo(step, 0);
    ctx.lineTo(step, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, step);
    ctx.lineTo(size, step);
    ctx.stroke();
  }

  return canvas;
}

function createAsphaltCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3B424C';
  ctx.fillRect(0, 0, size, size);

  let seed = 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 5000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const shade = Math.floor(45 + rand() * 38);
    ctx.fillStyle = `rgba(${shade},${shade + 4},${shade + 9},0.4)`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Bus parking white lane striping
  ctx.fillStyle = 'rgba(241, 245, 249, 0.55)';
  ctx.fillRect(size / 2 - 4, 30, 8, 160);
  ctx.fillRect(size / 2 - 4, 280, 8, 160);

  return canvas;
}

function createGrassCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4B6B46';
  ctx.fillRect(0, 0, size, size);

  let seed = 8899;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 6000; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const g = Math.floor(88 + rand() * 48);
    ctx.fillStyle = `rgba(${Math.floor(g * 0.7)},${g},${Math.floor(g * 0.58)},0.35)`;
    ctx.fillRect(x, y, 3, 6);
  }

  return canvas;
}

function drawCuTwinWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  hasAcUnit = false
) {
  // Subtle recessed architectural sill & reveal shadow
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(x, y, w, 4);

  const paneGap = Math.max(2, Math.round(w * 0.08));
  const paneW = (w - paneGap) / 2;

  for (let p = 0; p < 2; p++) {
    const px = x + p * (paneW + paneGap);
    const warmLit = (seed * 7 + p * 3) % 11 === 0;
    const brightReflect = (seed * 5 + p) % 4 === 0;

    const grad = ctx.createLinearGradient(px, y, px, y + h);
    if (warmLit) {
      grad.addColorStop(0, '#5A737C');
      grad.addColorStop(0.45, '#C8B894');
      grad.addColorStop(1, '#E5D3A3');
    } else if (brightReflect) {
      grad.addColorStop(0, '#445C64');
      grad.addColorStop(0.55, '#667E85');
      grad.addColorStop(1, '#31454C');
    } else {
      grad.addColorStop(0, '#2A3D44');
      grad.addColorStop(0.55, '#3E545C');
      grad.addColorStop(1, '#23343B');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(px, y, paneW, h);

    // Subtle glass reflection diagonal glint
    ctx.fillStyle = 'rgba(226, 240, 248, 0.14)';
    ctx.fillRect(px + 2, y + 3, paneW * 0.36, h * 0.48);

    // Crisp white aluminum inner mullion & transom
    ctx.strokeStyle = '#E6ECF2';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(px + 0.5, y + 0.5, paneW - 1, h - 1);
    ctx.fillStyle = '#DFE6EE';
    ctx.fillRect(px, y + h * 0.32, paneW, 1.8);
  }

  // Center white vertical mullion post
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(x + paneW, y, paneGap, h);

  // Occasional small white outdoor AC split unit mounted under window sill (authentic CU A3 detail)
  if (hasAcUnit) {
    const acW = Math.min(20, w * 0.42);
    const acH = 12;
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(x + w - acW - 2, y + h - acH + 2, acW, acH);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w - acW - 2, y + h - acH + 2, acW, acH);
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x + w - acW * 0.65 - 2, y + h - acH * 0.5 + 2, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createBuildingFacadeCanvas(): HTMLCanvasElement {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Crisp Chandigarh University off-white architectural concrete
  ctx.fillStyle = '#F1F4F8';
  ctx.fillRect(0, 0, w, h);

  const floors = 6;
  const floorH = h / floors;
  for (let f = 0; f < floors; f++) {
    const fy = f * floorH;
    // Crisp white floor slab spandrel + underside shadow line
    ctx.fillStyle = '#F7F9FC';
    ctx.fillRect(0, fy, w, 24);
    ctx.fillStyle = '#C8D2DC';
    ctx.fillRect(0, fy + 24, w, 3);

    for (let col = 0; col < 6; col++) {
      const wx = col * 84 + 10;
      const wy = fy + 31;
      const ww = 66;
      const wh = floorH - 36;
      drawCuTwinWindow(ctx, wx, wy, ww, wh, f * 13 + col * 5, (f + col) % 7 === 0);
    }
  }

  return canvas;
}

/**
 * Generates the exact 7-story front elevation texture of Chandigarh University Academic Block A3,
 * faithfully matching its crisp white concrete facade, protruding 7th-floor overhang cornice,
 * vertical structural piers, recessed smoky-teal twin window bays, and subtle slit stair windows.
 */
function createCuA3MainFacadeCanvas(): HTMLCanvasElement {
  const w = 2048;
  const h = 768;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Primary crisp alabaster-white concrete body (exact CU A3 color)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#F6F8FB');
  bgGrad.addColorStop(0.55, '#F1F4F8');
  bgGrad.addColorStop(1, '#E5EAF0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural concrete vertical panel joints
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 32; x < w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Top 7th-floor overhanging white fascia band (y: 0..124)
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, w, 122);
  // Crisp shadow directly beneath the 7th-floor cantilever overhang
  const overhangShadow = ctx.createLinearGradient(0, 122, 0, 146);
  overhangShadow.addColorStop(0, 'rgba(71, 85, 105, 0.34)');
  overhangShadow.addColorStop(1, 'rgba(71, 85, 105, 0)');
  ctx.fillStyle = overhangShadow;
  ctx.fillRect(180, 122, w - 340, 24);

  // Horizontal concrete slab ledges for floors 1..6 (y: 126..768)
  const lowerFloors = 6;
  const lowerTop = 128;
  const floorH = (h - lowerTop) / lowerFloors;

  for (let f = 0; f < lowerFloors; f++) {
    const fy = lowerTop + f * floorH;
    // White spandrel + thin architectural drip shadow
    ctx.fillStyle = '#F6F8FB';
    ctx.fillRect(0, fy, w, 26);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, fy + 25, w, 3);
    ctx.fillStyle = 'rgba(100, 116, 139, 0.18)';
    ctx.fillRect(0, fy + 28, w, 4);
  }

  // Exact bay layout from the Chandigarh University Academic Block A3 photograph:
  // [startX, count, bayWidth]
  const bayGroups: Array<{ startX: number; count: number; bayW: number; gap: number }> = [
    { startX: 222, count: 5, bayW: 76, gap: 10 }, // Left wide bay
    { startX: 686, count: 4, bayW: 70, gap: 10 }, // Center-left bay
    { startX: 1044, count: 3, bayW: 66, gap: 10 }, // Center entrance bay
    { startX: 1298, count: 5, bayW: 68, gap: 9 }, // Center-right bay
    { startX: 1704, count: 3, bayW: 64, gap: 9 }, // Far-right bay
  ];

  // Top 7th-floor recessed twin windows inside the white overhang band
  const topWinY = 44;
  const topWinH = 54;
  bayGroups.forEach((grp, gIdx) => {
    for (let i = 0; i < grp.count; i++) {
      const bx = grp.startX + i * (grp.bayW + grp.gap);
      drawCuTwinWindow(ctx, bx, topWinY, grp.bayW - 6, topWinH, gIdx * 19 + i * 7, false);
    }
  });

  // Lower 6 floors of twin windows across all 5 main bay groups
  for (let f = 0; f < lowerFloors; f++) {
    const wy = lowerTop + f * floorH + 34;
    const wh = floorH - 42;
    bayGroups.forEach((grp, gIdx) => {
      for (let i = 0; i < grp.count; i++) {
        const bx = grp.startX + i * (grp.bayW + grp.gap);
        const hasAc = (f === 2 || f === 3) && (i === 1 || i === 3) && (gIdx === 1 || gIdx === 3);
        drawCuTwinWindow(ctx, bx, wy, grp.bayW - 6, wh, f * 31 + gIdx * 17 + i * 11, hasAc);
      }
    });
  }

  // Far-left & far-right wing stair-core columns (single square window + thin horizontal slit windows)
  for (let f = 0; f < lowerFloors + 1; f++) {
    const wy = f === 0 ? topWinY : lowerTop + (f - 1) * floorH + 34;
    const wh = f === 0 ? topWinH : floorH - 42;

    // Left stair-wing square window column
    drawCuTwinWindow(ctx, 140, wy, 48, wh, f * 13 + 3, false);
    // Far-left horizontal corridor slit windows
    ctx.fillStyle = '#334850';
    ctx.fillRect(28, wy + wh * 0.45, 58, 12);
    ctx.strokeStyle = '#DCE4EC';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, wy + wh * 0.45, 58, 12);

    // Right stair-wing square window column
    drawCuTwinWindow(ctx, 1938, wy, 44, wh, f * 17 + 9, false);
    // Far-right horizontal corridor slit windows
    ctx.fillStyle = '#334850';
    ctx.fillRect(1998, wy + wh * 0.45, 38, 11);
  }

  // Crisp protruding white vertical structural piers framing the 5 bay groups
  const pierXs = [194, 650, 1004, 1266, 1676, 1916];
  pierXs.forEach((px) => {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(px, 122, 26, h - 122);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(px + 25, 122, 3, h - 122);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(px - 2, 122, 2, h - 122);
  });

  // Top parapet cap trim line
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(0, 10, w, 3);

  return canvas;
}

/**
 * Generates the matching 7-story side & secondary wing elevation for CU Academic Block A3.
 */
function createCuA3SideFacadeCanvas(): HTMLCanvasElement {
  const w = 1024;
  const h = 768;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#F5F7FA');
  bgGrad.addColorStop(1, '#E6EBF1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Overhang top band
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, w, 122);
  ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
  ctx.fillRect(40, 122, w - 80, 14);

  const lowerFloors = 6;
  const lowerTop = 128;
  const floorH = (h - lowerTop) / lowerFloors;

  for (let f = 0; f < lowerFloors; f++) {
    const fy = lowerTop + f * floorH;
    ctx.fillStyle = '#F6F8FB';
    ctx.fillRect(0, fy, w, 26);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, fy + 25, w, 3);
  }

  // 2 symmetrical window bay clusters separated by white central pier
  const clusters = [
    { startX: 90, count: 4, bayW: 84, gap: 12 },
    { startX: 540, count: 4, bayW: 84, gap: 12 },
  ];

  for (let f = 0; f < lowerFloors + 1; f++) {
    const wy = f === 0 ? 44 : lowerTop + (f - 1) * floorH + 34;
    const wh = f === 0 ? 54 : floorH - 42;
    clusters.forEach((cl, cIdx) => {
      for (let i = 0; i < cl.count; i++) {
        const bx = cl.startX + i * (cl.bayW + cl.gap);
        drawCuTwinWindow(ctx, bx, wy, cl.bayW - 6, wh, f * 23 + cIdx * 13 + i * 7, f === 2 && i === 2);
      }
    });
  }

  // White corner & center structural pilasters
  [44, 492, 948].forEach((px) => {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(px, 122, 32, h - 122);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(px + 30, 122, 3, h - 122);
  });

  return canvas;
}

/**
 * Generates the exact 7th-floor protruding cantilever overhang strip with individual twin
 * smoky-teal recessed windows on left & right wings and a clean white center panel for the
 * ACADEMIC BLOCK [A3] plaque.
 */
function createCuA3OverhangBandCanvas(): HTMLCanvasElement {
  const w = 2048;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, w, h);

  // Subtle top parapet trim & bottom soffit edge
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(0, h - 10, w, 10);

  // Left wing 7th-floor twin windows (9 bays)
  for (let i = 0; i < 9; i++) {
    drawCuTwinWindow(ctx, 48 + i * 80, 48, 66, 74, 101 + i * 7, false);
  }
  // Right wing 7th-floor twin windows (9 bays)
  for (let i = 0; i < 9; i++) {
    drawCuTwinWindow(ctx, 1284 + i * 80, 48, 66, 74, 211 + i * 11, false);
  }

  return canvas;
}

/**
 * Generates the bold illuminated rooftop architectural sign reading "CHANDIGARH UNIVERSITY"
 * mounted right across the top parapet of Academic Block A3.
 */
function createCuUniversityRooftopSignCanvas(): HTMLCanvasElement {
  const w = 1792;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Sleek dark architectural monument fascia backing with subtle gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0F172A');
  bg.addColorStop(1, '#1E293B');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Chandigarh University signature crimson-red bottom & top accent trims
  ctx.fillStyle = '#D62828';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillRect(0, h - 16, w, 16);

  // Crisp inner white architectural border
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 20, w - 28, h - 46);

  // Left iconic Chandigarh University Crimson Shield Emblem
  const shieldX = 48;
  const shieldY = 44;
  const shieldW = 148;
  const shieldH = 148;
  ctx.fillStyle = '#D62828';
  ctx.fillRect(shieldX, shieldY, shieldW, shieldH);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.strokeRect(shieldX + 6, shieldY + 6, shieldW - 12, shieldH - 12);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 72px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CU', shieldX + shieldW / 2, shieldY + shieldH / 2 - 8);
  ctx.font = '800 18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FEE2E2';
  ctx.fillText('NAAC A+', shieldX + shieldW / 2, shieldY + shieldH - 24);

  // Main giant luminous architectural lettering centered cleanly with generous margin
  const centerX = w / 2 + 6;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.font = '900 84px system-ui, -apple-system, sans-serif';
  ctx.fillText('CHANDIGARH UNIVERSITY', centerX + 3, 134, 1320);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('CHANDIGARH UNIVERSITY', centerX, 130, 1320);

  // Crisp institutional sub-caption
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('ACADEMIC BLOCK A3   ·   DISCOVER. LEARN. EMPOWER.', centerX, 186, 1300);

  // Right-side matching crimson A3 emblem square
  ctx.fillStyle = '#D62828';
  ctx.fillRect(w - 178, 48, 128, 140);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeRect(w - 172, 54, 116, 128);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 68px system-ui, -apple-system, sans-serif';
  ctx.fillText('A3', w - 114, 120);

  return canvas;
}

/**
 * Generates the exact parapet fascia plaque seen on the real building photo:
 * crisp white fascia with dark charcoal "ACADEMIC BLOCK" and crimson-red square "A3".
 */
function createCuAcademicBlockA3SignCanvas(): HTMLCanvasElement {
  const w = 1024;
  const h = 192;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Crisp pure white architectural fascia panel matching the real overhang
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, w, h);

  // Subtle metallic frame border
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Dark charcoal bold condensed "ACADEMIC BLOCK" lettering
  ctx.fillStyle = '#1E293B';
  ctx.font = '900 84px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('ACADEMIC BLOCK', 762, h / 2 + 4);

  // Iconic Chandigarh University crimson-red "A3" square badge
  const badgeX = 792;
  const badgeY = 18;
  const badgeW = 194;
  const badgeH = 156;
  ctx.fillStyle = '#D62828';
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 104px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A3', badgeX + badgeW / 2, badgeY + badgeH / 2 + 4);

  return canvas;
}

/**
 * Generates the colorful abstract teal/sky/emerald entrance canopy mural frieze seen above
 * the central steps of Academic Block A3.
 */
function createCuEntranceMuralCanvas(): HTMLCanvasElement {
  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E0F2FE';
  ctx.fillRect(0, 0, w, h);

  // Artistic swooping pastel teal, mint, indigo & coral ribbons matching the photo's entrance mural
  const ribbons: Array<[string, number, number, number]> = [
    ['#38BDF8', 0, 28, 36],
    ['#2DD4BF', 80, 62, 42],
    ['#34D399', 190, 22, 44],
    ['#F59E0B', 280, 56, 30],
    ['#60A5FA', 350, 24, 48],
    ['#A78BFA', 420, 64, 36],
  ];
  ribbons.forEach(([col, rx, ry, rad]) => {
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(rx + 48, ry + 18, rad * 1.9, rad * 0.72, 0.18, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Clean white architectural framing border
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, w - 10, h - 10);

  return canvas;
}

/**
 * Generates the authentic bottom-left brick-red campus tuck-shop signboard ("ROCKS N COOKS").
 */
function createCuCafeSignCanvas(): HTMLCanvasElement {
  const w = 512;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(54, 24, w - 108, h - 48);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.strokeRect(58, 28, w - 116, h - 56);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 42px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ROCKS N COOKS', w / 2, 68);

  ctx.fillStyle = '#FDE68A';
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('CU CAMPUS CAFE · BLOCK A3', w / 2, 110);

  return canvas;
}

function createVerticalBannerCanvas(): HTMLCanvasElement {
  const w = 256;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#10B981');
  grad.addColorStop(0.55, '#0D9488');
  grad.addColorStop(1, '#2563EB');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 24);
  ctx.fillRect(0, h - 24, w, 24);

  // Vertical 01 emblem
  ctx.strokeStyle = grad;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(100, 175, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = grad;
  ctx.fillRect(160, 124, 24, 102);

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '800 32px system-ui, sans-serif';
  ctx.fillText('ZERO TO ONE', w / 2, 316);
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 22px monospace';
  ctx.fillText('CU AI FEST', w / 2, 362);
  ctx.fillStyle = '#F59E0B';
  ctx.font = '700 20px monospace';
  ctx.fillText('24H HACKATHON', w / 2, 404);

  return canvas;
}

function createSignBannerCanvas(
  topTag: string,
  headline: string,
  accentHex: string
): HTMLCanvasElement {
  const w = 512;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 0, w, 12);
  ctx.fillRect(0, h - 8, w, 8);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 22px monospace';
  ctx.fillText(topTag, w / 2, 56);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px system-ui, sans-serif';
  ctx.fillText(headline, w / 2, 114);

  return canvas;
}

/**
 * Draws a glowing sci-fi translucent Hologram Information Screen displaying Tracks,
 * Mentors, Judges, and Sponsors for any of the 8 playable explorer areas.
 */
function createHologramPanelCanvas(area: ExplorerAreaConfig): HTMLCanvasElement {
  const w = 1024;
  const h = 640;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Translucent dark cyan holographic glass base
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, 'rgba(6, 28, 42, 0.92)');
  bg.addColorStop(0.5, 'rgba(8, 42, 58, 0.88)');
  bg.addColorStop(1, 'rgba(7, 22, 46, 0.94)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle horizontal holographic scanlines
  ctx.fillStyle = 'rgba(45, 212, 191, 0.06)';
  for (let y = 0; y < h; y += 8) {
    ctx.fillRect(0, y, w, 2);
  }

  // Outer glowing holographic frame & corner brackets
  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  const corner = 38;
  ctx.strokeStyle = '#5EEAD4';
  ctx.lineWidth = 8;
  const corners: Array<[number, number, number, number]> = [
    [14, 14, 1, 1],
    [w - 14, 14, -1, 1],
    [14, h - 14, 1, -1],
    [w - 14, h - 14, -1, -1],
  ];
  corners.forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * corner);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * corner, cy);
    ctx.stroke();
  });

  // Top Header Strip
  ctx.fillStyle = 'rgba(20, 184, 166, 0.22)';
  ctx.fillRect(28, 28, w - 56, 98);
  ctx.fillStyle = area.accentHex;
  ctx.fillRect(28, 28, 12, 98);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#5EEAD4';
  ctx.font = '700 20px monospace';
  ctx.fillText(`HOLOGRAM ZONE BRIEF  ·  ${area.zoneBadge.toUpperCase()}`, 56, 62);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(area.title, 56, 106, w - 104);

  // 3 Concise High-Legibility Hologram Columns: TRACK · MENTORS · SPONSORS
  const drawCard = (
    x: number,
    y: number,
    cw: number,
    ch: number,
    tag: string,
    accent: string,
    lines: Array<{ label?: string; text: string; highlight?: boolean }>
  ) => {
    ctx.fillStyle = 'rgba(7, 20, 34, 0.78)';
    ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, cw, ch);

    ctx.fillStyle = accent;
    ctx.fillRect(x, y, cw, 40);
    ctx.fillStyle = '#04121C';
    ctx.font = '800 19px monospace';
    ctx.fillText(tag, x + 14, y + 27);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 6, y + 44, cw - 12, ch - 52);
    ctx.clip();

    let cy = y + 72;
    const maxY = y + ch - 14;
    for (const item of lines) {
      if (cy > maxY) break;
      if (item.label) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '700 14px monospace';
        ctx.fillText(item.label, x + 14, cy);
        cy += 22;
      }
      ctx.fillStyle = item.highlight ? '#5EEAD4' : '#F8FAFC';
      ctx.font = item.highlight
        ? '800 22px system-ui, sans-serif'
        : '600 18px system-ui, sans-serif';
      const lineStep = item.highlight ? 26 : 22;
      const words = item.text.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > cw - 28 && line) {
          if (cy <= maxY) ctx.fillText(line, x + 14, cy);
          cy += lineStep;
          line = word;
        } else {
          line = test;
        }
      }
      if (line && cy <= maxY) {
        ctx.fillText(line, x + 14, cy);
        cy += lineStep + 14;
      }
    }
    ctx.restore();
  };

  const colW = 308;
  const colY = 144;
  const colH = 406;

  drawCard(28, colY, colW, colH, '01 · TRACKS', '#2DD4BF', [
    { label: 'TRACK', text: area.trackSummary.trackLabel, highlight: true },
    { label: 'BUILDERS', text: area.trackSummary.buildersCount },
    { label: 'REGISTRATIONS', text: area.trackSummary.registrationsCount },
    { label: 'SCALE', text: area.trackSummary.teamsCount },
  ]);

  drawCard(358, colY, colW, colH, '02 · MENTORS & JURY', '#38BDF8', [
    { label: 'MENTORS', text: area.mentorSummary.mentorsCount, highlight: true },
    { label: 'JUDGES', text: area.mentorSummary.judgesCount },
    { label: 'DESK', text: area.mentorSummary.helpdeskLocation },
    { label: 'FOCUS', text: area.mentorSummary.expertise.slice(0, 2).join(' · ') },
  ]);

  drawCard(688, colY, colW, colH, '03 · SPONSORS', '#F59E0B', [
    { label: 'POOL', text: area.sponsorSummary.poolLakhs, highlight: true },
    { label: 'BOOTHS', text: area.sponsorSummary.boothIds },
    { label: 'PARTNERS', text: area.sponsorSummary.partnerProfiles.slice(0, 2).join(', ') },
    { label: 'PERKS', text: area.sponsorSummary.builderPerks },
  ]);

  // Minimal Footer Strip
  ctx.fillStyle = 'rgba(20, 184, 166, 0.18)';
  ctx.fillRect(28, 562, w - 56, 44);
  ctx.fillStyle = '#99F6E4';
  ctx.font = '700 17px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    'W/S WALK  ·  A/D TURN  ·  C SWAP TPP/FPP',
    w / 2,
    590,
    w - 84
  );

  return canvas;
}

export function createSkyGradientTexture(topHex: string, horizonHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, topHex);
  grad.addColorStop(0.55, horizonHex);
  grad.addColorStop(1, horizonHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTexturePack(
  tracks: TrackDepartment[],
  totalShowUp: number,
  maxAnisotropy: number
): ProceduralTexturePack {
  const allTextures: THREE.Texture[] = [];
  const register = (t: THREE.CanvasTexture) => {
    allTextures.push(t);
    return t;
  };

  const mainStageLed = register(
    finalizeColorTexture(createMainStageLedCanvas(totalShowUp), maxAnisotropy)
  );
  const stageImagWing = register(
    finalizeColorTexture(createStageImagWingCanvas(totalShowUp), maxAnisotropy)
  );
  const concreteColor = register(
    finalizeColorTexture(createConcreteCanvas(false), maxAnisotropy, 18, 18)
  );

  const concreteBump = new THREE.CanvasTexture(createConcreteCanvas(true));
  concreteBump.wrapS = THREE.RepeatWrapping;
  concreteBump.wrapT = THREE.RepeatWrapping;
  concreteBump.repeat.set(18, 18);
  concreteBump.needsUpdate = true;
  allTextures.push(concreteBump);

  const asphaltColor = register(
    finalizeColorTexture(createAsphaltCanvas(), maxAnisotropy, 12, 24)
  );
  const grassColor = register(
    finalizeColorTexture(createGrassCanvas(), maxAnisotropy, 28, 28)
  );
  const buildingFacade = register(
    finalizeColorTexture(createBuildingFacadeCanvas(), maxAnisotropy, 2, 1)
  );
  const cuA3MainFacade = register(
    finalizeColorTexture(createCuA3MainFacadeCanvas(), maxAnisotropy)
  );
  const cuA3SideFacade = register(
    finalizeColorTexture(createCuA3SideFacadeCanvas(), maxAnisotropy)
  );
  const cuA3OverhangBand = register(
    finalizeColorTexture(createCuA3OverhangBandCanvas(), maxAnisotropy)
  );
  const cuUniversityRooftopSign = register(
    finalizeColorTexture(createCuUniversityRooftopSignCanvas(), maxAnisotropy)
  );
  const cuAcademicBlockA3Sign = register(
    finalizeColorTexture(createCuAcademicBlockA3SignCanvas(), maxAnisotropy)
  );
  const cuEntranceMural = register(
    finalizeColorTexture(createCuEntranceMuralCanvas(), maxAnisotropy)
  );
  const cuCafeSign = register(
    finalizeColorTexture(createCuCafeSignCanvas(), maxAnisotropy)
  );
  const verticalBanner = register(
    finalizeColorTexture(createVerticalBannerCanvas(), maxAnisotropy)
  );
  const vcPitchSign = register(
    finalizeColorTexture(
      createSignBannerCanvas('TBI INCUBATION · 15 VCs', 'VC PITCH POD', '#2563EB'),
      maxAnisotropy
    )
  );
  const vcPitchScreen = register(
    finalizeColorTexture(createVcPitchScreenCanvas(), maxAnisotropy)
  );
  const mentorDeskM1Sign = register(
    finalizeColorTexture(
      createSignBannerCanvas('248 INDUSTRY MENTORS · NORTH', 'MENTOR HELPDESK M-1', '#14B8A6'),
      maxAnisotropy
    )
  );
  const mentorDeskM2Sign = register(
    finalizeColorTexture(
      createSignBannerCanvas('AIT & AIM ARCHITECTURE TRIAGE', 'MENTOR HELPDESK M-2', '#14B8A6'),
      maxAnisotropy
    )
  );
  const hydrationSign = register(
    finalizeColorTexture(
      createSignBannerCanvas('CONTINUOUS 24-HOUR FUEL', 'COFFEE & HYDRATION', '#F59E0B'),
      maxAnisotropy
    )
  );
  const exitSign = register(
    finalizeColorTexture(
      createSignBannerCanvas('CLEAR EMERGENCY EGRESS', 'EMERGENCY EXIT', '#10B981'),
      maxAnisotropy
    )
  );
  const gateASign = register(
    finalizeColorTexture(
      createSignBannerCanvas('NORTH WING ARRIVAL · QR AUDIT', 'ENTRY GATE A · 12 LANES', '#10B981'),
      maxAnisotropy
    )
  );
  const gateBSign = register(
    finalizeColorTexture(
      createSignBannerCanvas('CENTRAL ARRIVAL · QR AUDIT', 'ENTRY GATE B · 13 LANES', '#0D9488'),
      maxAnisotropy
    )
  );
  const skyGradient = register(createSkyGradientTexture('#050B16', '#101F36'));

  const trackGantries = new Map<string, THREE.CanvasTexture>();
  const trackFloorDecals = new Map<string, THREE.CanvasTexture>();
  for (const track of tracks) {
    trackGantries.set(
      track.id,
      register(finalizeColorTexture(createTrackGantryCanvas(track), maxAnisotropy))
    );
    trackFloorDecals.set(
      track.id,
      register(finalizeColorTexture(createTrackFloorDecalCanvas(track), maxAnisotropy))
    );
  }

  const explorerAreas = buildExplorerAreas(tracks);
  const hologramPanels = new Map<string, THREE.CanvasTexture>();
  for (const area of explorerAreas) {
    hologramPanels.set(
      area.id,
      register(finalizeColorTexture(createHologramPanelCanvas(area), maxAnisotropy))
    );
  }
  const hologramBeaconSign = register(
    finalizeColorTexture(
      createSignBannerCanvas('INTERACTIVE INFO POINT', 'WALK HERE · HOLOGRAM', '#14B8A6'),
      maxAnisotropy
    )
  );

  const sponsorLabels = [
    ['TITLE PARTNER', 'SP-1 · AI CLOUD'],
    ['CO-POWERED', 'SP-2 · GPU LABS'],
    ['TRACK SPONSOR', 'SP-3 · DEVTOOLS'],
    ['TRACK SPONSOR', 'SP-4 · SILICON'],
    ['GROWTH PARTNER', 'SP-5 · MARTECH'],
    ['HARDWARE KIT', 'SP-6 · ROBOTICS'],
  ];
  const sponsorSigns = sponsorLabels.map(([top, head]) =>
    register(finalizeColorTexture(createSignBannerCanvas(top, head, '#0F766E'), maxAnisotropy))
  );

  return {
    mainStageLed,
    stageImagWing,
    concreteColor,
    concreteBump,
    asphaltColor,
    grassColor,
    buildingFacade,
    cuA3MainFacade,
    cuA3SideFacade,
    cuA3OverhangBand,
    cuUniversityRooftopSign,
    cuAcademicBlockA3Sign,
    cuEntranceMural,
    cuCafeSign,
    verticalBanner,
    vcPitchSign,
    vcPitchScreen,
    mentorDeskM1Sign,
    mentorDeskM2Sign,
    hydrationSign,
    exitSign,
    gateASign,
    gateBSign,
    skyGradient,
    trackGantries,
    trackFloorDecals,
    hologramPanels,
    hologramBeaconSign,
    sponsorSigns,
    dispose: () => {
      allTextures.forEach((t) => t.dispose());
    },
  };
}
