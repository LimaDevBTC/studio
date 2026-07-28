"use client";

/*
 * Ports fiéis (React) de dois componentes Originkit (originkit.dev):
 *  - Coverflow Gallery ("Smooth 3D Slideshow"): coverflow 3D com o card ativo em
 *    destaque e vizinhos inclinados em perspectiva; clique traz o card ao centro.
 *  - Round Carousel: cilindro 3D com rotação automática, arraste com momentum e
 *    cards de dupla face (face interna espelhada e escurecida).
 * Constantes, fórmulas e física idênticas ao código-fonte original.
 *
 * Divergências intencionais: responsividade (fit ao container, espaçamento
 * proporcional), swipe/toque com detecção de intenção (vertical = scroll da
 * página), setas de navegação, clamp de velocidade no flick, pausa no hover,
 * prefers-reduced-motion e acessibilidade extra.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "./PoolParty.module.css";

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
};

/* ============================== Coverflow Gallery ============================== */

const CF = {
  PERSPECTIVE: 1600,
  SCALE_STEP: 0.16,
  MAX_VISIBLE: 2,
  DEPTH: 240,
  EASE: "cubic-bezier(0.22, 1, 0.36, 1)",
};

export interface CoverflowSlide {
  src: string;
  alt: string;
  title: string;
}

