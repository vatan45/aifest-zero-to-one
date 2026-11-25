import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TOTAL_ARENA_SQFT,
  RECORD_TARGET_PARTICIPANTS,
  calculateTrackMetrics,
  calculateProposalSummary,
  calculateLogisticsRequirements,
  filterTracks,
  updateDepartmentQuota,
  getEventWindowDates,
} from './hackathonModel';
import { BASELINE_TRACKS } from '../data/proposalData';

test('Bus Parking A3 CAD arena footprint equals exact sum of wings (183,700 sq ft)', () => {
  // North Wing (200x300=60000) + Stage/Backstage (200x250=50000) + Central (250x250=62500) + SE Wing (140x80=11200)
  assert.equal(TOTAL_ARENA_SQFT, 183700);
});

test('Baseline 6-track allocation hits 6,200 show-ups and 105,000 unified registrations', () => {
  assert.equal(BASELINE_TRACKS.length, 6);
  const summary = calculateProposalSummary(BASELINE_TRACKS);
  assert.equal(summary.totalShowUp, 6200);
  assert.equal(summary.meetsRecordTarget, true);
  assert.equal(summary.recordBuffer, 200);
  assert.equal(summary.totalTeams, 1240);
  assert.equal(summary.totalRegistrations, 105000);
  assert.equal(summary.totalSponsorLakhs, 104); // 59 track + 45 central TBI

  // Verify each individual track registration & show-up quota
  const byId = Object.fromEntries(BASELINE_TRACKS.map((t) => [t.id, calculateTrackMetrics(t)]));
  assert.equal(byId['tbi-builder'].showUpTarget, 2000);
  assert.equal(byId['tbi-builder'].registrationTarget, 50000);
  assert.equal(byId['ait'].showUpTarget, 1000);
  assert.equal(byId['ait'].registrationTarget, 15000);
  assert.equal(byId['cse'].showUpTarget, 800);
  assert.equal(byId['cse'].registrationTarget, 10000);
  assert.equal(byId['uie'].showUpTarget, 800);
  assert.equal(byId['uie'].registrationTarget, 10000);
  assert.equal(byId['aim'].showUpTarget, 800);
  assert.equal(byId['aim'].registrationTarget, 10000);
  assert.equal(byId['robotics-mechatronics'].showUpTarget, 800);
  assert.equal(byId['robotics-mechatronics'].registrationTarget, 10000);
});

test('Track metrics compute mentors, judges, teams, and density accurately', () => {
  const robotics = BASELINE_TRACKS.find((t) => t.id === 'robotics-mechatronics');
  assert.ok(robotics);
  const metrics = calculateTrackMetrics(robotics);
  assert.equal(metrics.showUpTarget, 800);
  assert.equal(metrics.registrationTarget, 10000);
  assert.equal(metrics.teamsCount, 160);
  assert.equal(metrics.mentorsRequired, 32);
  assert.equal(metrics.judgesRequired, 8);
  assert.equal(metrics.sqftPerParticipant, 17);
  assert.equal(metrics.densityStatus, 'Optimal');
});

test('Updating a department quota updates totals and enforces clamping bounds', () => {
  const updated = updateDepartmentQuota(BASELINE_TRACKS, 'cse', 1050, 15.0);
  const summary = calculateProposalSummary(updated);
  assert.equal(summary.totalShowUp, 6450); // +250 from 800 -> 1050
  const cse = updated.find((t) => t.id === 'cse');
  assert.equal(cse?.funnelMultiplier, 15.0);

  // Clamping test (low & high)
  const clampedLow = updateDepartmentQuota(BASELINE_TRACKS, 'aim', 50, 1.0);
  const aimLow = clampedLow.find((t) => t.id === 'aim');
  assert.equal(aimLow?.showUpTarget, 200);
  assert.equal(aimLow?.funnelMultiplier, 2.0);

  const clampedHigh = updateDepartmentQuota(BASELINE_TRACKS, 'tbi-builder', 4000, 50.0);
  const tbiHigh = clampedHigh.find((t) => t.id === 'tbi-builder');
  assert.equal(tbiHigh?.showUpTarget, 3000);
  assert.equal(tbiHigh?.funnelMultiplier, 35.0);

  // Drop below 6,000 threshold check
  const reduced = updateDepartmentQuota(BASELINE_TRACKS, 'tbi-builder', 1650);
  const reducedSummary = calculateProposalSummary(reduced);
  assert.equal(reducedSummary.totalShowUp, 5850);
  assert.equal(reducedSummary.meetsRecordTarget, false);
  assert.equal(reducedSummary.recordBuffer, -150);
});

test('Logistics calculator scales Wi-Fi APs, power, meals, and check-in lanes realistically', () => {
  const ops = calculateLogisticsRequirements(6200);
  assert.equal(ops.totalMealPacks, 24800);
  assert.equal(ops.wifiAccessPoints, 66);
  assert.equal(ops.uplinkGbps, 20);
  assert.equal(ops.checkinLanes, 25);
  assert.ok(ops.powerKva >= 1050);
  assert.equal(ops.volunteersTotal, ops.volunteersPerShift * 3);
});

test('Filtering tracks by category and search query works cleanly across all 6 tracks', () => {
  const hardwareGrowth = filterTracks(BASELINE_TRACKS, 'hardware-growth', '');
  assert.equal(hardwareGrowth.length, 2);
  assert.deepEqual(
    hardwareGrowth.map((t) => t.id),
    ['aim', 'robotics-mechatronics']
  );

  const searchRobotics = filterTracks(BASELINE_TRACKS, 'all', 'hardware');
  assert.equal(searchRobotics.length, 1);
  assert.equal(searchRobotics[0].id, 'robotics-mechatronics');
  assert.equal(searchRobotics[0].trackShortName, 'Hardware & Robotics');

  const searchGenAi = filterTracks(BASELINE_TRACKS, 'all', 'GenAI');
  assert.equal(searchGenAi.length, 1);
  assert.equal(searchGenAi[0].id, 'ait');

  const searchMarketing = filterTracks(BASELINE_TRACKS, 'all', 'Digital Marketing');
  assert.equal(searchMarketing.length, 1);
  assert.equal(searchMarketing[0].id, 'aim');

  const searchUie = filterTracks(BASELINE_TRACKS, 'all', 'Core Computing');
  assert.equal(searchUie.length, 1);
  assert.equal(searchUie[0].id, 'uie');

  assert.ok(BASELINE_TRACKS.every((t) => t.trackShortName.length > 0));
});

test('Event execution window spans exactly 28 Jan – 15 Feb 2027 (19 days) with milestone offsets', () => {
  const dates = getEventWindowDates();
  assert.equal(dates.length, 19);
  assert.equal(dates[0].isoDate, '2027-01-28');
  assert.equal(dates[dates.length - 1].isoDate, '2027-02-15');
  assert.equal(dates[0].daysFromLaunchDec1, 58);
  assert.equal(dates[0].daysFromDeptDec15, 44);
  assert.ok(dates.some((d) => d.isWeekendRecommended));
  assert.equal(RECORD_TARGET_PARTICIPANTS, 6000);
});
