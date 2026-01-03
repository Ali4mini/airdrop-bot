import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "./hooks/useTelegram";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Background } from "./components/Background"; // <--- Import this

import { Home } from "./pages/Home";
import { Tasks } from "./pages/Tasks";
import { Friends } from "./pages/Friends";

function AppContent() {
  const { expand } = useTelegram();

  useEffect(() => {
    expand();
  }, []);

  return (
    // Note: We changed bg-black to bg-transparent here so the background shows through
    <div className="flex flex-col h-screen bg-transparent text-white font-sans">
      {/* 0. DYNAMIC BACKGROUND */}
      <Background />

      {/* 1. FIXED HEADER */}
      <Header />

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </div>

      {/* 3. FIXED BOTTOM NAV */}
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
