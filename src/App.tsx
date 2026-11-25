import { useMemo, useState } from 'react';
import TopNav, { AppViewId } from './components/TopNav';
import Arena3DReality from './components/Arena3DReality';
import Doc1Departments from './components/Doc1Departments';
import Doc2Venue from './components/Doc2Venue';
import Doc3SponsorsGuests from './components/Doc3SponsorsGuests';
import Doc4Timeline from './components/Doc4Timeline';
import { DocumentPager } from './components/DocumentHeader';
import {
  ExecutiveExportModal,
  OriginalBlueprintModal,
  downloadDocumentBrief,
} from './components/Modals';
import { BASELINE_TRACKS } from './data/proposalData';
import { DOCUMENT_CATALOG, DocumentId } from './utils/documentBuilder';
import { downloadProposalPdf } from './utils/pdfGenerator';
import {
  TrackDepartment,
  calculateLogisticsRequirements,
  calculateProposalSummary,
  getEventWindowDates,
  updateDepartmentQuota,
} from './utils/hackathonModel';

function detectProposalViewUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  return view === 'proposal' || view === 'docs' || params.has('doc');
}

export default function App() {
  const [isStandalone3D, setIsStandalone3D] = useState<boolean>(() => !detectProposalViewUrl());
  const [activeView, setActiveView] = useState<AppViewId>(() =>
    detectProposalViewUrl() ? 'departments' : 'arena3d'
  );
  const [lastDocId, setLastDocId] = useState<DocumentId>('departments');
  const [tracks, setTracks] = useState<TrackDepartment[]>(BASELINE_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(BASELINE_TRACKS[0].id);
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeDocId: DocumentId = activeView === 'arena3d' ? lastDocId : activeView;

  const dateOptions = useMemo(() => getEventWindowDates(), []);
  // Default to first recommended weekend slot (29–30 Jan 2027) inside 28 Jan – 15 Feb window
  const defaultDateIso =
    dateOptions.find((d) => d.isWeekendRecommended)?.isoDate ?? dateOptions[0].isoDate;
  const [selectedDateIso, setSelectedDateIso] = useState<string>(defaultDateIso);

  const selectedDate =
    dateOptions.find((d) => d.isoDate === selectedDateIso) ?? dateOptions[0];

  const summary = useMemo(() => calculateProposalSummary(tracks), [tracks]);
  const logistics = useMemo(
    () => calculateLogisticsRequirements(summary.totalShowUp),
    [summary.totalShowUp]
  );

  const isModified = useMemo(() => {
    return tracks.some((t, i) => {
      const base = BASELINE_TRACKS[i];
      return (
        t.showUpTarget !== base.showUpTarget ||
        t.funnelMultiplier !== base.funnelMultiplier
      );
    });
  }, [tracks]);

  const handleSelectView = (view: AppViewId) => {
    if (view === 'arena3d') {
      setActiveView('arena3d');
      setIsStandalone3D(true);
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    setIsStandalone3D(false);
    setActiveView(view);
    setLastDocId(view);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleEnterStandalone3D = () => {
    handleSelectView('arena3d');
  };

  const handleUpdateQuota = (
    trackId: string,
    nextShowUp: number,
    nextFunnel?: number
  ) => {
    setTracks((prev) => updateDepartmentQuota(prev, trackId, nextShowUp, nextFunnel));
  };

  const handleResetBaseline = () => {
    setTracks(BASELINE_TRACKS);
  };

  const handleDownloadCurrentPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await downloadProposalPdf(activeDocId, tracks, summary, logistics, selectedDate);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadCurrent = () => {
    downloadDocumentBrief(activeDocId, tracks, summary, logistics, selectedDate);
  };

  if (isStandalone3D) {
    return (
      <div className="min-h-screen bg-[#0B1219] text-white">
        <Arena3DReality
          standalone
          tracks={tracks}
          summary={summary}
          onSelectTrack={setSelectedTrackId}
          onJumpToBlueprint={() => handleSelectView('venue')}
          onOpenProposalDocs={() => handleSelectView('departments')}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        activeView === 'arena3d'
          ? 'bg-[#0B1219] text-white'
          : 'bg-[#F4F8F7] text-[#0F172A]'
      }`}
    >
      <TopNav
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenExportModal={() => setExportModalOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'arena3d' && (
          <Arena3DReality
            standalone={false}
            tracks={tracks}
            summary={summary}
            onSelectTrack={setSelectedTrackId}
            onJumpToBlueprint={() => handleSelectView('venue')}
            onOpenStandalone={handleEnterStandalone3D}
          />
        )}

        {activeView === 'departments' && (
          <Doc1Departments
            tracks={tracks}
            summary={summary}
            selectedTrackId={selectedTrackId}
            selectedDate={selectedDate}
            onSelectTrack={setSelectedTrackId}
            onUpdateQuota={handleUpdateQuota}
            onResetBaseline={handleResetBaseline}
            isModified={isModified}
            onPrintCurrent={handleDownloadCurrentPdf}
            onDownloadCurrent={handleDownloadCurrent}
            onOpenExportModal={() => setExportModalOpen(true)}
          />
        )}

        {activeView === 'venue' && (
          <Doc2Venue
            tracks={tracks}
            summary={summary}
            logistics={logistics}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            onAdjustQuota={(id, nextShowUp) => handleUpdateQuota(id, nextShowUp)}
            onOpenOriginalBlueprint={() => setBlueprintModalOpen(true)}
            onOpen3DReality={() => handleSelectView('arena3d')}
            onPrintCurrent={handleDownloadCurrentPdf}
            onDownloadCurrent={handleDownloadCurrent}
            onOpenExportModal={() => setExportModalOpen(true)}
          />
        )}

        {activeView === 'sponsors' && (
          <Doc3SponsorsGuests
            tracks={tracks}
            summary={summary}
            onPrintCurrent={handleDownloadCurrentPdf}
            onDownloadCurrent={handleDownloadCurrent}
            onOpenExportModal={() => setExportModalOpen(true)}
          />
        )}

        {activeView === 'timeline' && (
          <Doc4Timeline
            summary={summary}
            dateOptions={dateOptions}
            selectedDateIso={selectedDateIso}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDateIso}
            onPrintCurrent={handleDownloadCurrentPdf}
            onDownloadCurrent={handleDownloadCurrent}
            onOpenExportModal={() => setExportModalOpen(true)}
          />
        )}

        {activeView !== 'arena3d' && (
          <DocumentPager activeDocId={activeDocId} onSelectDoc={handleSelectView} />
        )}
      </main>

      {activeView !== 'arena3d' && (
        <footer className="no-print border-t border-[#DCE7E4] bg-[#F4F8F7] py-8">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
            <p>
              Zero to One Hackathon · Chandigarh University AI Fest · 3D Reality &amp; 4-Document Institutional Dossier
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleSelectView('arena3d')}
                className="font-semibold text-[#0F766E] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                3D Arena Reality
              </button>
              {DOCUMENT_CATALOG.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectView(doc.id)}
                  className={`hover:text-[#0F172A] transition-colors cursor-pointer ${
                    doc.id === activeDocId ? 'font-semibold text-[#0F766E]' : ''
                  }`}
                >
                  {doc.shortNavLabel}
                </button>
              ))}
            </div>
          </div>
        </footer>
      )}

      <OriginalBlueprintModal
        open={blueprintModalOpen}
        onClose={() => setBlueprintModalOpen(false)}
      />

      <ExecutiveExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        activeDocId={activeDocId}
        tracks={tracks}
        summary={summary}
        logistics={logistics}
        selectedDate={selectedDate}
      />
    </div>
  );
}
