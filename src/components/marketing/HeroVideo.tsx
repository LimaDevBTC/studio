"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Play, VolumeX } from "lucide-react";
import { heroVideo } from "./content";
import styles from "./MqmHome.module.css";

/** Converte URL comum de YouTube/Vimeo em URL de embed; devolve null para arquivo próprio. */
function embedUrl(src: string): string | null {
  const youtube = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1&rel=0&cc_load_policy=1`;
  const vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

const NARROW = "(max-width: 759px)";

/**
 * Palco de mídia da primeira dobra, configurado em `heroVideo` (content.ts).
 * - Telas estreitas usam a versão vertical (`srcMobile`); as demais, a horizontal (`src`).
 * - `mode: "autoplayMuted"` (arquivo próprio): toca sozinho, sem som e em loop, com o botão "Ativar som";
 *   ao tocar, reinicia com som e controles. Com prefers-reduced-motion volta ao modo "click".
 * - `mode: "click"`: capa + botão; o player só é montado depois do clique.
 * A capa é fundo CSS da moldura, então não há salto de layout enquanto o vídeo carrega.
 */
export function HeroVideo() {
  const [playing, setPlaying] = useState(false);
  const [withSound, setWithSound] = useState(false);
  const [env, setEnv] = useState<{ narrow: boolean; reduced: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const narrow = window.matchMedia(NARROW);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnv({ narrow: narrow.matches, reduced: reduced.matches });
    update();
    narrow.addEventListener("change", update);
    return () => narrow.removeEventListener("change", update);
  }, []);

  const hasVideo = heroVideo.src.trim().length > 0;
  const embed = hasVideo ? embedUrl(heroVideo.src) : null;
  const src = env?.narrow && heroVideo.srcMobile ? heroVideo.srcMobile : heroVideo.src;
  const ambient = hasVideo && !embed && heroVideo.mode === "autoplayMuted" && env !== null && !env.reduced;

  const tracks = heroVideo.captions.map((track) => (
    <track
      key={track.src}
      kind="captions"
      src={track.src}
      srcLang={track.srclang}
      label={track.label}
      default={track.default}
    />
  ));

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.loop = false;
    video.currentTime = 0;
    void video.play();
    setWithSound(true);
  };

  let content = null;
  if (ambient) {
    content = (
      <>
        <video
          key={src}
          ref={videoRef}
          className={styles.mediaVideo}
          autoPlay
          muted
          loop
          playsInline
          controls={withSound}
          preload="auto"
          aria-label={heroVideo.title}
        >
          <source src={src} type={heroVideo.type} />
          {tracks}
        </video>
        {!withSound ? (
          <button type="button" className={styles.unmuteBtn} onClick={unmute}>
            <VolumeX aria-hidden="true" />
            <span>{heroVideo.unmuteLabel}</span>
          </button>
        ) : null}
      </>
    );
  } else if (playing && hasVideo) {
    content = embed ? (
      <iframe
        className={styles.mediaVideo}
        src={embed}
        title={heroVideo.title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    ) : (
      <video key={src} className={styles.mediaVideo} controls autoPlay playsInline preload="auto" aria-label={heroVideo.title}>
        <source src={src} type={heroVideo.type} />
        {tracks}
      </video>
    );
  } else if (hasVideo && env !== null) {
    content = (
      <>
        <span className={styles.mediaShade} aria-hidden="true" />
        <button
          type="button"
          className={styles.playBtn}
          onClick={() => setPlaying(true)}
          aria-label={`Reproduzir vídeo: ${heroVideo.title}`}
        >
          <Play aria-hidden="true" />
          <span>{heroVideo.playLabel}</span>
        </button>
      </>
    );
  }

  const frame = {
    "--ratio": heroVideo.ratio,
    "--ratio-mobile": heroVideo.ratioMobile || heroVideo.ratio,
    "--poster": `url("${heroVideo.poster}")`,
    "--poster-mobile": `url("${heroVideo.posterMobile || heroVideo.poster}")`,
  } as CSSProperties;

  return (
    <div className={styles.stage}>
      <span className={styles.stageGlow} aria-hidden="true" />
      <div className={styles.media} style={frame} role={content ? undefined : "img"} aria-label={content ? undefined : heroVideo.posterAlt}>
        {content}
        <span className={styles.corners} aria-hidden="true" />
      </div>
    </div>
  );
}
