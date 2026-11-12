import type { CSSProperties } from "react";
import { assetPath, products } from "./content";
import type { ProductKey } from "./content";
import styles from "./MqmMarketing.module.css";

const localeOrPt = (locale: string) => (["pt", "en", "es"].includes(locale) ? locale : "pt");
const localizedPath = (locale: string, path: string) => `/${localeOrPt(locale)}${path}`;

function MarketingHeader({ locale }: { locale: string }) {
  return (
    <nav className={styles.siteNav}>
      <div className={styles.siteNavInner}>
        <a className={styles.navBrand} href={localizedPath(locale, "/")} aria-label="Voltar ao início">
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
            Voltar ao início
          </a>
        </div>
      </div>
      <div className={styles.heroPhoto}>
        <img src={assetPath(product.heroImage)} alt={product.heroAlt} />
      </div>
    </section>
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
