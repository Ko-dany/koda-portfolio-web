import { useState } from "react";
import WheelScrollHandler from "./WheelScrollHandler";
import TouchScrollHandler from "./TouchScrollHandler";

interface FullPageWrapperProps {
  children: React.ReactNode[];
}

const FullPageWrapper = ({ children }: FullPageWrapperProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = children.length;

  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 0));

  return (
    <>
      {/* 이벤트 핸들러들 */}
      <WheelScrollHandler onNext={goNext} onPrev={goPrev} />
      <TouchScrollHandler onNext={goNext} onPrev={goPrev} />

      {/* 페이지 컨테이너 */}
      <div
        className="transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateY(-${currentPage * 100}vh)`,
          height: `${totalPages * 100}vh`,
        }}
      >
        {children.map((child, i) => (
          <div key={i} className="h-screen w-screen relative">
            {child}
          </div>
        ))}
      </div>
    </>
  );
};

export default FullPageWrapper;
