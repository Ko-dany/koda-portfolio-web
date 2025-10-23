import { useEffect, useRef } from "react";
import "../styles/MainDepthScene.css";

const MainDepthScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = `${window.innerWidth}px`;
      cv.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", fit);
    fit();

    const FOV = 600;
    const FOCUS_Z = 900;
    const MAX_BLUR = 18;
    const SPEED = 0.7;

    class Letter {
      char: string;
      x: number;
      y: number;
      z: number;
      baseSize: number;
      fill: string;
      baseAlpha: number;
      drift: number;
      zJitter: number;
      lockBlur: number | null; // ✅ boolean 대신 null 사용
      rx: number;
      ry: number;
      rSpeed: number;

      constructor({
        char,
        x,
        y,
        z,
        size,
        fill,
        alpha,
        drift = 0.15,
        zJitter = 40,
        lockBlur = null,
      }: {
        char: string;
        x: number;
        y: number;
        z: number;
        size: number;
        fill: string;
        alpha: number;
        drift?: number;
        zJitter?: number;
        lockBlur?: number | null;
      }) {
        this.char = char;
        this.x = x;
        this.y = y;
        this.z = z;
        this.baseSize = size;
        this.fill = fill;
        this.baseAlpha = alpha;
        this.drift = drift;
        this.zJitter = zJitter;
        this.lockBlur = lockBlur;
        this.rx = (Math.random() * 2 - 1) * Math.PI;
        this.ry = (Math.random() * 2 - 1) * Math.PI;
        this.rSpeed = Math.random() * 0.002 - 0.001;
      }

      step() {
        this.z -= SPEED;
        this.x += Math.sin((this.rx += 0.005)) * this.drift;
        this.y += Math.cos((this.ry += 0.006)) * this.drift * 0.6;
        if (this.z < -80) {
          this.z = FOCUS_Z + 500 + Math.random() * 600 + this.zJitter;
        }
      }

      draw() {
        const scale = FOV / (FOV + this.z);
        const sx = window.innerWidth / 2 + this.x * scale;
        const sy = window.innerHeight / 2 + this.y * scale;
        const px = this.baseSize * scale;

        const blur =
          this.lockBlur !== null
            ? this.lockBlur
            : Math.min(
                MAX_BLUR,
                (Math.abs(this.z - FOCUS_Z) / FOCUS_Z) * MAX_BLUR
              );

        const alpha = Math.max(
          0,
          Math.min(1, this.baseAlpha * (0.55 + 0.45 * scale))
        );

        ctx.save();
        ctx.translate(sx, sy);
        ctx.filter = `blur(${blur.toFixed(2)}px)`; // ✅ 이제 blur는 number 확정
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.fill;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${px.toFixed(
          1
        )}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
      }
    }

    const makeLetters = (): Letter[] => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const L: Letter[] = [];

      L.push(
        new Letter({
          char: "K",
          x: -W * 0.32,
          y: -H * 0.28,
          z: FOCUS_Z + 60,
          size: 320,
          fill: "rgb(90,90,90)",
          alpha: 0.95,
          drift: 0.12,
        }),
        new Letter({
          char: "O",
          x: W * 0.33,
          y: -H * 0.2,
          z: FOCUS_Z + 800,
          size: 260,
          fill: "rgb(190,190,190)",
          alpha: 0.75,
          drift: 0.1,
        }),
        new Letter({
          char: "D",
          x: -W * 0.03,
          y: H * 0.22,
          z: FOCUS_Z - 450,
          size: 820,
          fill: "rgb(160,160,160)",
          alpha: 0.85,
          drift: 0.18,
        }),
        new Letter({
          char: "A",
          x: W * 0.4,
          y: H * 0.22,
          z: FOCUS_Z + 40,
          size: 380,
          fill: "rgb(0,0,0)",
          alpha: 1.0,
          drift: 0.14,
        })
      );

      return L;
    };

    let letters = makeLetters();

    const frame = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const g = ctx.createRadialGradient(
        window.innerWidth / 2,
        window.innerHeight / 2,
        Math.min(window.innerWidth, window.innerHeight) * 0.15,
        window.innerWidth / 2,
        window.innerHeight / 2,
        Math.max(window.innerWidth, window.innerHeight) * 0.7
      );
      g.addColorStop(0, "rgba(0,0,0,0.02)");
      g.addColorStop(1, "rgba(0,0,0,0.00)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      letters.sort((a, b) => b.z - a.z);
      letters.forEach((l) => {
        l.step();
        l.draw();
      });

      requestAnimationFrame(frame);
    };

    frame();

    window.addEventListener("resize", () => (letters = makeLetters()));
    window.addEventListener("click", () => (letters = makeLetters()));

    return () => {
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block absolute top-0 left-0 bg-white"
    />
  );
};

export default MainDepthScene;
