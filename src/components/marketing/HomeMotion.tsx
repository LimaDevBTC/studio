"use client";

import { useEffect } from "react";

/**
 * Entradas suaves da home (sem bibliotecas): marca `[data-reveal]` com data-in="1" ao entrar na tela
 * e liga a rolagem suave das âncoras. Sem JS, sem IntersectionObserver ou com prefers-reduced-motion,
 * nada é escondido e a rolagem fica no padrão do navegador.
 */
export function HomeMotion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.in = "1";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    root.dataset.motion = "on";
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => observer.observe(el));

    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";

    return () => {
      observer.disconnect();
      html.style.scrollBehavior = previous;
      delete root.dataset.motion;
    };
  }, [rootId]);

  return null;
}
