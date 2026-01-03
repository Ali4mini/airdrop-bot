import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "./hooks/useTelegram";
import { Navigation } from "./components/Navigation";

// Import Pages
import { Home } from "./pages/Home";
import { Tasks } from "./pages/Tasks";
import { Friends } from "./pages/Friends";

function AppContent() {
  const { user, expand } = useTelegram();

  useEffect(() => {
    expand();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      {/* GLOBAL HEADER */}
      <div className="navbar bg-base-100 z-10 border-b border-gray-800 pb-safe-top pt-safe-top px-4 min-h-[64px]">
        <div className="flex-1">
          <div className="flex flex-col">
            <span className="text-xs opacity-50">Welcome</span>
            <span className="font-bold text-lg">{user?.first_name}</span>
          </div>
        </div>
        <div className="flex-none gap-2">
          <div className="badge badge-warning badge-outline">Level 1</div>
        </div>
      </div>

      {/* DYNAMIC CONTENT (Routes) */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </div>

      {/* BOTTOM NAVIGATION */}
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
