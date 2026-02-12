import React, { useRef, useCallback } from "react";

interface CoinProps {
  onTap: () => void;
  tapValue: number;
  logoUrl?: string;
}

export const Coin = ({
  onTap,
  tapValue,
  logoUrl = "/assets/1770311369-removebg-preview.png",
}: CoinProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);

  const spawnParticle = useCallback(
    (x: number, y: number) => {
      if (!containerRef.current) return;
      const el = document.createElement("div");
      el.innerText = `+${tapValue}`;
      el.className = "floating-score";

      const randomX = (Math.random() - 0.5) * 60;
      el.style.left = `${x + randomX}px`;
      el.style.top = `${y}px`;

      containerRef.current.appendChild(el);
      setTimeout(() => el.remove(), 800);
    },
    [tapValue],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onTap();
    spawnParticle(x, y);

    if (coinRef.current) {
      const animations = coinRef.current.getAnimations();
      animations.forEach((anim) => anim.cancel());

      coinRef.current.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.92)" },
          { transform: "scale(1)" },
        ],
        {
          duration: 150,
          easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        },
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative p-6 w-full h-full flex items-center justify-center select-none"
      style={{ touchAction: "none" }}
    >
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-160px) scale(1.6); }
        }
        .floating-score {
          position: absolute;
          pointer-events: none;
          color: white;
          font-size: 2.2rem;
          font-weight: 900;
          z-index: 60;
          text-shadow: 0px 4px 8px rgba(0,0,0,0.5);
          animation: floatUp 0.8s ease-out forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* THE ACTUAL COIN */}
      <div
        ref={coinRef}
        onPointerDown={handlePointerDown}
        className="relative w-full h-full rounded-full cursor-pointer z-10 touch-none shadow-[0_12px_45px_rgba(0,0,0,0.6)]"
      >
        {/* Layer 1: The Dark Rim/Edge */}
        <div className="absolute inset-0 rounded-full bg-[#451a03]" />

        {/* Layer 2: The Gold Gradient Rim */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fcd34d] via-[#d97706] to-[#78350f] p-[5%]">
          {/* Layer 3: The Inner Rim shadow */}
          <div className="w-full h-full rounded-full bg-[#451a03] p-[2px] shadow-inner">
            {/* Layer 4: THE FACE (Texture Area) */}
            <div className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center bg-[#fbbf24]">
              {/* Face Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24] to-[#b45309]" />

              {/* Texture: Sunburst */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(from 0deg, transparent 0deg 10deg, #78350f 10deg 20deg)",
                }}
              />

              {/* Texture: Noise */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqonyQAwGbxvQlyo6CgAkFhbaQZ0+QwAAAABJRU5ErkJggg==')",
                }}
              />

              {/* THE LOGO */}
              <div className="relative w-[65%] h-[65%] z-20 flex items-center justify-center">
                <img
                  src={logoUrl}
                  className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                  style={{ filter: "brightness(1.1) contrast(1.1)" }}
                  draggable={false}
                  alt="Token Logo"
                />
              </div>

              {/* Surface Gloss/Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/20 pointer-events-none rounded-full" />
              <div className="absolute top-[10%] left-[10%] w-[25%] h-[15%] bg-white/30 blur-xl rounded-full -rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
