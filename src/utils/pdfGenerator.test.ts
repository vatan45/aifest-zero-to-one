import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProposalPdf,
  getPdfFilename,
  sanitizePdfText,
} from './pdfGenerator';
import {
  calculateLogisticsRequirements,
  calculateProposalSummary,
  getEventWindowDates,
} from './hackathonModel';
import { BASELINE_TRACKS } from '../data/proposalData';

test('sanitizePdfText normalizes Indian Rupee and typographic symbols cleanly for PDF fonts', () => {
  assert.equal(sanitizePdfText('₹104L · 29–30 Jan · 45° · 12.5×'), 'INR 104L | 29-30 Jan | 45 deg | 12.5x');
});

test('buildProposalPdf produces valid multi-page PDF documents for DOC 01, 02, 03, 04 and All-in-One Pack', () => {
  const summary = calculateProposalSummary(BASELINE_TRACKS);
  const logistics = calculateLogisticsRequirements(summary.totalShowUp);
  const slot = getEventWindowDates()[1];

  const docIds = ['departments', 'venue', 'sponsors', 'timeline', 'all'] as const;
  for (const docId of docIds) {
    const pdf = buildProposalPdf(docId, BASELINE_TRACKS, summary, logistics, slot);
    const bytes = pdf.output('arraybuffer');
    const header = new TextDecoder().decode(new Uint8Array(bytes.slice(0, 5)));

    assert.equal(header, '%PDF-', `Expected valid PDF header for ${docId}`);
    assert.ok(bytes.byteLength > 4000, `Expected non-empty PDF payload for ${docId}`);
    assert.ok(pdf.getNumberOfPages() >= 1, `Expected >= 1 page for ${docId}`);
  }

  const allPdf = buildProposalPdf('all', BASELINE_TRACKS, summary, logistics, slot);
  assert.ok(allPdf.getNumberOfPages() >= 4, 'Combined master pack should have at least 4 pages');
});

test('getPdfFilename formats descriptive standalone filenames per document', () => {
  const slot = getEventWindowDates()[1];
  assert.equal(
    getPdfFilename('departments', slot),
    `CU_Zero_to_One_DOC01_Departments_and_Tracks_${slot.isoDate}.pdf`
  );
  assert.equal(
    getPdfFilename('venue', slot),
    `CU_Zero_to_One_DOC02_Venue_and_Structure_${slot.isoDate}.pdf`
  );
  assert.equal(
    getPdfFilename('sponsors', slot),
    `CU_Zero_to_One_DOC03_Sponsors_Mentors_and_Guests_${slot.isoDate}.pdf`
  );
  assert.equal(
    getPdfFilename('timeline', slot),
    `CU_Zero_to_One_DOC04_Timeline_Dates_and_RunOfShow_${slot.isoDate}.pdf`
  );
  assert.equal(
    getPdfFilename('all', slot),
    `CU_Zero_to_One_Complete_4_Document_Master_Pack_${slot.isoDate}.pdf`
  );
});
