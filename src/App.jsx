import React, { useState, useEffect } from 'react';
import { Pause } from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GroupLoginScreen from './components/GroupLoginScreen';
import PressCardModal from './components/PressCardModal';
import PressShopModal from './components/PressShopModal';
import AdminDashboard from './components/AdminDashboard';
import InterviewMessengerModal from './components/InterviewMessengerModal';
import PocketNotebookDrawer from './components/PocketNotebookDrawer';
import Footer from './components/Footer';

import Game5W1H from './games/Game5W1H';
import GamePyramid from './games/GamePyramid';
import GameWriteNews from './games/GameWriteNews';

import { 
  getActiveTeam, 
  registerOrUpdateTeam, 
  recordTeamStageCompletion, 
  logoutTeam,
  getClassroomStage,
  getScreenFreeze,
  adminDeleteTeam,
  getActiveModule,
  setActiveModuleInStorage,
  pauseTeamStageTimer,
  isStageCompleted
} from './utils/storage';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [activeTeam, setActiveTeamState] = useState(getActiveTeam());
  const [activeModule, setActiveModuleState] = useState(() => getActiveModule());
  const [isPressCardOpen, setIsPressCardOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [stageTick, setStageTick] = useState(0); // trigger re-render on sync
  const [freezeState, setFreezeState] = useState(() => getScreenFreeze());

  // Multi-device server sync & cross-tab consistency listener
  useEffect(() => {
    const handleSync = () => {
      setActiveTeamState(getActiveTeam());
      setFreezeState(getScreenFreeze());
      const curStage = getClassroomStage();
      const curModule = getActiveModule();
      if (curModule && curModule.number > curStage) {
        setActiveModuleState(null);
        setActiveModuleInStorage(null);
      }
      setStageTick(prev => prev + 1);
    };

    const handleStorageSync = (e) => {
      if (
        !e.key ||
        e.key === "redaksi_siswa_active_team_id_v5" || 
        e.key === "redaksi_siswa_teams_v5" || 
        e.key === "redaksi_classroom_stage_v5"
      ) {
        handleSync();
      }
      if (e.key === "redaksi_siswa_screen_freeze_v5") {
        setFreezeState(getScreenFreeze());
      }
    };

    window.addEventListener("storage", handleStorageSync);
    window.addEventListener("classroom-sync", handleSync);

    const intv = setInterval(() => {
      setFreezeState(getScreenFreeze());
      const current = getActiveTeam();
      // If team was disbanded or changed remotely on server, update immediately
      if ((!current && activeTeam) || (current && !activeTeam) || (current?.id !== activeTeam?.id)) {
        setActiveTeamState(current);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageSync);
      window.removeEventListener("classroom-sync", handleSync);
      clearInterval(intv);
    };
  }, [activeTeam]);

  // Scroll to top ONLY when user explicitly navigates to a new view/module, never on background data sync
  const activeModuleId = activeModule?.id || activeModule?.number || null;
  const activeTeamId = activeTeam?.id || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeModuleId, activeTeamId, isAdminView]);

  // If Admin View is active, show the Dedicated Admin Dashboard page
  if (isAdminView) {
    return (
      <AdminDashboard 
        onExitAdmin={() => {
          setIsAdminView(false);
          setActiveTeamState(getActiveTeam());
          setStageTick(prev => prev + 1);
        }}
        onBackToDashboard={() => {
          setIsAdminView(false);
          setActiveTeamState(getActiveTeam());
          setStageTick(prev => prev + 1);
        }}
      />
    );
  }

  // If no team is active, show the Group Login Screen
  if (!activeTeam) {
    return (
      <GroupLoginScreen 
        onLoginSuccess={(team) => {
          setActiveTeamState(team);
        }} 
        onOpenAdmin={() => setIsAdminView(true)}
      />
    );
  }

  const handleSelectModule = (moduleData) => {
    if (!moduleData || !moduleData.number) return;
    const currentClassStage = getClassroomStage();
    // Guard 1: cannot enter a module higher than current classroom stage
    if (moduleData.number > currentClassStage) {
      return;
    }
    // Guard 2: if team already completed this stage and waiting for teacher
    const curTeam = getActiveTeam();
    if (curTeam && isStageCompleted(curTeam, moduleData.number) && (curTeam.completedStages || []).length >= currentClassStage) {
      return;
    }
    setActiveModuleState(moduleData);
    setActiveModuleInStorage(moduleData);
  };

  const handleBackToHome = () => {
    if (activeTeam?.id && activeModule?.number) {
      pauseTeamStageTimer(activeTeam.id, activeModule.number);
    }
    setActiveTeamState(getActiveTeam());
    setActiveModuleState(null);
    setActiveModuleInStorage(null);
    setStageTick(prev => prev + 1);
  };

  const handleCompleteModule = (stageNumber, score, badgeName, durationSeconds = null) => {
    const updated = recordTeamStageCompletion(stageNumber, score, badgeName, durationSeconds);
    setActiveTeamState(updated);
    setActiveModuleState(null);
    setActiveModuleInStorage(null);
    setStageTick(prev => prev + 1);
  };

  const handleSaveTeam = (newTeamData) => {
    const saved = registerOrUpdateTeam(newTeamData);
    setActiveTeamState(saved);
  };

  const handleLogoutTeam = () => {
    logoutTeam();
    setActiveTeamState(null);
    setActiveModuleState(null);
    setActiveModuleInStorage(null);
  };

  const handleDisbandTeam = (teamId) => {
    adminDeleteTeam(teamId);
    logoutTeam();
    setActiveTeamState(null);
    setActiveModuleState(null);
    setActiveModuleInStorage(null);
    setIsPressCardOpen(false);
    setStageTick(prev => prev + 1);
  };

  const handleStageAdvanced = () => {
    const updated = getActiveTeam();
    setActiveTeamState(updated);
    setStageTick(prev => prev + 1);
  };

  const renderActiveGame = () => {
    if (!activeModule) return null;

    switch (activeModule.number) {
      case 1:
        return (
          <Game5W1H
            moduleData={activeModule}
            team={activeTeam}
            onComplete={handleCompleteModule}
            onBack={handleBackToHome}
          />
        );
      case 2:
        return (
          <GamePyramid
            moduleData={activeModule}
            team={activeTeam}
            onComplete={handleCompleteModule}
            onBack={handleBackToHome}
          />
        );
      case 3:
        return (
          <GameWriteNews
            moduleData={activeModule}
            team={activeTeam}
            onComplete={handleCompleteModule}
            onBack={handleBackToHome}
            onOpenPocketNotes={() => setIsNotebookOpen(true)}
            onUpdateTeam={(updated) => setActiveTeamState(updated)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper text-ink selection:bg-accent-yellow selection:text-ink">
      <div>
        <Header
          team={activeTeam}
          onOpenPressCard={() => setIsPressCardOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onBackToHome={handleBackToHome}
          onLogoutTeam={handleLogoutTeam}
          onOpenTeacherModal={() => setIsAdminView(true)}
        />

        <main className="py-4">
          {activeModule ? (
            renderActiveGame()
          ) : (
            <Dashboard
              team={activeTeam}
              onSelectModule={handleSelectModule}
              onOpenPressCard={() => setIsPressCardOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onOpenInterview={() => setIsInterviewOpen(true)}
              onOpenPocketNotes={() => setIsNotebookOpen(true)}
              onStageAdvanced={handleStageAdvanced}
              onDisbandTeam={handleDisbandTeam}
            />
          )}
        </main>
      </div>

      <Footer />

      {/* Group Press Pass Modal */}
      {isPressCardOpen && (
        <PressCardModal
          team={activeTeam}
          onSaveTeam={handleSaveTeam}
          onDisbandTeam={handleDisbandTeam}
          onClose={() => setIsPressCardOpen(false)}
        />
      )}

      {/* Press Equipment & Strategy Shop Modal */}
      {isShopOpen && (
        <PressShopModal
          team={activeTeam}
          onUpdateTeam={(updated) => setActiveTeamState(updated)}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {/* Interactive Witness Interview Messenger Modal */}
      {isInterviewOpen && (
        <InterviewMessengerModal
          team={activeTeam}
          onClose={() => setIsInterviewOpen(false)}
          onOpenPocketNotes={() => {
            setIsInterviewOpen(false);
            setIsNotebookOpen(true);
          }}
          onUpdateTeam={(updated) => setActiveTeamState(updated)}
        />
      )}

      {/* Pocket Press Notebook Drawer */}
      {isNotebookOpen && (
        <PocketNotebookDrawer
          team={activeTeam}
          isOpen={isNotebookOpen}
          onClose={() => setIsNotebookOpen(false)}
          onOpenInterview={() => {
            setIsNotebookOpen(false);
            setIsInterviewOpen(true);
          }}
        />
      )}

      {/* Screen Freeze / Focus Mode Overlay ("Pena Diturunkan!") */}
      {freezeState.isFrozen && !isAdminView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass p-6 sm:p-10 rounded-3xl border border-accent-orange/40 max-w-lg w-full text-center space-y-4 shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-accent-orange/20 border border-accent-orange/40 text-accent-orange flex items-center justify-center mx-auto shadow-sm">
              <Pause className="w-8 h-8 text-accent-orange" />
            </div>
            <div className="neo-stamp bg-accent-orange/20 text-accent-orange border-accent-orange/30 text-xs font-semibold mx-auto">
              Mode Perhatian Guru Diaktifkan
            </div>
            <h2 className="font-display font-medium text-2xl sm:text-3xl text-ink">
              Pena Diturunkan!
            </h2>
            <p className="font-body text-xs sm:text-sm text-ink-2 leading-relaxed">
              {freezeState.reason || "Simak penjelasan dan arahan dari Guru Pengampu di depan kelas sekarang."}
            </p>
            <div className="pt-2">
              <span className="font-body text-xs text-ink-muted">
                Layar simulasi akan dibuka kembali secara otomatis setelah sesi penjelasan selesai.
              </span>
            </div>
            <div className="pt-2 border-t border-rule/50 flex justify-center">
              <button
                onClick={() => setIsAdminView(true)}
                className="text-[11px] font-body text-ink-muted hover:text-accent underline focus-visible:outline-2 focus-visible:outline-accent active:scale-95"
              >
                Guru Pengampu? Buka Meja Guru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
