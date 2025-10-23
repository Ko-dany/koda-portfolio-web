import { useEffect, useRef, useState } from "react";
import "./App.css";
import ConnectedTextNetwork from "./components/ConnectedTextNetwork";
import MainDepthScene from "./components/MainDepthScene";

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    { label: "Page 1", bg: "bg-blue-500" },
    { label: "Page 2", bg: "bg-green-500" },
    { label: "Page 3", bg: "bg-purple-500" },
    { label: "Page 4", bg: "bg-black" }, // ConnectedTextNetwork 전용 배경
    { label: "Page 5", bg: "bg-black" }, // MainDepthScene 전용 배경
  ];

  // 스크롤 이벤트
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      let nextPage = currentPage;
      if (e.deltaY > 0 && currentPage < pages.length - 1) nextPage++;
      if (e.deltaY < 0 && currentPage > 0) nextPage--;

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
        containerRef.current.scrollTo({
          top: nextPage * window.innerHeight,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentPage]);

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden">
      {/* Page 1~3 */}
      {pages.slice(0, 3).map((page, idx) => (
        <div
          key={idx}
          className={`h-screen w-screen flex items-center justify-center text-white text-4xl ${page.bg}`}
        >
          {page.label}
        </div>
      ))}

      {/* Page 4: ConnectedTextNetwork */}
      <div className="h-screen w-screen relative">
        <ConnectedTextNetwork />
      </div>

      {/* Page 5: MainDepthScene */}
      <div className="h-screen w-screen relative">
        <MainDepthScene />
      </div>
    </div>
  );
};

export default App;
