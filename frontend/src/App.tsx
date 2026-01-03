import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "./hooks/useTelegram";
import { Header } from "./components/Header"; // <--- Import Header
import { Navigation } from "./components/Navigation";

import { Home } from "./pages/Home";
import { Tasks } from "./pages/Tasks";
import { Friends } from "./pages/Friends";

function AppContent() {
  const { expand } = useTelegram();

  useEffect(() => {
    expand();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      {/* 1. FIXED HEADER */}
      <Header />

      {/* 2. SCROLLABLE CONTENT AREA */}
      {/* Added 'pt-24' (padding top) so content isn't hidden behind the fixed Header */}
      <div className="flex-1 overflow-y-auto pt-24 pb-24 px-4">
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
