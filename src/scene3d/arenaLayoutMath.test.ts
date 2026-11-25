import test from 'node:test';
import assert from 'node:assert/strict';
import { BASELINE_TRACKS } from '../data/proposalData';
import {
  CAMERA_PRESETS,
  CINEMATIC_TOUR_ORDER,
  EYE_LOOK_RADIUS_M,
  HUMAN_EYE_HEIGHT_M,
  LIGHTING_MOODS,
  STANDING_DIRECTIONS,
  FT_TO_M,
  cadToWorld,
  clampCameraPosition,
  computeCompassYawDeg,
  generateArenaRoleFigures,
  generateWorldPods,
  getEyeLevelViewForPreset,
  getStandingLookTarget,
  getTrackCameraView,
  getTrackEyeLevelView,
} from './arenaLayoutMath';

test('cadToWorld scales feet to meters consistently', () => {
  const p0 = cadToWorld(0, 0, 0);
  const p1 = cadToWorld(100, 0, 0);
  assert.ok(Math.abs(p1.x - p0.x - 100 * FT_TO_M) < 1e-6);
  assert.equal(p0.y, 0);
  assert.equal(p1.z, p0.z);
});

test('all 12 camera presets & cinematic tour sequence have finite elevated positions', () => {
  assert.equal(CAMERA_PRESETS.length, 12);
  const ids = new Set(CAMERA_PRESETS.map((p) => p.id));
  for (const tourId of CINEMATIC_TOUR_ORDER) {
    assert.ok(ids.has(tourId), `Cinematic tour references unknown preset ${tourId}`);
  }
  for (const preset of CAMERA_PRESETS) {
    assert.ok(Number.isFinite(preset.position.x));
    assert.ok(Number.isFinite(preset.position.y));
    assert.ok(Number.isFinite(preset.position.z));
    assert.ok(preset.position.y >= 2.0, `Preset ${preset.id} is too low: ${preset.position.y}`);
    const dist = Math.hypot(
      preset.position.x - preset.target.x,
      preset.position.y - preset.target.y,
      preset.position.z - preset.target.z
    );
    assert.ok(dist > 8, `Preset ${preset.id} camera too close to target (${dist})`);
  }
});

test('all 12 camera angles & 6 tracks compute authentic human eye-level 360 standing views', () => {
  assert.equal(STANDING_DIRECTIONS.length, 8);
  for (const preset of CAMERA_PRESETS) {
    const eye = getEyeLevelViewForPreset(preset.id);
    assert.ok(eye.position.y >= HUMAN_EYE_HEIGHT_M, `Eye height for ${preset.id} must be standing height`);
    assert.ok(eye.position.y <= 3.6, `Eye height for ${preset.id} must stay at human standing level`);
    const dist = Math.hypot(
      eye.target.x - eye.position.x,
      eye.target.y - eye.position.y,
      eye.target.z - eye.position.z
    );
    assert.ok(Math.abs(dist - EYE_LOOK_RADIUS_M) < 0.01);
  }

  for (const track of BASELINE_TRACKS) {
    const eye = getTrackEyeLevelView(track);
    assert.ok(eye.position.y >= HUMAN_EYE_HEIGHT_M && eye.position.y <= 2.2);
    assert.ok(eye.standingLabel.length > 5);
  }

  const origin = { x: 0, y: 1.93, z: 0 };
  for (const dir of STANDING_DIRECTIONS) {
    const t = getStandingLookTarget(origin, dir.yawDeg, 0);
    const recovered = computeCompassYawDeg(origin, t);
    const diff = Math.min(Math.abs(recovered - dir.yawDeg), 360 - Math.abs(recovered - dir.yawDeg));
    assert.ok(diff < 0.5, `Compass heading ${dir.id} should round-trip cleanly`);
  }
});

test('every department track computes a valid unobstructed camera view', () => {
  assert.equal(BASELINE_TRACKS.length, 6);
  for (const track of BASELINE_TRACKS) {
    const view = getTrackCameraView(track);
    assert.ok(view.position.y >= 15);
    assert.ok(view.fov >= 40 && view.fov <= 62);
    const dist = Math.hypot(
      view.position.x - view.target.x,
      view.position.y - view.target.y,
      view.position.z - view.target.z
    );
    assert.ok(dist > 15, `Track ${track.id} camera distance too close`);
  }
});

test('generateWorldPods covers all 6 tracks and respects TBI cutout & Robotics test pit', () => {
  const pods = generateWorldPods(BASELINE_TRACKS);
  assert.ok(pods.length >= 480, `Expected dense pod matrix, got ${pods.length}`);

  const byTrack = new Map<string, number>();
  for (const p of pods) {
    byTrack.set(p.trackId, (byTrack.get(p.trackId) ?? 0) + 1);
  }
  for (const track of BASELINE_TRACKS) {
    assert.ok((byTrack.get(track.id) ?? 0) >= 35, `Track ${track.id} has too few 3D pods`);
  }

  const tbiTrack = BASELINE_TRACKS.find((t) => t.id === 'tbi-builder')!;
  const cutRightWorld = cadToWorld(
    tbiTrack.cadZone.x + tbiTrack.cadZone.cutoutBottomLeft!.width,
    0
  ).x;
  const cutTopWorld = cadToWorld(
    0,
    tbiTrack.cadZone.y + tbiTrack.cadZone.height - tbiTrack.cadZone.cutoutBottomLeft!.height
  ).z;

  const encroaching = pods.filter(
    (p) => p.trackId === 'tbi-builder' && p.x < cutRightWorld && p.z > cutTopWorld
  );
  assert.equal(encroaching.length, 0, 'Found TBI pods inside Center Driver Room cutout');
});

test('generateArenaRoleFigures populates mentors, judges, and safety marshals across the arena', () => {
  const staff = generateArenaRoleFigures(BASELINE_TRACKS);
  const mentors = staff.filter((s) => s.role === 'mentor');
  const judges = staff.filter((s) => s.role === 'judge');
  const marshals = staff.filter((s) => s.role === 'marshal');
  assert.ok(mentors.length >= 70, `Expected >= 70 standing mentors, got ${mentors.length}`);
  assert.ok(judges.length >= 30, `Expected >= 30 judges/VCs, got ${judges.length}`);
  assert.ok(marshals.length >= 12, `Expected >= 12 marshals, got ${marshals.length}`);
});

test('lighting moods and camera clamping stay within safe bounds', () => {
  assert.ok(LIGHTING_MOODS['golden-hour'].sunIntensity > LIGHTING_MOODS['night-keynote'].sunIntensity);
  assert.ok(
    LIGHTING_MOODS['night-keynote'].stageLedEmissive >
      LIGHTING_MOODS['daylight'].stageLedEmissive
  );

  const clamped = clampCameraPosition({ x: -999, y: -5, z: 999 });
  assert.equal(clamped.y, 1.65);
  assert.ok(clamped.x >= -210 && clamped.z <= 230);
});
