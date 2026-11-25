import test from 'node:test';
import assert from 'node:assert/strict';
import { BASELINE_TRACKS } from '../data/proposalData';
import {
  HOLOGRAM_TRIGGER_RADIUS_M,
  buildExplorerAreas,
  computeExplorerCamera,
  findNearbyHologramArea,
  stepCharacterMovement,
} from './explorerAreas';

test('buildExplorerAreas creates 8 playable areas with complete track, mentor, and sponsor info', () => {
  const areas = buildExplorerAreas(BASELINE_TRACKS);
  assert.equal(areas.length, 8);

  for (const area of areas) {
    assert.ok(area.title.length > 5);
    assert.ok(area.trackSummary.themes.length >= 2);
    assert.ok(area.mentorSummary.mentorsCount.length > 3);
    assert.ok(area.sponsorSummary.poolLakhs.includes('₹'));

    const walkDist = Math.hypot(
      area.spawnPos.x - area.hologramPos.x,
      area.spawnPos.z - area.hologramPos.z
    );
    assert.ok(
      walkDist >= 3.0 && walkDist <= 30.0,
      `Area ${area.id} hologram distance (${walkDist.toFixed(1)}m) should be comfortably walkable`
    );
  }
});

test('stepCharacterMovement walks toward hologram target and triggers hologram proximity', () => {
  const areas = buildExplorerAreas(BASELINE_TRACKS);
  const ait = areas.find((a) => a.id === 'ait')!;

  let state = {
    x: ait.spawnPos.x,
    z: ait.spawnPos.z,
    facingYawRad: ait.spawnYawRad,
    walkCyclePhase: 0,
    isMoving: false,
  };

  let arrived = false;
  for (let i = 0; i < 60; i++) {
    const res = stepCharacterMovement(
      state,
      { forward: false, backward: false, left: false, right: false, sprint: false },
      0.05,
      { x: ait.hologramPos.x, z: ait.hologramPos.z }
    );
    state = res.next;
    if (res.reachedTarget) {
      arrived = true;
      break;
    }
  }

  assert.ok(arrived, 'Auto-walk should reach AIT hologram info point cleanly');
  assert.ok(state.walkCyclePhase > 0, 'Walking should advance character leg swing phase');

  const triggered = findNearbyHologramArea(state, areas, HOLOGRAM_TRIGGER_RADIUS_M);
  assert.equal(triggered?.id, 'ait');
});

test('A/D turning rotates both character facing and TPP/FPP camera automatically without mouse', () => {
  const start = { x: 0, z: 0, facingYawRad: 0, walkCyclePhase: 0, isMoving: false };
  const turnedLeft = stepCharacterMovement(
    start,
    { forward: false, backward: false, left: true, right: false, sprint: false },
    0.1,
    null
  );
  assert.ok(turnedLeft.isTurning);
  assert.ok(turnedLeft.next.facingYawRad > 0, 'Left turn rotates counter-clockwise (+yaw)');

  const walked = stepCharacterMovement(
    turnedLeft.next,
    { forward: true, backward: false, left: false, right: false, sprint: false },
    0.1,
    null
  );
  assert.ok(walked.next.isMoving);
  assert.ok(walked.next.x > 0 && walked.next.z > 0, 'Walking forward follows turned facing yaw');

  const tpp = computeExplorerCamera(walked.next, 'tpp');
  assert.ok(tpp.position.y > 2.5, 'TPP sits elevated behind character');
  assert.ok(tpp.position.z < walked.next.z, 'TPP sits behind facing direction');

  const fpp = computeExplorerCamera(walked.next, 'fpp');
  assert.ok(Math.abs(fpp.position.y - 1.72) < 0.05, 'FPP sits at 1.72m eye height');
  assert.ok(fpp.target.x > fpp.position.x, 'FPP looks forward along turned facing yaw');
});
