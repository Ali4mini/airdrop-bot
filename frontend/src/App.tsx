import { useEffect, useRef } from "react"; // Add useRef
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

// IMPORT STORES
import { useGameStore } from "./store/gameStore";
import { useUIStore } from "./store/uiStore";

function AppContent() {
  const { user, expand } = useTelegram();

  // 1. GLOBAL STATE LISTENERS
  const { levelName } = useGameStore();
  const { openLevelUp } = useUIStore();

  // 2. LEVEL UP DETECTION LOGIC
  // We keep track of the previous level name to detect changes
  const prevLevelRef = useRef<string>(levelName);

  useEffect(() => {
    // Logic: If the level name changes, and it's not the initial load...
    if (prevLevelRef.current && prevLevelRef.current !== levelName) {
      openLevelUp(levelName);
    }
    // Update the ref to the current level
    prevLevelRef.current = levelName;
  }, [levelName, openLevelUp]);

  useEffect(() => {
    expand();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-transparent text-white font-sans">
      <Background />
      <Notification />

      {/* 
         LevelUpModal is here, at the root level. 
         Since we trigger it from this component, it works everywhere. 
      */}
      <LevelUpModal />

      <Header />

      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends />} />
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
