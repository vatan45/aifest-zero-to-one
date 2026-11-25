import { useState } from 'react';
import { Box, Menu, X } from 'lucide-react';
import { DOCUMENT_CATALOG, DocumentId } from '../utils/documentBuilder';

export type AppViewId = DocumentId | 'arena3d';

interface TopNavProps {
  activeView: AppViewId;
  onSelectView: (id: AppViewId) => void;
  onOpenExportModal: () => void;
}

export default function TopNav({
  activeView,
  onSelectView,
  onOpenExportModal,
}: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: AppViewId) => {
    onSelectView(id);
    setMobileOpen(false);
  };

  const is3D = activeView === 'arena3d';

  return (
    <header
      className={`no-print sticky top-0 z-40 border-b ${
        is3D
          ? 'bg-[#0B1219] border-white/12 text-white'
          : 'bg-[#F5F9F8] border-[#DDE7E5] text-[#0F172A]'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('arena3d')}
          className={`inline-flex items-center gap-2 font-serif text-base sm:text-xl font-semibold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F766E] ${
            is3D ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          <svg aria-hidden="true" viewBox="0 0 28 20" className="w-6 h-4 shrink-0">
            <defs>
              <linearGradient id="z2oNavGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="55%" stopColor="#0D9488" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            <circle cx="9.5" cy="10" r="6.5" fill="none" stroke="url(#z2oNavGrad)" strokeWidth="3.6" />
            <rect x="20" y="3" width="4" height="14" rx="1.2" fill="url(#z2oNavGrad)" />
          </svg>
          <span>Zero to One · AI Fest</span>
        </button>

        {/* Zone 2: 3D Reality + 4 Standalone Proposal Documents */}
        <nav
          aria-label="Proposal workspace navigation"
          role="tablist"
          className={`hidden lg:flex items-center gap-1 p-1 rounded-md border ${
            is3D
              ? 'bg-[#131E2A] border-white/12'
              : 'bg-[#EAF2F0] border-[#DCE7E4]'
          }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'arena3d'}
            onClick={() => handleSelect('arena3d')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F766E] ${
              activeView === 'arena3d'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#0F766E] hover:bg-white/80'
            }`}
          >
            <Box className="w-3.5 h-3.5 shrink-0" />
            3D Arena Reality
          </button>

          {DOCUMENT_CATALOG.map((doc) => {
            const isActive = doc.id === activeView;
            return (
              <button
                key={doc.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelect(doc.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F766E] ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : is3D
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/70'
                }`}
              >
                {doc.shortNavLabel}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Export Action + Mobile Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]"
          >
            Export 4 Docs
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className={`lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md transition-colors cursor-pointer shrink-0 ${
              is3D ? 'text-white hover:bg-white/10' : 'text-[#0F172A] hover:bg-[#E4EFECE6]'
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tablet / Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile workspace switcher"
          className={`lg:hidden border-t px-4 py-3 space-y-1.5 ${
            is3D ? 'border-white/12 bg-[#0B1219]' : 'border-[#DDE7E5] bg-[#F5F9F8]'
          }`}
        >
          <button
            type="button"
            onClick={() => handleSelect('arena3d')}
            className={`w-full text-left py-2.5 px-3 rounded-md transition-colors cursor-pointer ${
              activeView === 'arena3d'
                ? 'bg-[#0F766E] text-white'
                : is3D
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#0F172A] hover:bg-[#E5F0EE]'
            }`}
          >
            <span className="font-mono text-[11px] block opacity-80">INTERACTIVE 3D · 8 CAMERA ANGLES</span>
            <span className="text-sm font-semibold">3D Bus Parking Arena Reality</span>
          </button>

          {DOCUMENT_CATALOG.map((doc) => {
            const isActive = doc.id === activeView;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelect(doc.id)}
                className={`w-full text-left py-2.5 px-3 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white'
                    : is3D
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-[#0F172A] hover:bg-[#E5F0EE]'
                }`}
              >
                <span className="font-mono text-[11px] block opacity-80">{doc.docNumber} · {doc.docCode}</span>
                <span className="text-sm font-semibold">{doc.title}</span>
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
