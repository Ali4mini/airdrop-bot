import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "./hooks/useTelegram";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Background } from "./components/Background";
import { Home } from "./pages/Home";
import { Tasks } from "./pages/Tasks";
import { Friends } from "./pages/Friends";
import { Notification } from "./components/Notifications";
import { LevelUpModal } from "./components/LevelUpModal";
import { Wallet } from "./pages/Wallet";

import { useGameStore } from "./store/gameStore";
import { useUIStore } from "./store/uiStore";

function AppContent() {
  const { user, expand } = useTelegram();
  const { levelName } = useGameStore();
  const { openLevelUp } = useUIStore();

  // --- LEVEL UP LOGIC FIX ---
  const prevLevelRef = useRef<string>(levelName);

  // This ref acts as a gate. We close the gate initially.
  // We only open it after we are sure the initial API sync is done.
  const isGameReady = useRef(false);

  useEffect(() => {
    // 1. If the level changed
    if (prevLevelRef.current !== levelName) {
      // 2. Only trigger modal if the game is "Ready"
      // This ignores the initial "Bronze -> Gold" jump when loading the app.
      if (isGameReady.current) {
        openLevelUp(levelName);
      }
    }

    // 3. Always update the ref
    prevLevelRef.current = levelName;
  }, [levelName, openLevelUp]);

  // 4. Set Game to Ready after a short delay
  // This gives the API time to load the user's real level without triggering the modal.
  useEffect(() => {
    const timer = setTimeout(() => {
      isGameReady.current = true;
      // Force sync the ref to the current level so we don't trigger
      // if the API loads exactly at the same moment the timer fires.
      prevLevelRef.current = levelName;
    }, 1000); // 1 second buffer is usually enough for the initial API response

    return () => clearTimeout(timer);
  }, []);
  // --------------------------

  useEffect(() => {
    expand();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-transparent text-white font-sans">
      <Background />
      <Notification />
      <LevelUpModal />
      <Header />

      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends userId={user.id} />} />
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
