import { ArrowLeft, ArrowRight, Download, Printer } from 'lucide-react';
import { DOCUMENT_CATALOG, DocumentDescriptor, DocumentId } from '../utils/documentBuilder';

export interface DocMetricItem {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}

interface DocumentHeaderProps {
  doc: DocumentDescriptor;
  metrics: DocMetricItem[];
  isExportingPdf?: boolean;
  onPrintCurrent: () => void;
  onDownloadCurrent: () => void;
  onOpenExportModal: () => void;
}

export function DocumentHeader({
  doc,
  metrics,
  isExportingPdf = false,
  onPrintCurrent,
  onDownloadCurrent,
  onOpenExportModal,
}: DocumentHeaderProps) {
  return (
    <section className="pt-8 pb-10 sm:pt-10 sm:pb-12 border-b border-[#DCE7E4] bg-[#F4F8F7]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono">
              <span className="font-semibold text-[#0F766E]">{doc.docNumber} / 04</span>
              <span className="text-[#94A3B8]">·</span>
              <span className="text-[#475569]">REF: {doc.docCode}</span>
              <span className="text-[#94A3B8]">·</span>
              <span className="text-[#475569]">Zero to One Hackathon · CU AI Fest</span>
            </div>

            <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold leading-[1.1] tracking-tight text-[#0F172A]">
              {doc.title}
            </h1>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#334155]">
              {doc.subtitle}
            </p>

            <p className="mt-2 text-xs text-[#475569]">
              <span className="font-semibold text-[#0F172A]">Primary Audience:</span>{' '}
              {doc.primaryAudience}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onDownloadCurrent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:border-[#0F766E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0F766E]" />
              Download {doc.docNumber} (.txt)
            </button>
            <button
              type="button"
              disabled={isExportingPdf}
              onClick={onPrintCurrent}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {isExportingPdf ? `Generating ${doc.docNumber} PDF...` : `Download ${doc.docNumber} PDF`}
            </button>
            <button
              type="button"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0F766E] bg-[#F0FDF9] border border-[#99F6E4] hover:border-[#0F766E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              All 4 Docs PDF
            </button>
          </div>
        </div>

        {/* 4-Column Document Executive KPI Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#DCE7E4] bg-white rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#DCE7E4]">
          {metrics.map((item) => (
            <div key={item.label} className="p-5">
              <p className="text-xs font-medium text-[#475569]">{item.label}</p>
              <p
                className={`mt-1.5 font-mono text-2xl sm:text-[1.7rem] font-semibold tabular-nums ${
                  item.accent ? 'text-[#0F766E]' : 'text-[#0F172A]'
                }`}
              >
                {item.value}
              </p>
              <p className="mt-1 text-xs text-[#475569] tabular-nums">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface DocumentPagerProps {
  activeDocId: DocumentId;
  onSelectDoc: (id: DocumentId) => void;
}

export function DocumentPager({ activeDocId, onSelectDoc }: DocumentPagerProps) {
  const idx = DOCUMENT_CATALOG.findIndex((d) => d.id === activeDocId);
  const prevDoc = idx > 0 ? DOCUMENT_CATALOG[idx - 1] : null;
  const nextDoc = idx < DOCUMENT_CATALOG.length - 1 ? DOCUMENT_CATALOG[idx + 1] : null;

  return (
    <div className="no-print border-t border-[#DCE7E4] bg-white py-6">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {prevDoc ? (
          <button
            type="button"
            onClick={() => onSelectDoc(prevDoc.id)}
            className="inline-flex items-center gap-3 px-4 py-3 text-left border border-[#DCE7E4] hover:border-[#0F766E] rounded-md bg-[#F8FBFA] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F766E] shrink-0" />
            <div>
              <p className="text-[11px] font-mono text-[#475569]">Previous · {prevDoc.docNumber}</p>
              <p className="text-sm font-semibold text-[#0F172A]">{prevDoc.title}</p>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextDoc ? (
          <button
            type="button"
            onClick={() => onSelectDoc(nextDoc.id)}
            className="inline-flex items-center justify-end gap-3 px-4 py-3 text-right border border-[#DCE7E4] hover:border-[#0F766E] rounded-md bg-[#F8FBFA] transition-colors cursor-pointer"
          >
            <div>
              <p className="text-[11px] font-mono text-[#0F766E]">Next · {nextDoc.docNumber}</p>
              <p className="text-sm font-semibold text-[#0F172A]">{nextDoc.title}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] shrink-0" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
