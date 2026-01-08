import { useEffect, useRef } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  animate,
} from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  direction?: "up" | "down";
}

export const AnimatedCounter = ({ value }: AnimatedCounterProps) => {
  // 1. Create a MotionValue to hold the raw number
  // We use useSpring to interpolate smoothly between values
  const springValue = useSpring(value, {
    stiffness: 50, // How "stiff" the spring is (higher = faster snap)
    damping: 15, // How much friction (higher = less bouncy)
    mass: 1,
  });

  // 2. Format the number for display (e.g., 1,234,567)
  // We use a ref for the actual DOM element to avoid React re-renders
  const ref = useRef<HTMLSpanElement>(null);

  // 3. Sync the spring with the prop value
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // 4. Update the text content directly on every frame
  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        // Round down to avoid decimals
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return <span ref={ref} className="font-mono" />;
};
