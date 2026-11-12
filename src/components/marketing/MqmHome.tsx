import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, QrCode, Wallet } from "lucide-react";
import {
  assetPath,
  homeAbout,
  homeClosing,
  homeFooter,
  homeHero,
  homeOffers,
  homeP2p,
  homeStory,
  marketingLinks,
} from "./content";
import { HeroVideo } from "./HeroVideo";
import { HomeHeader } from "./HomeHeader";
import { HomeMotion } from "./HomeMotion";
import { PathSteps } from "./PathSteps";
import { PixelCard } from "./PixelCard";
import { InstagramIcon, XIcon, YouTubeIcon } from "./SocialIcons";
import styles from "./MqmHome.module.css";

const ROOT_ID = "mqm-home";

const localeOrPt = (locale: string) => (["pt", "en", "es"].includes(locale) ? locale : "pt");
const localizedPath = (locale: string, path: string) => `/${localeOrPt(locale)}${path}`;

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/** Bloco que entra suavemente ao aparecer na tela. */
function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div className={className} data-reveal style={{ "--i": index } as CSSProperties}>
      {children}
    </div>
  );
}

/** Trechos entre *asteriscos* viram destaque (degradê nos títulos, branco nos textos). */
function rich(text: string, className: string) {
  return text.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Título em linhas (cada item do array é uma linha). */
function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className={styles.line}>
          {rich(line, styles.grad)}{" "}
        </span>
      ))}
    </>
  );
}

/** Botão principal com brilho e seta em círculo. */
function CtaButton({
  href,
  label,
  icon,
  external = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      className={cx(styles.btn, styles.btnPrimary)}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span>{label}</span>
      <span className={styles.btnIcon}>{icon}</span>
    </a>
  );
}

/** Letreiro vazado (só contorno) que passa devagar ao fundo. Decorativo. */
function Backdrop({ reverse = false, band = false }: { reverse?: boolean; band?: boolean }) {
  return (
    <div className={cx(styles.backdrop, band && styles.backdropBand)} aria-hidden="true">
      <div className={cx(styles.backdropTrack, reverse && styles.backdropReverse)}>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={styles.backdropItem}>
            {homeHero.backdrop}
            <svg viewBox="0 0 100 100" className={styles.backdropStar}>
              <path d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="topo" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroGridBg} aria-hidden="true" />
      <div className={cx(styles.container, styles.heroGrid)}>
        <div className={styles.heroTop}>
          <p className={cx(styles.kicker, styles.fadeIn)}>{homeHero.eyebrow}</p>
          {/* O título saiu da tela (o vídeo abre a página), mas continua disponível para leitores de tela e buscadores. */}
          <h1 id="hero-title" className={styles.srOnly}>
            {homeHero.title.map((line) => line.replace(/\*/g, "")).join(" ")}
          </h1>
        </div>
        <div className={cx(styles.heroMedia, styles.fadeIn, styles.d2)}>
          <HeroVideo />
        </div>
        <div className={cx(styles.heroBottom, styles.fadeIn, styles.d3)}>
          <p className={styles.heroLead}>{rich(homeHero.lead, styles.strong)}</p>
          <div className={styles.heroCta}>
            <CtaButton href={homeHero.cta.href} label={homeHero.cta.label} icon={<ArrowDown aria-hidden="true" />} />
          </div>
        </div>
      </div>
      <Backdrop band />
    </section>
  );
}

function Story() {
  return (
    <section id={homeStory.id} className={styles.section} aria-labelledby="historia-title">
      <div className={styles.container}>
        <div className={styles.storyGrid}>
          <Reveal>
            <p className={styles.label}>{homeStory.eyebrow}</p>
            <h2 id="historia-title" className={styles.h2}>
              <Lines lines={homeStory.title} />
            </h2>
          </Reveal>
          <Reveal index={1}>
            <p className={styles.storyText}>{homeStory.text}</p>
          </Reveal>
        </div>
        <Reveal className={styles.storyClosing}>
          <span className={styles.rule} aria-hidden="true" />
          <p>
            <Lines lines={homeStory.closing} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id={homeAbout.id} className={styles.section} aria-labelledby="aprender-title">
      <Backdrop reverse />
      <div className={styles.container}>
        <Reveal className={styles.head}>
          <p className={styles.label}>{homeAbout.eyebrow}</p>
          <h2 id="aprender-title" className={styles.h2}>
            <Lines lines={homeAbout.title} />
          </h2>
          <p className={styles.lead}>{rich(homeAbout.lead, styles.strong)}</p>
        </Reveal>
        <PathSteps />
      </div>
    </section>
  );
}

