import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const DigitColumn = ({ digit }: { digit: number }) => {
  const y = useSpring(0, { stiffness: 400, damping: 40, mass: 1 });

  useEffect(() => {
    y.set(-digit * 10);
  }, [digit, y]);

  return (
    <div className="relative h-[1em] w-[0.6em] overflow-hidden inline-block flex-shrink-0">
      <motion.div
        style={{ y: useTransform(y, (val) => `${val}%`) }}
        className="absolute top-0 left-0 w-full flex flex-col items-center"
      >
        {NUMBERS.map((num) => (
          <div
            key={num}
            className="h-[1em] w-full flex items-center justify-center leading-none text-white"
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const ModernTicker = ({ value }: { value: number }) => {
  const digits = Math.floor(value).toLocaleString("en-US").split("");

  return (
    <div className="flex items-center font-mono font-black tracking-tight overflow-hidden leading-none">
      {digits.map((char, index) => {
        if (!/[0-9]/.test(char)) {
          return (
            <span
              key={index}
              className="relative inline-block text-white/50 w-[0.3em] text-center flex-shrink-0"
            >
              {char}
            </span>
          );
        }
        return <DigitColumn key={index} digit={parseInt(char, 10)} />;
      })}
    </div>
  );
};
