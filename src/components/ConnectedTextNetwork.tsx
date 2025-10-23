import { useEffect, useRef } from "react";
import "../styles/ConnectedTextNetwork.css";

const ConnectedTextNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    console.log("Canvas:", cv.width, cv.height, ctx);
    console.log("window", window.innerWidth, window.innerHeight);

    // === Basic setup ===
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + "px";
      cv.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", fit);
    fit();

    // === Utility ===
    const TAU = Math.PI * 2;

    // === Node / Edge ===
    class Node {
      label: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      glow: boolean;
      anchor: { x: number; y: number };
      phase: number;
      mass: number;
      constructor(
        label: string,
        x: number,
        y: number,
        size = 28,
        glow = false
      ) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = size;
        this.glow = glow;
        this.anchor = { x, y };
        this.phase = Math.random() * 1000;
        this.mass = 1;
      }
      step(t: number, mx: number | null, my: number | null) {
        const k = 0.02;
        this.vx += (this.anchor.x - this.x) * k;
        this.vy += (this.anchor.y - this.y) * k;

        const w1 = 0.6,
          w2 = 0.27;
        const jx =
          Math.sin(t * w1 + this.phase) * 0.8 +
          Math.sin(t * w2 + this.phase * 0.7) * 0.6;
        const jy =
          Math.cos(t * w1 + this.phase) * 0.8 +
          Math.cos(t * w2 + this.phase * 0.7) * 0.6;
        this.vx += jx * 0.15;
        this.vy += jy * 0.15;

        if (mx != null && my != null) {
          const dx = this.x - mx;
          const dy = this.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 180 * 180 && d2 > 1) {
            const f = 16000 / d2;
            this.vx += dx * f * 0.0015;
            this.vy += dy * f * 0.0015;
          }
        }

        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = `${this.size}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        if (this.glow) {
          ctx.shadowColor = "rgba(255,255,255,0.9)";
          ctx.shadowBlur = 24;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
        ctx.fillText(this.label, this.x, this.y);
        ctx.restore();
      }
    }

    class Edge {
      a: Node;
      b: Node;
      thin: boolean;
      constructor(a: Node, b: Node, thin = false) {
        this.a = a;
        this.b = b;
        this.thin = thin;
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.strokeStyle = `rgba(255,255,255,${this.thin ? 0.18 : 0.35})`;
        ctx.lineWidth = this.thin ? 1 : 1.6;
        ctx.stroke();
        ctx.restore();
      }
    }

    // === Node positioning ===
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const cx = () => W() * 0.5;
    const cy = () => H() * 0.5;

    const nCenter = new Node("UX/UI", cx(), cy(), 80, true);
    const nDesign = new Node(
      "Design",
      cx() - W() * 0.22,
      cy() - H() * 0.18,
      64
    );
    const nContent = new Node(
      "Contents",
      cx() + W() * 0.16,
      cy() - H() * 0.06,
      64
    );
    const nTech = new Node(
      "Technology",
      cx() + W() * 0.06,
      cy() + H() * 0.22,
      64
    );

    function ringAround(
      hub: Node,
      count: number,
      radius: number,
      jitter = 0
    ): Node[] {
      const arr: Node[] = [];
      for (let i = 0; i < count; i++) {
        const a = (i / count) * TAU + (Math.random() * 0.8 - 0.4);
        const r = radius + (Math.random() * jitter - jitter * 0.5);
        const x = hub.anchor.x + Math.cos(a) * r;
        const y = hub.anchor.y + Math.sin(a) * r;
        arr.push(new Node("Interface", x, y, 18));
      }
      return arr;
    }

    const designSubs = ringAround(nDesign, 7, 130, 40);
    const contentSubs = ringAround(nContent, 8, 160, 50);
    const techSubs = ringAround(nTech, 6, 140, 40);

    const nodes = [
      nCenter,
      nDesign,
      nContent,
      nTech,
      ...designSubs,
      ...contentSubs,
      ...techSubs,
    ];
    const edges = [
      new Edge(nCenter, nDesign),
      new Edge(nCenter, nContent),
      new Edge(nCenter, nTech),
      ...designSubs.map((s) => new Edge(nDesign, s, true)),
      ...contentSubs.map((s) => new Edge(nContent, s, true)),
      ...techSubs.map((s) => new Edge(nTech, s, true)),
      new Edge(nDesign, nContent, true),
      new Edge(nContent, nTech, true),
      new Edge(nTech, nDesign, true),
    ];

    // === Mouse interaction ===
    const pointer = { x: null as number | null, y: null as number | null };
    const handleMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const handleLeave = () => {
      pointer.x = null;
      pointer.y = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);

    // === Loop ===
    let t = 0;
    let frameId: number;
    const step = () => {
      t += 0.016;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const g = ctx.createLinearGradient(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );
      g.addColorStop(0, "rgba(255,255,255,0.018)");
      g.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      nCenter.anchor = { x: cx(), y: cy() };
      nDesign.anchor = { x: cx() - W() * 0.22, y: cy() - H() * 0.18 };
      nContent.anchor = { x: cx() + W() * 0.16, y: cy() - H() * 0.06 };
      nTech.anchor = { x: cx() + W() * 0.06, y: cy() + H() * 0.22 };

      for (const n of nodes) n.step(t, pointer.x, pointer.y);
      for (const e of edges) e.draw();
      for (const n of nodes) n.draw();

      frameId = requestAnimationFrame(step);
    };
    step();

    // cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", fit);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-black absolute top-0 left-0"
    />
  );
};

export default ConnectedTextNetwork;
