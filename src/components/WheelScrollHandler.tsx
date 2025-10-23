import { useEffect } from "react";

interface WheelScrollHandlerProps {
  onNext: () => void;
  onPrev: () => void;
}

const WheelScrollHandler = ({ onNext, onPrev }: WheelScrollHandlerProps) => {
  useEffect(() => {
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;
      isScrolling = true;

      if (e.deltaY > 0) onNext();
      else if (e.deltaY < 0) onPrev();

      setTimeout(() => (isScrolling = false), 800);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [onNext, onPrev]);

  return null;
};

export default WheelScrollHandler;
