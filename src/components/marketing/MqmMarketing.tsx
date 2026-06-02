import type { CSSProperties } from "react";
import { assetPath, manualModules, marketingLinks, products } from "./content";
import type { ProductKey } from "./content";
import styles from "./MqmMarketing.module.css";

const localeOrPt = (locale: string) => (["pt", "en", "es"].includes(locale) ? locale : "pt");
const localizedPath = (locale: string, path: string) => `/${localeOrPt(locale)}${path}`;

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
        {productKey === "mentorship" ? (
          <ProductCta href={product.ctaHref} label={product.ctaLabel} type="whatsapp" centered />
        ) : (
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
        )}
      </div>
      <div className={styles.heroPhoto}>
        <img src={assetPath(product.heroImage)} alt={product.heroAlt} />
      </div>
    </section>
  );
}

function ManualModules() {
  const loop = [...manualModules, ...manualModules];

  return (
    <section className={styles.manualModules}>
      <div className={styles.sectionInner}>
        <p className={styles.miniKicker}>Por dentro do Manual</p>
        <h2 className={styles.sectionTitle}>5 modulos para estudar cripto em ordem.</h2>
        <p className={styles.sectionLead}>
          Uma visao rapida da trilha do curso. Os cards rolam automaticamente para mostrar como o
          Manual do Exito esta organizado.
        </p>
      </div>

      <div className={styles.modulesRail} aria-label="Modulos do Manual do Exito">
        <div className={styles.modulesTrack}>
          {loop.map((module, index) => (
            <article className={styles.moduleCard} aria-hidden={index >= manualModules.length} key={`${module.image}-${index}`}>
              <div className={styles.moduleImage}>
                <img src={assetPath(module.image)} alt={index < manualModules.length ? module.title : ""} />
                {"locked" in module && module.locked ? <span className={styles.moduleClock}>◷</span> : null}
              </div>
              <h3>{module.title}</h3>
              <p>{module.meta}</p>
            </article>
          ))}
        </div>
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
            X
          </a>
          <a href={marketingLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="MQM no YouTube">
            YT
          </a>
          <a href={marketingLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="MQM no Instagram">
            IG
          </a>
        </nav>
      </header>

      <section className={styles.productList} aria-label="Produtos MQM">
        {(["community", "manual", "mentorship"] as const).map((key) => {
          const product = products[key];
          return (
            <a
              className={styles.productCard}
              href={localizedPath(locale, `/${product.slug}`)}
              aria-label={`Abrir ${product.eyebrow}`}
              key={product.slug}
            >
              <img className={styles.homeCardImage} src={assetPath(product.homeImage)} alt={product.homeAlt} />
            </a>
          );
        })}
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

        {productKey === "manual" ? <ManualModules /> : null}

        <section className={[styles.sectionInner, styles.finalCta].join(" ")}>
          <h2 className={styles.sectionTitle}>{product.sections.finalTitle}</h2>
          <p className={styles.sectionLead}>{product.sections.finalLead}</p>
          <ProductCta
            href={product.ctaHref}
            label={productKey === "manual" ? "Acessar o Manual do Exito" : product.ctaLabel}
            type={product.ctaType === "whatsapp" ? "whatsapp" : "checkout"}
            centered
          />
        </section>
      </main>

      <footer className={styles.siteFooter}>© MQM</footer>
    </div>
  );
}
