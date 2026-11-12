"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Bitcoin, KeyRound, Layers, Users } from "lucide-react";
import { homeAbout } from "./content";
import { PixelCard } from "./PixelCard";
import styles from "./MqmHome.module.css";

const icons = { bitcoin: Bitcoin, key: KeyRound, layers: Layers, users: Users } as const;

/**
 * Os pilares como um caminho: uma trilha que se acende conforme a rolagem e vai
 * ligando cada etapa quando a luz chega nela. Sem JS ou com prefers-reduced-motion,
 * todas as etapas aparecem acesas e a trilha fica completa.
 */
export function PathSteps() {
  const rootRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      if (!rect.height) return;
      // A "luz" fica a 62% da altura da tela.
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.62 - rect.top) / rect.height));
      root.style.setProperty("--p", progress.toFixed(4));
      for (const step of steps) {
        const dot = step.firstElementChild?.getBoundingClientRect();
        const node = dot ? (dot.top + dot.height / 2 - rect.top) / rect.height : 0;
        step.dataset.on = progress >= node - 0.02 ? "1" : "0";
      }
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    root.dataset.path = "on";
    update();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.path;
    };
  }, []);

  return (
    <ol ref={rootRef} className={styles.path}>
      <li className={styles.pathRail} aria-hidden="true">
        <span className={styles.pathFill} />
        <span className={styles.pathHead} />
      </li>
      {homeAbout.pillars.map((pillar, i) => {
        const Icon = icons[pillar.icon];
        return (
          <li key={pillar.title} className={styles.pathStep} data-step style={{ "--n": i } as CSSProperties}>
            <span className={styles.pathNode} aria-hidden="true">
              0{i + 1}
            </span>
            <PixelCard className={styles.pillar} tilt={4}>
              <div className={styles.pillarTop}>
                <span className={styles.pillarIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <span className={styles.pillarStage}>{pillar.stage}</span>
              </div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarText}>{pillar.text}</p>
            </PixelCard>
          </li>
        );
      })}
    </ol>
  );
}
