import { useEffect, useState } from 'react';
import { Check, Download, FileDown, X } from 'lucide-react';
import {
  EventDateOption,
  LogisticsRequirements,
  ProposalSummary,
  TrackDepartment,
} from '../utils/hackathonModel';
import {
  DOCUMENT_CATALOG,
  DocumentId,
  generateDocumentTextExport,
} from '../utils/documentBuilder';
import { downloadProposalPdf } from '../utils/pdfGenerator';
import { ORIGINAL_BLUEPRINT_PDF_URL } from '../data/proposalData';

interface BlueprintModalProps {
  open: boolean;
  onClose: () => void;
}

export function OriginalBlueprintModal({ open, onClose }: BlueprintModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="original-pdf-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141518]/70 backdrop-blur-xs"
    >
      <div className="bg-white border border-[#DCE7E4] rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#DCE7E4] flex items-center justify-between gap-4 bg-[#F4F8F7]">
          <div>
            <h2 id="original-pdf-title" className="font-serif text-lg font-semibold text-[#0F172A]">
              Original Bus Parking A3 Architectural Blueprint (Reference PDF)
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Source drawing used 1:1 for the 183,700 sq ft Zero to One 6-track masterplan zoning.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={ORIGINAL_BLUEPRINT_PDF_URL}
              download="CU_Zero_to_One_Bus_Parking_A3_Layout.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#0F172A] rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close original blueprint modal"
              className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#475569] hover:bg-[#E2ECE9] hover:text-[#0F172A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#F3F1EC] p-4 min-h-[480px]">
          <object
            data={ORIGINAL_BLUEPRINT_PDF_URL}
            type="application/pdf"
            className="w-full h-[65vh] rounded border border-[#D4D1C8] bg-white"
          >
            <div className="p-8 text-center">
              <p className="text-sm text-[#141518] font-medium">
                Inline PDF preview is not supported in this browser view.
              </p>
              <a
                href={ORIGINAL_BLUEPRINT_PDF_URL}
                download="CU_AI_Fest_Bus_Parking_A3_Layout.pdf"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#141518] rounded-md"
              >
                <Download className="w-3.5 h-3.5" />
                Download Bus Parking A3 PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}

interface PrintBriefModalProps {
  open: boolean;
  onClose: () => void;
  activeDocId: DocumentId;
  tracks: TrackDepartment[];
  summary: ProposalSummary;
  logistics: LogisticsRequirements;
  selectedDate: EventDateOption;
}

export function downloadDocumentBrief(
  docId: DocumentId | 'all',
  tracks: TrackDepartment[],
  summary: ProposalSummary,
  logistics: LogisticsRequirements,
  selectedDate: EventDateOption
) {
  const content = generateDocumentTextExport(docId, tracks, summary, logistics, selectedDate);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileSuffix =
    docId === 'all'
      ? 'Complete_4_Document_Master_Pack'
      : DOCUMENT_CATALOG.find((d) => d.id === docId)?.docCode ?? docId;
  link.download = `CU_Zero_to_One_${fileSuffix}_${selectedDate.isoDate}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExecutiveExportModal({
  open,
  onClose,
  activeDocId,
  tracks,
  summary,
  logistics,
  selectedDate,
}: PrintBriefModalProps) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleDownloadPdf = async (target: DocumentId | 'all') => {
    setBusyKey(target);
    try {
      const filename = await downloadProposalPdf(target, tracks, summary, logistics, selectedDate);
      setLastDownloaded(filename);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141518]/70 backdrop-blur-xs"
    >
      <div className="bg-white border border-[#DCE7E4] rounded-lg w-full max-w-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DCE7E4] bg-[#F4F8F7] flex items-center justify-between gap-4">
          <div>
            <h2 id="export-modal-title" className="font-serif text-lg font-semibold text-[#0F172A]">
              Download Individual PDFs &amp; 4-Document Master Pack
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Generates real multi-page A4 PDF files directly for each standalone document—no browser print dialog required.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export proposal modal"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#475569] hover:bg-[#E2ECE9] hover:text-[#0F172A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Live Snapshot Ribbon */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F4F8F7] border border-[#DCE7E4] rounded-md text-xs">
            <div>
              <dt className="text-[#475569]">Show-Up Target</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                {summary.totalShowUp.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[#475569]">Registrations</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                {summary.totalRegistrations.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[#475569]">Sponsor Pool</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F766E] tabular-nums">
                ₹{summary.totalSponsorLakhs}L
              </dd>
            </div>
            <div>
              <dt className="text-[#475569]">Event Slot</dt>
              <dd className="mt-1 font-mono text-base font-semibold text-[#0F172A] tabular-nums">
                {selectedDate.label}
              </dd>
            </div>
          </dl>

          {/* Individual 4 Documents Export List */}
          <div className="border border-[#DCE7E4] rounded-md divide-y divide-[#E6EFEC]">
            {DOCUMENT_CATALOG.map((doc) => {
              const isCurrent = doc.id === activeDocId;
              const isBusy = busyKey === doc.id;
              return (
                <div
                  key={doc.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent ? 'bg-[#F0FDF9]' : 'bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#0F766E]">
                        {doc.docNumber}
                      </span>
                      <span className="font-semibold text-sm text-[#0F172A]">{doc.title}</span>
                    </div>
                    <p className="text-xs text-[#475569] mt-0.5">{doc.primaryAudience}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        downloadDocumentBrief(doc.id, tracks, summary, logistics, selectedDate)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#0F766E] rounded-md transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      .txt
                    </button>
                    <button
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => handleDownloadPdf(doc.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-60 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      {isBusy ? 'Generating...' : `Download ${doc.docNumber} PDF`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {lastDownloaded && (
            <p
              data-testid="pdf-download-confirmation"
              className="text-xs font-medium text-[#0F766E] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 shrink-0" />
              Downloaded PDF: <span className="font-mono">{lastDownloaded}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6EFEC]">
            <button
              type="button"
              onClick={() =>
                downloadDocumentBrief('all', tracks, summary, logistics, selectedDate)
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#0F766E] rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              All 4 Docs (.txt)
            </button>

            <button
              type="button"
              disabled={busyKey !== null}
              onClick={() => handleDownloadPdf('all')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-60 rounded-md transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              {busyKey === 'all' ? 'Building Complete 4-Doc PDF...' : 'Download Complete 4-Doc Master PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