export function CoverflowGallery({
  slides,
  cardWidth = 460,
  cardHeight = 529,
  radius = 3,
  tilt = 12,
  sideTilt = 8,
  gap = 8,
  opacity = 60,
  duration = 0.6,
}: {
  slides: CoverflowSlide[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tilt?: number;
  sideTilt?: number;
  gap?: number;
  opacity?: number;
  duration?: number;
}) {
  const n = slides.length;
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState({ w: cardWidth, h: cardHeight });
  const lockRef = useRef(false);
  const suppressClickRef = useRef(false);
  const swipeRef = useRef({ active: false, engaged: false, sx: 0, sy: 0 });

  const dur = reduced ? 0 : duration;
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;
  const transitionCss = `transform ${dur}s ${CF.EASE}, opacity ${dur}s ${CF.EASE}`;

  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, Math.max(50, dur * 1000));
  }, [dur]);

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current) return;
      lock();
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n, lock]
  );

  const handleCardClick = useCallback(
    (i: number) => {
      if (lockRef.current) return;
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      lock();
      setActive((a) => (i === a ? (a + 1) % n : i));
    },
    [n, lock]
  );

  useEffect(() => {
    const fit = () => {
      const w = rootRef.current?.clientWidth;
      if (!w) return;
      const target = Math.min(cardWidth, Math.max(250, w * 0.7));
      setSize({
        w: Math.round(target),
        h: Math.round(target * (cardHeight / cardWidth)),
      });
    };
    fit();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fit, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [cardWidth, cardHeight]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    swipeRef.current = { active: true, engaged: false, sx: e.clientX, sy: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = swipeRef.current;
    if (!s.active || s.engaged) return;
    const mx = Math.abs(e.clientX - s.sx);
    const my = Math.abs(e.clientY - s.sy);
    if (my > 14 && my > mx) {
      s.active = false;
      return;
    }
    // Limiar alto o bastante para o tremor natural de um toque não engatar.
    if (mx < 14 || mx <= my) return;
    s.engaged = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipeRef.current;
    if (!s.active) return;
    const wasEngaged = s.engaged;
    const dx = e.clientX - s.sx;
    swipeRef.current = { active: false, engaged: false, sx: 0, sy: 0 };
    if (wasEngaged && Math.abs(dx) >= 36) {
      // Só um swipe que navegou de fato suprime o clique fantasma.
      suppressClickRef.current = true;
      step(dx < 0 ? 1 : -1);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };
  const onPointerCancel = () => {
    swipeRef.current = { active: false, engaged: false, sx: 0, sy: 0 };
    suppressClickRef.current = false;
  };

  const effectiveRadius =
    (Math.max(0, Math.min(20, radius)) / 20) * (Math.min(size.w, size.h) / 2);
  const gapScale = size.w / cardWidth;

  return (
    <div
      ref={rootRef}
      className={styles.okCoverflow}
      style={{ perspective: `${CF.PERSPECTIVE}px`, touchAction: "pan-y" }}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className={styles.okCoverflowStage}
        style={{ width: size.w, height: size.h }}
      >
        {slides.map((slide, i) => {
          let rel = i - active;
          if (rel > n / 2) rel -= n;
          if (rel < -n / 2) rel += n;
          const ax = Math.abs(rel);
          const visible = ax <= CF.MAX_VISIBLE;
          const isActive = rel === 0;
          const sc = Math.max(0.4, 1 - ax * CF.SCALE_STEP);
          const tx = rel * (gap * 30) * gapScale;
          const tz = -ax * CF.DEPTH;
          const ry = -rel * tilt;
          const rz = rel * sideTilt;

          const cardStyle: CSSProperties = {
            width: size.w,
            height: size.h,
            borderRadius: effectiveRadius,
            transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
            transition: transitionCss,
            opacity: visible ? 1 : 0,
            cursor: isActive ? "default" : "pointer",
            pointerEvents: visible ? "auto" : "none",
          };

          return (
            <div
              key={i}
              className={styles.okCoverflowCard}
              style={cardStyle}
              onClick={() => handleCardClick(i)}
              aria-label={slide.title}
              aria-hidden={!visible}
            >
              <img src={slide.src} alt={slide.alt} draggable={false} loading={i === 0 ? "eager" : "lazy"} />
              <div className={styles.okCoverflowGrad} />
              <div className={styles.okCoverflowTitle}>
                <span>{slide.title}</span>
              </div>
              <div
                className={styles.okCoverflowDim}
                style={{
                  opacity: isActive ? 0 : dim,
                  transition: `opacity ${dur}s ${CF.EASE}`,
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={[styles.okCoverflowArrow, styles.okCoverflowArrowPrev].join(" ")}
        aria-label="Card anterior"
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        className={[styles.okCoverflowArrow, styles.okCoverflowArrowNext].join(" ")}
        aria-label="Próximo card"
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

/* =============================== Round Carousel =============================== */

export function RoundCarousel({
  images,
  imageWidth = 340,
  imageHeight = 340,
  spacing = 3,
  speed = 1,
  direction = "right",
  drag = true,
  sensitivity = 2,
  tilt = -7,
  perspective = 3000,
  cornerRadius = 22,
  innerDim = 3.5,
}: {
  images: { src: string; alt: string }[];
  imageWidth?: number;
  imageHeight?: number;
  spacing?: number;
  speed?: number;
  direction?: "right" | "left";
  drag?: boolean;
  sensitivity?: number;
  tilt?: number;
  perspective?: number;
  cornerRadius?: number;
  innerDim?: number;
}) {
  const count = images.length;
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [imageW, setImageW] = useState(imageWidth);

  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const hoveredRef = useRef(false);
  const dragRef = useRef({ active: false, engaged: false, sx: 0, sy: 0, x: 0 });

  const MAX_VEL = 240;
  const angle = 360 / count;
  const imageH = Math.round(imageW * (imageHeight / imageWidth));
  const factor = 1 + spacing * 0.15;
  const radius = (imageW * factor) / (2 * Math.tan(Math.PI / count));
  const degPerSec = reduced ? 0 : speed * 6 * (direction === "left" ? -1 : 1);

  useEffect(() => {
    const fit = () => {
      const w = rootRef.current?.clientWidth;
      if (!w) return;
      setImageW(Math.round(Math.min(imageWidth, Math.max(250, w * 0.45))));
    };
    fit();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fit, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [imageWidth]);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;
    };
    apply();

    let raf = 0;
    const draw = (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      if (!dragRef.current.engaged) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else if (!hoveredRef.current) {
          rotYRef.current += degPerSec * f;
        }
      }
      apply();
      raf = window.requestAnimationFrame(draw);
    };
    raf = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(raf);
  }, [radius, degPerSec, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!drag) return;
    dragRef.current = { active: true, engaged: false, sx: e.clientX, sy: e.clientY, x: e.clientX };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    if (!d.engaged) {
      const mx = Math.abs(e.clientX - d.sx);
      const my = Math.abs(e.clientY - d.sy);
      // Gesto vertical = scroll da página; não engatar o giro.
      if (my > 12 && my > mx) {
        d.active = false;
        return;
      }
      if (mx < 10 || mx <= my) return;
      d.engaged = true;
      d.x = e.clientX;
      velRef.current = 0;
      const root = rootRef.current;
      if (root && root.setPointerCapture) {
        try {
          root.setPointerCapture(e.pointerId);
        } catch {
          /* sem captura */
        }
      }
      if (root) root.style.cursor = "grabbing";
    }
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, dx * k * 60));
  };
  const endDrag = (e: React.PointerEvent) => {
    const root = rootRef.current;
    if (root && root.releasePointerCapture && e.pointerId != null) {
      try {
        root.releasePointerCapture(e.pointerId);
      } catch {
        /* já liberado */
      }
    }
    dragRef.current.active = false;
    dragRef.current.engaged = false;
    if (root) root.style.cursor = drag ? "grab" : "default";
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      velRef.current = 0;
      rotYRef.current += e.key === "ArrowRight" ? -angle : angle;
    }
  };

  const faceBase: CSSProperties = {
    borderRadius: cornerRadius,
  };

  return (
    <div
      ref={rootRef}
      className={styles.okRoundcarousel}
      style={{
        perspective: `${perspective}px`,
        cursor: drag ? "grab" : "default",
        touchAction: "pan-y",
      }}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <div className={styles.okRoundcarouselTilt} style={{ transform: `rotateX(${tilt}deg)` }}>
        <div
          ref={ringRef}
          className={styles.okRoundcarouselRing}
          style={{ width: imageW, height: imageH }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={styles.okRoundcarouselItem}
              role="img"
              aria-label={img.alt}
              style={{
                transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
              }}
            >
              <div
                className={styles.okRoundcarouselFace}
                style={{ ...faceBase, backgroundImage: `url(${img.src})` }}
              />
              <div
                className={[styles.okRoundcarouselFace, styles.okRoundcarouselBack].join(" ")}
                aria-hidden="true"
                style={{
                  ...faceBase,
                  backgroundImage: `url(${img.src})`,
                  filter: `brightness(${innerDim / 10})`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
