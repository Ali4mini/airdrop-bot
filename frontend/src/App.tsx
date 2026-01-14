import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "./hooks/useTelegram";

// Components
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Background } from "./components/Background";
import { Notification } from "./components/Notifications";
import { LevelUpModal } from "./components/LevelUpModal";
import { PassiveModal } from "./components/PassiveModal";

// Pages
import { Home } from "./pages/Home";
import { Tasks } from "./pages/Tasks";
import { Friends } from "./pages/Friends";
import { Wallet } from "./pages/Wallet";

// Stores & API
import { useGameStore } from "./store/gameStore";
import { useUIStore } from "./store/uiStore";
import { api } from "./api/client";

function AppContent() {
  const { user, expand } = useTelegram();
  const { level, levelName, setGameState } = useGameStore();
  const { openLevelUp } = useUIStore();

  // --- PASSIVE EARN STATE ---
  const [passiveMod, setPassiveMod] = useState({ isOpen: false, earned: 0 });
  const hasSyncedPassive = useRef(false);

  // --- LEVEL UP LOGIC REFS ---
  // Track the highest level seen this session so we don't re-trigger for the same level
  const lastLevelRef = useRef<number>(level);
  // Gate to prevent modals firing during initial data load
  const isGameReady = useRef(false);

  // 1. TELEGRAM SETUP
  useEffect(() => {
    expand();
  }, [expand]);

  // 2. PASSIVE INCOME SYNC (Runs Once on Mount)
  useEffect(() => {
    // Only run if we have a user and haven't synced yet
    if (user?.id && !hasSyncedPassive.current) {
      hasSyncedPassive.current = true;

      api
        .syncPassive(user.id)
        .then((data) => {
          // Update the store with the new points/profit info
          setGameState(data);

          // If the user earned coins while offline, show the modal
          if (data.earned > 0) {
            setPassiveMod({ isOpen: true, earned: data.earned });
          }
        })
        .catch((e) => console.error("Passive Sync Error:", e));
    }
  }, [user?.id, setGameState]);

  // 3. SET GAME READY (Delays Level Up checks)
  useEffect(() => {
    // We give the app 1 second to fetch initial API data.
    // During this time, the LevelUp modal is disabled.
    const timer = setTimeout(() => {
      isGameReady.current = true;
      // Sync the ref to the current level (loaded from API)
      lastLevelRef.current = level;
    }, 1000);

    return () => clearTimeout(timer);
  }, [level]); // Dependency on level ensures we have the latest before 'Ready'

  // 4. LEVEL UP TRIGGER
  useEffect(() => {
    // Stop if game is still loading
    if (!isGameReady.current) return;

    // Trigger ONLY if the new level is higher than the last seen level
    if (level > lastLevelRef.current) {
      lastLevelRef.current = level; // Update ref first
      openLevelUp(levelName);
    }
  }, [level, levelName, openLevelUp]);

  const closePassiveModal = () => {
    setPassiveMod((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-white font-sans overflow-hidden">
      {/* GLOBAL LAYOUT ELEMENTS */}
      <Background />
      <Notification />

      {/* MODALS */}
      <LevelUpModal />
      <PassiveModal
        isOpen={passiveMod.isOpen}
        earned={passiveMod.earned}
        onClose={closePassiveModal}
      />

      <Header />

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 z-10 scrollbar-hide">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends userId={user?.id || 0} />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </div>

      <Navigation />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