function Offers({ locale }: { locale: string }) {
  const { community, mentorship } = homeOffers;
  return (
    <section id={homeOffers.id} className={styles.section} aria-labelledby="participar-title">
      <Backdrop />
      <div className={styles.container}>
        <Reveal className={styles.head}>
          <p className={styles.label}>{homeOffers.eyebrow}</p>
          <h2 id="participar-title" className={styles.h2}>
            <Lines lines={homeOffers.title} />
          </h2>
        </Reveal>
        <div className={styles.offers}>
          <div id={community.id} className={styles.anchor} data-reveal>
            <PixelCard className={cx(styles.offer, styles.offerMain, styles.ring)} wide tilt={3}>
              <p className={styles.offerTag}>{community.tag}</p>
              <h3 className={styles.offerTitle}>{community.title}</h3>
              <p className={styles.offerLead}>{community.lead}</p>
              <p className={styles.listLabel}>{community.benefitsLabel}</p>
              <ul className={styles.benefits}>
                {community.benefits.map((item) => (
                  <li key={item}>
                    <Check aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className={styles.offerCta}>
                <CtaButton
                  href={localizedPath(locale, community.ctaPath)}
                  label={community.ctaLabel}
                  icon={<ArrowRight aria-hidden="true" />}
                />
              </div>
            </PixelCard>
          </div>
          <div id={mentorship.id} className={styles.anchor} data-reveal style={{ "--i": 1 } as CSSProperties}>
            <PixelCard className={styles.offer} tilt={4}>
              <p className={cx(styles.offerTag, styles.offerTagQuiet)}>{mentorship.tag}</p>
              <h3 className={cx(styles.offerTitle, styles.offerTitleSmall)}>{mentorship.title}</h3>
              <p className={styles.offerLead}>{mentorship.lead}</p>
              <div className={styles.offerCta}>
                <a
                  className={cx(styles.btn, styles.btnOutline)}
                  href={mentorship.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mentorship.ctaLabel}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </PixelCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function P2p() {
  return (
    <section id={homeP2p.id} className={styles.sectionTight} aria-labelledby="p2p-title">
      <div className={styles.container}>
        <div data-reveal>
          <PixelCard className={cx(styles.p2p, styles.ring)} wide tilt={2}>
            <div className={styles.p2pGrid}>
              <div className={styles.p2pCopy}>
                <p className={styles.offerTag}>{homeP2p.eyebrow}</p>
                <h2 id="p2p-title" className={styles.p2pTitle}>
                  {rich(homeP2p.title, styles.grad)}
                </h2>
                <p className={styles.p2pText}>{homeP2p.text}</p>
                <div className={styles.p2pCta}>
                  <CtaButton
                    href={homeP2p.ctaHref}
                    label={homeP2p.ctaLabel}
                    icon={<ArrowUpRight aria-hidden="true" />}
                    external
                  />
                </div>
              </div>
              <div className={styles.flow} aria-hidden="true">
                <div className={styles.flowNode}>
                  <span className={styles.flowIcon}>
                    <QrCode />
                  </span>
                  <span className={styles.flowLabel}>{homeP2p.flowFrom}</span>
                </div>
                <div className={styles.flowTrack}>
                  <span className={styles.flowDot} />
                  <span className={styles.flowDot} />
                  <span className={styles.flowDot} />
                </div>
                <div className={cx(styles.flowNode, styles.flowNodeEnd)}>
                  <span className={styles.flowIcon}>
                    <Wallet />
                  </span>
                  <span className={styles.flowLabel}>{homeP2p.flowTo}</span>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </section>
  );
}

function Closing({ locale }: { locale: string }) {
  return (
    <section className={cx(styles.section, styles.closing)} aria-labelledby="final-title">
      <div className={styles.container}>
        <Reveal className={styles.closingCard}>
          <span className={styles.closingGlow} aria-hidden="true" />
          <div className={styles.closingBody}>
            <h2 id="final-title" className={styles.closingTitle}>
              <Lines lines={homeClosing.title} />
            </h2>
            <CtaButton
              href={localizedPath(locale, homeClosing.ctaPath)}
              label={homeClosing.ctaLabel}
              icon={<ArrowRight aria-hidden="true" />}
            />
          </div>
          <Image
            className={styles.closingPortrait}
            src={homeClosing.portrait}
            alt={homeClosing.portraitAlt}
            width={1000}
            height={1000}
            sizes="(min-width: 760px) 220px, 120px"
          />
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={cx(styles.container, styles.footerInner)}>
        <div className={styles.footerTop}>
          <Image
            className={styles.footerLogo}
            src={assetPath("mqm-logo-header.png")}
            alt="MQM Crypto"
            width={613}
            height={484}
            sizes="64px"
          />
          <nav className={styles.socials} aria-label="Redes sociais">
            <a href={marketingLinks.x} target="_blank" rel="noopener noreferrer" aria-label="MQM no X">
              <XIcon className={styles.socialIcon} />
            </a>
            <a href={marketingLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="MQM no YouTube">
              <YouTubeIcon className={styles.socialIcon} />
            </a>
            <a href={marketingLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="MQM no Instagram">
              <InstagramIcon className={styles.socialIcon} />
            </a>
          </nav>
        </div>
        <p className={styles.disclaimer}>{homeFooter.disclaimer}</p>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>{homeFooter.copyright}</p>
          {homeFooter.legal.length > 0 ? (
            <nav className={styles.legal} aria-label="Links legais">
              {homeFooter.legal.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function MqmHome({ locale }: { locale: string }) {
  return (
    <div id={ROOT_ID} className={styles.page}>
      <a className={styles.skip} href="#conteudo">
        Ir para o conteúdo
      </a>
      <HomeHeader />
      <main id="conteudo">
        <Hero />
        <Story />
        <About />
        <Offers locale={locale} />
        <P2p />
        <Closing locale={locale} />
      </main>
      <Footer />
      <HomeMotion rootId={ROOT_ID} />
    </div>
  );
}
