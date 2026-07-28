import type { CSSProperties } from "react";
import { assetPath, marketingLinks, products } from "./content";
import type { ProductKey } from "./content";
import styles from "./MqmMarketing.module.css";

const localeOrPt = (locale: string) => (["pt", "en", "es"].includes(locale) ? locale : "pt");
const localizedPath = (locale: string, path: string) => `/${localeOrPt(locale)}${path}`;

function XIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function MarketingHeader({ locale }: { locale: string }) {
  return (
    <nav className={styles.siteNav}>
      <div className={styles.siteNavInner}>
        <a className={styles.navBrand} href={localizedPath(locale, "/")} aria-label="Voltar para produtos">
          <img className={styles.navLogo} src={assetPath("mqm-logo-header.png")} alt="MQM Crypto" />
        </a>
      </div>
    </nav>
  );
}

function ProductCta({
  href,
  label,
  type,
  centered = false,
}: {
  href: string;
  label: string;
  type: "checkout" | "whatsapp";
  centered?: boolean;
}) {
  const className = [
    styles.btn,
    type === "whatsapp" ? styles.whatsappBtn : styles.checkoutBtn,
  ].join(" ");

  return (
    <div className={[styles.ctaRow, centered ? styles.centeredCta : ""].join(" ")}>
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {type === "whatsapp" ? "Falar no WhatsApp" : label}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function ProductHero({ locale, productKey }: { locale: string; productKey: ProductKey }) {
  const product = products[productKey];
  const highlighted = "heroTitleHighlight" in product ? product.heroTitleHighlight : undefined;
  const title =
    highlighted && product.heroTitle.includes(highlighted)
      ? product.heroTitle.split(highlighted)
      : null;

  return (
    <section className={styles.salesHero}>
      <div>
        <p className={styles.salesKicker}>{product.eyebrow}</p>
        <h1 className={styles.salesTitle}>
          {title ? (
            <>
              {title[0]}
              <span>{highlighted}</span>
              {title.slice(1).join(highlighted)}
            </>
          ) : (
            product.heroTitle
          )}
        </h1>
        <p className={styles.salesLead}>{product.heroLead}</p>
        <div className={styles.ctaRow}>
          <a
            className={[styles.btn, styles.checkoutBtn].join(" ")}
            href={product.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {product.ctaLabel}
            <span aria-hidden="true">↗</span>
          </a>
          <a className={[styles.btn, styles.secondaryBtn].join(" ")} href={localizedPath(locale, "/")}>
            Voltar aos produtos
          </a>
        </div>
      </div>
      <div className={styles.heroPhoto}>
        <img src={assetPath(product.heroImage)} alt={product.heroAlt} />
      </div>
    </section>
  );
}

export function MarketingHome({ locale }: { locale: string }) {
  return (
    <main className={[styles.marketingShell, styles.homeShell].join(" ")}>
      <header className={styles.hubHeader}>
        <img className={styles.avatar} src={assetPath("mqm.png")} alt="Marcelo de Queiroz" />
        <h1 className={styles.brandTitle}>MQM</h1>
        <p className={styles.handle}>@mqm_racional</p>
        <nav className={styles.socials} aria-label="Redes sociais">
          <a href={marketingLinks.x} target="_blank" rel="noopener noreferrer" aria-label="MQM no X">
            <XIcon />
          </a>
          <a href={marketingLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="MQM no YouTube">
            <YouTubeIcon />
          </a>
          <a href={marketingLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="MQM no Instagram">
            <InstagramIcon />
          </a>
        </nav>
      </header>

      <section className={styles.manifesto} aria-label="Manifesto MQM">
        <p className={styles.manifestoKicker}>O método MQM</p>
        <h2 className={styles.manifestoTitle}>
          Aqui você vai parar de perder dinheiro sendo{" "}
          <span className={styles.manifestoLoss}>liquidez do mercado</span> e vai começar a acumular{" "}
          <span className={styles.manifestoGain}>patrimônio de verdade!</span>
        </h2>
      </section>

      <p className={styles.pathsKicker}>Escolha seu caminho</p>
      <section className={styles.productList} aria-label="Produtos MQM">
        <a
          className={styles.productCard}
          href={localizedPath(locale, `/${products.community.slug}`)}
          aria-label={`Abrir ${products.community.eyebrow}`}
        >
          <img
            className={styles.homeCardImage}
            src={assetPath(products.community.homeImage)}
            alt={products.community.homeAlt}
          />
        </a>

        <a
          className={[styles.productCard, styles.productCardPoolparty].join(" ")}
          href={localizedPath(locale, "/poolparty")}
          aria-label="Abrir Pool Party"
        >
          <span className={styles.ppCardInner}>
            <span className={styles.ppCardGlow} aria-hidden="true" />
            <span className={styles.ppCardCopy}>
              <span className={styles.ppCardNew}>🔥 Novo</span>
              <span className={styles.ppCardTitle}>
                Pool<br />
                <span className={styles.ppPink}>Party</span>
              </span>
              <span className={styles.ppCardRule} aria-hidden="true" />
              <span className={styles.ppCardSub}>Pools de Liquidez · DeFi</span>
              <span className={styles.ppCardCta}>Saiba mais ›</span>
            </span>
            <img
              className={styles.ppCardMascot}
              src={assetPath("poolparty/poolparty.png")}
              alt=""
              aria-hidden="true"
            />
          </span>
        </a>

        <div className={[styles.productCard, styles.comingSoon].join(" ")} aria-label="A Virada - Em breve">
          <img className={styles.homeCardImage} src={assetPath("home-virada.jpg")} alt="A Virada" />
          <div className={styles.comingSoonOverlay}>
            <span className={styles.comingSoonPill}>Em breve</span>
            <span className={styles.comingSoonTitle}>A Virada</span>
          </div>
        </div>
      </section>

      <section className={styles.homeStory}>
        <p className={styles.miniKicker}>A historia do MQM</p>
        <h2>Bitcoin salvou a minha vida.</h2>
        <div className={styles.storyText}>
          <p>
            A historia comecou quando eu emprestei meu nome para um familiar proximo. A empresa
            quebrou. As dividas ficaram. Vieram processos, bloqueios judiciais, restricoes e anos
            tentando sobreviver dentro de um sistema que nao perdoa.
          </p>
          <p>O sistema financeiro tradicional simplesmente me apagou. Contas bloqueadas. Credito destruido. Liberdade limitada.</p>
          <p>
            Mas enquanto tudo ao meu redor era tomado, uma coisa permaneceu fora do alcance de
            qualquer banco, juiz ou instituicao:{" "}
            <strong>os bitcoins que eu mantinha em autocustodia, com as chaves nas minhas maos.</strong>
          </p>
          <p>
            Foi ali que eu entendi, na pratica, que Bitcoin nao e apenas investimento.{" "}
            <strong>E soberania.</strong>
          </p>
        </div>
      </section>

      <footer className={styles.homeFooter}>
        <p>© MqM - 2026 - TODOS OS DIREITOS RESERVADOS.</p>
      </footer>
    </main>
  );
}

export function MarketingProductPage({
  locale,
  productKey,
}: {
  locale: string;
  productKey: ProductKey;
}) {
  const product = products[productKey];
  const wrapperClasses = [
    styles.marketingShell,
    productKey === "community" ? styles.communityPage : "",
  ].join(" ");

  return (
    <div
      className={wrapperClasses}
      style={{ "--accent": `var(--${product.accent})` } as CSSProperties}
    >
      <MarketingHeader locale={locale} />
      <main>
        <ProductHero locale={locale} productKey={productKey} />

        <section className={styles.sectionBand}>
          <div className={styles.sectionInner}>
            <p className={styles.miniKicker}>{product.sections.firstEyebrow}</p>
            <h2 className={styles.sectionTitle}>{product.sections.firstTitle}</h2>
            <div className={styles.grid3}>
              {product.sections.cards.map((card) => (
                <article className={styles.infoCard} key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionBandDark}>
          <div className={[styles.sectionInner, styles.grid2].join(" ")}>
            <div>
              <p className={styles.miniKicker}>{product.sections.secondEyebrow}</p>
              <h2 className={styles.sectionTitle}>{product.sections.secondTitle}</h2>
              <p className={styles.sectionLead}>{product.sections.secondLead}</p>
            </div>
            <ul className={styles.bulletList}>
              {product.sections.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={[styles.sectionInner, styles.finalCta].join(" ")}>
          <h2 className={styles.sectionTitle}>{product.sections.finalTitle}</h2>
          <p className={styles.sectionLead}>{product.sections.finalLead}</p>
          <ProductCta
            href={product.ctaHref}
            label={product.ctaLabel}
            type={product.ctaType === "whatsapp" ? "whatsapp" : "checkout"}
            centered
          />
        </section>
      </main>

      <footer className={styles.siteFooter}>© MQM</footer>
    </div>
  );
}
