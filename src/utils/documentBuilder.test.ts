import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOCUMENT_CATALOG,
  buildDateMilestoneSchedule,
  generateDocumentTextExport,
} from './documentBuilder';
import {
  calculateLogisticsRequirements,
  calculateProposalSummary,
  getEventWindowDates,
} from './hackathonModel';
import { BASELINE_TRACKS } from '../data/proposalData';

test('DOCUMENT_CATALOG defines all 4 standalone proposal documents', () => {
  assert.equal(DOCUMENT_CATALOG.length, 4);
  assert.deepEqual(
    DOCUMENT_CATALOG.map((d) => d.id),
    ['departments', 'venue', 'sponsors', 'timeline']
  );
  assert.deepEqual(
    DOCUMENT_CATALOG.map((d) => d.docNumber),
    ['DOC 01', 'DOC 02', 'DOC 03', 'DOC 04']
  );
});

test('buildDateMilestoneSchedule produces chronological dates anchored to 1 Dec, 15 Dec & selected slot', () => {
  const dates = getEventWindowDates();
  const jan29 = dates.find((d) => d.isoDate === '2027-01-29')!;
  const schedule = buildDateMilestoneSchedule(jan29);

  assert.equal(schedule.length, 12);
  assert.equal(schedule[0].dateLabel, '1 Dec 2026');
  assert.equal(schedule[2].dateLabel, '15 Dec 2026');
  assert.equal(schedule[6].dateLabel, '19 Jan 2027'); // T-10
  assert.equal(schedule[8].dateLabel, '27 Jan 2027'); // T-2
  assert.equal(schedule[10].dateLabel, '29–30 Jan 2027'); // Event Day
  assert.equal(schedule[11].dateLabel, '5 Feb 2027'); // T+7
});

test('generateDocumentTextExport builds accurate isolated and combined briefs', () => {
  const summary = calculateProposalSummary(BASELINE_TRACKS);
  const logistics = calculateLogisticsRequirements(summary.totalShowUp);
  const dates = getEventWindowDates();
  const slot = dates[1]; // 29-30 Jan

  const doc1 = generateDocumentTextExport('departments', BASELINE_TRACKS, summary, logistics, slot);
  assert.match(doc1, /DOC 01 \/ 04/);
  assert.match(doc1, /105,000/);
  assert.match(doc1, /6,200/);
  assert.doesNotMatch(doc1, /DOC 02 \/ 04/);

  const doc2 = generateDocumentTextExport('venue', BASELINE_TRACKS, summary, logistics, slot);
  assert.match(doc2, /DOC 02 \/ 04/);
  assert.match(doc2, /183,700 sq ft/);
  assert.match(doc2, /ZONE F/);
  assert.doesNotMatch(doc2, /DOC 03 \/ 04/);

  const doc3 = generateDocumentTextExport('sponsors', BASELINE_TRACKS, summary, logistics, slot);
  assert.match(doc3, /DOC 03 \/ 04/);
  assert.match(doc3, /₹104 Lakhs/);
  assert.match(doc3, /248 Mentors/);
  assert.match(doc3, /62 Track Judges/);

  const doc4 = generateDocumentTextExport('timeline', BASELINE_TRACKS, summary, logistics, slot);
  assert.match(doc4, /DOC 04 \/ 04/);
  assert.match(doc4, /1 December 2026/);
  assert.match(doc4, /15 December 2026/);
  assert.match(doc4, /29–30 Jan 2027/);

  const allDocs = generateDocumentTextExport('all', BASELINE_TRACKS, summary, logistics, slot);
  assert.match(allDocs, /DOC 01 \/ 04/);
  assert.match(allDocs, /DOC 02 \/ 04/);
  assert.match(allDocs, /DOC 03 \/ 04/);
  assert.match(allDocs, /DOC 04 \/ 04/);
});
