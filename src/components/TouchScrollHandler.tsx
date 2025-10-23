import { useEffect } from "react";

interface TouchScrollHandlerProps {
  onNext: () => void;
  onPrev: () => void;
}

const TouchScrollHandler = ({ onNext, onPrev }: TouchScrollHandlerProps) => {
  useEffect(() => {
    let startY = 0;
    let endY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      endY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (isScrolling) return;
      const diff = startY - endY;
      if (Math.abs(diff) < 50) return;

      isScrolling = true;
      if (diff > 0) onNext();
      else onPrev();

      setTimeout(() => (isScrolling = false), 800);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onNext, onPrev]);

  return null;
};

export default TouchScrollHandler;
