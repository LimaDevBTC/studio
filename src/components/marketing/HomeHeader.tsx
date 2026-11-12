"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { assetPath, homeNav } from "./content";
import styles from "./MqmHome.module.css";

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 960px)");
    const onDesktop = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={cx(styles.container, styles.headerInner)}>
        <a href="#topo" aria-label="MQM Crypto, início da página" className={styles.brand} onClick={close}>
          <Image
            className={styles.brandLogo}
            src={assetPath("mqm-logo-header.png")}
            alt="MQM Crypto"
            width={613}
            height={484}
            sizes="56px"
            priority
          />
        </a>

        <nav className={styles.navDesktop} aria-label="Seções da página">
          {homeNav.links.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <a className={cx(styles.btn, styles.btnPrimary, styles.btnSmall, styles.headerCta)} href={homeNav.cta.href}>
            {homeNav.cta.label}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuToggle}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span>{open ? "Fechar" : "Menu"}</span>
          </button>
        </div>
      </div>

      <nav id="menu-mobile" className={styles.navMobile} aria-label="Seções da página" hidden={!open}>
        <div className={cx(styles.container, styles.navMobileInner)}>
          {homeNav.links.map((link) => (
            <a key={link.href} href={link.href} className={styles.navMobileLink} onClick={close}>
              {link.label}
              <ArrowRight aria-hidden="true" />
            </a>
          ))}
          <a className={cx(styles.btn, styles.btnPrimary, styles.navMobileCta)} href={homeNav.cta.href} onClick={close}>
            {homeNav.cta.label}
          </a>
        </div>
      </nav>
    </header>
  );
}
