import { useEffect, useRef } from "react";
import {
  createMouseState,
  createPills,
  drawFrame,
  lerpMouse,
  resizeCanvas,
  type CanvasDimensions,
  type MouseState,
  type Pill,
} from "./pillAnimation";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePillCanvas(enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pillsRef = useRef<Pill[]>([]);
  const mouseTargetRef = useRef<MouseState>(createMouseState());
  const mouseSmoothRef = useRef<MouseState>(createMouseState());
  const dimensionsRef = useRef<CanvasDimensions>({
    width: 0,
    height: 0,
    dpr: 1,
  });
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    reducedMotionRef.current = prefersReducedMotion();

    const syncSize = () => {
      dimensionsRef.current = resizeCanvas(canvas, ctx);
      if (pillsRef.current.length === 0) {
        pillsRef.current = createPills(
          dimensionsRef.current.width,
          dimensionsRef.current.height,
          dimensionsRef.current.dpr,
          reducedMotionRef.current,
        );
        const midX = dimensionsRef.current.width / 2;
        const midY = dimensionsRef.current.height / 2;
        mouseSmoothRef.current = { x: midX, y: midY, active: false };
      }
    };

    syncSize();

    const setMouseTarget = (x: number, y: number, active: boolean) => {
      mouseTargetRef.current = { x, y, active };
      if (!mouseSmoothRef.current.active && active) {
        mouseSmoothRef.current = { x, y, active: true };
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      setMouseTarget(event.clientX, event.clientY, true);
    };

    const onMouseLeave = () => {
      mouseTargetRef.current.active = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      setMouseTarget(touch.clientX, touch.clientY, true);
    };

    const onTouchEnd = () => {
      mouseTargetRef.current.active = false;
    };

    let frameId = 0;
    let lastTime = performance.now();
    let isVisible = document.visibilityState === "visible";

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) {
        lastTime = performance.now();
      }
    };

    window.addEventListener("resize", syncSize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    const animate = (time: number) => {
      frameId = window.requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedMs = time - lastTime;
      lastTime = time;

      if (elapsedMs <= 0) return;

      mouseSmoothRef.current = lerpMouse(
        mouseSmoothRef.current,
        mouseTargetRef.current,
        0.18,
      );

      drawFrame(
        ctx,
        pillsRef.current,
        mouseSmoothRef.current,
        dimensionsRef.current,
        elapsedMs,
      );
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      pillsRef.current = [];
    };
  }, [enabled]);

  return canvasRef;
}
