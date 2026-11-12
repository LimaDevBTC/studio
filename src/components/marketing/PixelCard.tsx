"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./MqmHome.module.css";

/**
 * PixelCard: card com uma grade de pixels laranja em canvas (implementação própria, sem dependências,
 * inspirada na interação do PixelCard da Originkit).
 *
 * - Repouso: textura estática e bem fraca (o conteúdo nunca depende da animação).
 * - Mouse: um foco de luz laranja acompanha o cursor dentro do card.
 * - Mouse/teclado: os pixels acendem em onda a partir do canto ao passar o mouse ou focar um link do card.
 * - Toque (sem hover): acendem enquanto o card está na tela.
 * - prefers-reduced-motion: só a textura estática.
 * - Fora da tela: o loop de animação é suspenso.
 * A máscara em CSS (.pixelCanvas) concentra os pixels no canto, longe do texto.
 */

const COLORS = ["#ea580c", "#f97316", "#fdba74", "#ff7a2f", "#9a3412"];

type Pixel = {
  x: number;
  y: number;
  delay: number;
  level: number;
  phase: number;
  speed: number;
  color: string;
};

export function PixelCard({
  children,
  className,
  gap = 8,
  size = 3,
  wide = false,
  tilt = 7,
}: {
  children: ReactNode;
  className?: string;
  /** Distância entre pixels, em px. */
  gap?: number;
  /** Tamanho máximo de cada pixel, em px. */
  size?: number;
  /** Máscara mais ampla (cards grandes). */
  wide?: boolean;
  /** Inclinação máxima em graus ao seguir o cursor (0 desliga). */
  tilt?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const noHover = window.matchMedia("(hover: none)");
    const REST = 0.3;

    let pixels: Pixel[] = [];
    let width = 0;
    let height = 0;
    let active = false;
    let visible = false;
    let activatedAt = 0;
    let frame = 0;
    let last = 0;

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      pixels = [];
      for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
          // A onda parte do canto superior direito, onde a máscara mostra os pixels.
          const distance = Math.hypot(width - x, y);
          pixels.push({
            x,
            y,
            delay: distance * 1.1 + Math.random() * 120,
            level: REST,
            phase: Math.random() * Math.PI * 2,
            speed: 0.0012 + Math.random() * 0.0016,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
      draw(performance.now());
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of pixels) {
        const lit = Math.max(0, p.level - REST) / (1 - REST);
        const shimmer = lit > 0 ? 0.72 + 0.28 * Math.sin(now * p.speed + p.phase) : 1;
        const s = size * (0.55 + 0.45 * lit) * shimmer;
        ctx.globalAlpha = (0.3 + 0.65 * lit) * shimmer;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      frame = 0;
      // ~30 fps é suficiente para o efeito e poupa bateria.
      if (now - last < 32) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(64, now - last || 32);
      last = now;

      let settled = !active;
      for (const p of pixels) {
        const target = active && now - activatedAt >= p.delay ? 1 : active ? p.level : REST;
        if (p.level < target) p.level = Math.min(target, p.level + dt / 420);
        else if (p.level > target) p.level = Math.max(target, p.level - dt / 520);
        if (p.level > REST) settled = false;
      }
      draw(now);
      if (visible && !settled) frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!frame && visible && !reduced.matches) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const setActive = (next: boolean) => {
      if (reduced.matches || next === active) return;
      active = next;
      if (next) activatedAt = performance.now();
      run();
    };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      host.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      host.style.setProperty("--my", `${event.clientY - rect.top}px`);
      // Inclinação 3D leve seguindo o cursor (só com mouse e sem reduced-motion).
      if (tilt && event.pointerType === "mouse" && !reduced.matches) {
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        host.style.setProperty("--ry", `${(px * tilt).toFixed(2)}deg`);
        host.style.setProperty("--rx", `${(-py * tilt).toFixed(2)}deg`);
      }
    };
    const onEnter = () => !noHover.matches && setActive(true);
    const onLeave = () => {
      host.style.setProperty("--rx", "0deg");
      host.style.setProperty("--ry", "0deg");
      if (!noHover.matches) setActive(false);
    };
    const onFocusIn = () => setActive(true);
    const onFocusOut = () => !noHover.matches && setActive(false);

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("focusin", onFocusIn);
    host.addEventListener("focusout", onFocusOut);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          if (noHover.matches) active = false;
          return;
        }
        if (noHover.matches) setActive(entry.intersectionRatio >= 0.45);
        run();
      },
      { threshold: [0, 0.45] },
    );
    io.observe(host);

    const ro = new ResizeObserver(build);
    ro.observe(host);

    const onMotionChange = () => {
      if (reduced.matches) {
        active = false;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        for (const p of pixels) p.level = REST;
        draw(0);
      }
    };
    reduced.addEventListener("change", onMotionChange);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      reduced.removeEventListener("change", onMotionChange);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("focusin", onFocusIn);
      host.removeEventListener("focusout", onFocusOut);
    };
  }, [gap, size, tilt]);

  return (
    <div ref={hostRef} className={[styles.pixelCard, className].filter(Boolean).join(" ")}>
      <span className={styles.pixelSpot} aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className={[styles.pixelCanvas, wide && styles.pixelCanvasWide].filter(Boolean).join(" ")}
        aria-hidden="true"
      />
      <div className={styles.pixelContent}>{children}</div>
    </div>
  );
}
