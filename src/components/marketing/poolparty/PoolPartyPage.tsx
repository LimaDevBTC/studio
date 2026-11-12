import {
  ArrowDown,
  ArrowLeftRight,
  Coins,
  Crosshair,
  Gem,
  Grip,
  MessageCircle,
  PieChart,
  Rocket,
  Search,
  Waves,
} from "lucide-react";
import { assetPath, marketingLinks } from "../content";
import mkStyles from "../MqmMarketing.module.css";
import styles from "./PoolParty.module.css";
import { CoverflowGallery, RoundCarousel } from "./PoolPartyCarousels";

const localeOrPt = (locale: string) => (["pt", "en", "es"].includes(locale) ? locale : "pt");

const POOL_WHATSAPP =
  "https://wa.me/5511977486383?text=Ol%C3%A1%20Marcelo%2C%20tenho%20interesse%20na%20Pool%20Party!";

const proofSlides = [
  { src: assetPath("poolparty/proof-1.jpg"), alt: "Pool SWF-SOL DLMM com PnL de 54,54%", title: "SWF–SOL · DLMM\n+54,54% PnL · $463 em 2h20" },
  { src: assetPath("poolparty/proof-2.jpg"), alt: "Pool Montoya-SOL com PnL de 18,84%", title: "Montoya–SOL\n+18,84% PnL · $143 em 7h50" },
  { src: assetPath("poolparty/proof-3.jpg"), alt: "Pool JAILMURAD-SOL DLMM com PnL de 17,83%", title: "JAILMURAD–SOL · DLMM\n+17,83% PnL · $118 em 1h37" },
  { src: assetPath("poolparty/proof-4.jpg"), alt: "Pool USDC/SOL com 2.873 dólares em taxas resgatadas", title: "USDC/SOL\n$2.873 em taxas resgatadas" },
  { src: assetPath("poolparty/proof-5.jpg"), alt: "Pool WETH/LEMON.FUN com 102 dólares em tarifas", title: "WETH/LEMON.FUN\n$102 em tarifas recebidas" },
  { src: assetPath("poolparty/proof-6.jpg"), alt: "Pools HYPE/USDC V3 com 981 dólares em taxas e APR de 216%", title: "HYPE/USDC · V3\n$981 em taxas · APR 216,02%" },
  { src: assetPath("poolparty/proof-7.jpg"), alt: "Pool WETH/PONS com 179 dólares em tarifas", title: "WETH/PONS\n$179 em tarifas recebidas" },
];

const feedbackImages = Array.from({ length: 16 }, (_, i) => ({
  src: assetPath(`poolparty/feedback-${String(i + 1).padStart(2, "0")}.jpg`),
  alt: `Feedback ${i + 1} de aluno da comunidade MQM`,
}));

const learnCards = [
  {
    className: "",
    num: "01",
    icon: <Search size={24} strokeWidth={2.4} aria-hidden="true" />,
    title: "Analisar oportunidades",
    text: "Como identificar as melhores oportunidades de pool: leitura de volume, taxas, TVL e comportamento do par antes de colocar um dólar em jogo.",
  },
  {
    className: "poolCardCyan",
    num: "02",
    icon: <Waves size={24} strokeWidth={2.4} aria-hidden="true" />,
    title: "Montar do jeito certo",
    text: "Como montar, quando montar e quando NÃO montar. Estratégia de faixas, escolha de par e o momento certo de entrar e de sair da piscina.",
  },
  {
    className: "poolCardYellow",
    num: "03",
    icon: <PieChart size={24} strokeWidth={2.4} aria-hidden="true" />,
    title: "Gestão de portfólio",
    text: "Todas as modalidades de pool de liquidez e a gestão do portfólio para maximizar ganhos, diminuir perdas e transformar taxa em renda recorrente.",
  },
];

const modalidades = [
  { icon: <Grip size={15} aria-hidden="true" />, label: "DLMM" },
  { icon: <Crosshair size={15} aria-hidden="true" />, label: "Concentrada · V3" },
  { icon: <ArrowLeftRight size={15} aria-hidden="true" />, label: "Full Range" },
  { icon: <Coins size={15} aria-hidden="true" />, label: "Stables" },
  { icon: <Gem size={15} aria-hidden="true" />, label: "Blue Chips" },
  { icon: <Rocket size={15} aria-hidden="true" />, label: "Memecoins" },
];

export function PoolPartyPage({ locale }: { locale: string }) {
  return (
    <div className={styles.poolShell}>
      <nav className={mkStyles.siteNav}>
        <div className={mkStyles.siteNavInner}>
          <a
            className={mkStyles.navBrand}
            href={`/${localeOrPt(locale)}`}
            aria-label="Voltar para produtos"
          >
            <img className={mkStyles.navLogo} src={assetPath("mqm-logo-header.png")} alt="MQM Crypto" />
          </a>
        </div>
      </nav>

      <main>
        <section className={styles.salesHero}>
          <div>
            <p className={styles.salesKicker}>Pool Party</p>
            <h1 className={styles.salesTitle}>
              Venha aprender a montar as melhores{" "}
              <span className={styles.poolHighlight}>pool de liquidez</span> com um{" "}dos
              pioneiros no{" "}Brasil e ganhar{" "}
              <span className={styles.poolFees}>muita taxa!</span>
            </h1>
            <p className={styles.salesLead}>
              Entenda como analisar as melhores oportunidades, como montar, quando montar e quando{" "}
              <strong>NÃO</strong> montar.
            </p>
            <div className={styles.ctaRow}>
              <a
                className={[styles.btn, styles.poolBtn].join(" ")}
                href={POOL_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={19} aria-hidden="true" /> Quero entrar na Pool Party
              </a>
              <a className={[styles.btn, styles.secondaryBtn].join(" ")} href="#provas">
                Ver pools de prova <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.poolHeroPhoto}>
            <span className={[styles.poolChip, styles.poolChipGain].join(" ")}>
              PnL <strong>+54,54%</strong>
            </span>
            <span className={styles.poolChip}>
              Fees <strong>$981,04</strong>
            </span>
            <span className={[styles.poolChip, styles.poolChipPink].join(" ")}>
              APR <strong>216,02%</strong>
            </span>
            <img
              src={assetPath("poolparty/poolparty.png")}
              alt="Pool Party - mascote pato do DeFi com boia rosa"
            />
          </div>
        </section>

        <section className={styles.sectionBand}>
          <div className={styles.sectionInner}>
            <p className={styles.miniKicker}>O que você vai aprender</p>
            <h2 className={styles.sectionTitle}>
              Aqui você vai aprender todas as modalidades de pool de liquidez e a gestão do seu
              portfólio para maximizar ganhos e diminuir perdas!
            </h2>
            <div className={styles.grid3}>
              {learnCards.map((card) => (
                <article
                  className={[styles.poolCard, card.className ? styles[card.className] : ""].join(" ")}
                  key={card.num}
                >
                  <span className={styles.poolCardNum} aria-hidden="true">{card.num}</span>
                  <span className={styles.poolCardIcon} aria-hidden="true">{card.icon}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
            <div className={styles.poolModalidades} aria-label="Modalidades de pool de liquidez">
              {modalidades.map((tag) => (
                <span className={styles.poolTag} key={tag.label}>
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={[styles.sectionBandDark, styles.poolProofs].join(" ")} id="provas">
          <div className={styles.sectionInner}>
            <p className={styles.miniKicker}>Proof of DeFi</p>
            <h2 className={styles.sectionTitle}>Pools de prova. Taxa de verdade.</h2>
            <p className={styles.sectionLead}>
              Prints reais de posições montadas com o método: pares, taxas coletadas e resultado no
              bolso.
            </p>
          </div>
          <CoverflowGallery slides={proofSlides} />
          <p className={styles.poolCarouselHint}>
            <span className={styles.hintDesktop}>Clique nos cards, nas setas ou use o teclado</span>
            <span className={styles.hintMobile}>Toque nas setas, nos cards ou arraste</span>
          </p>
        </section>

        <section className={[styles.sectionBand, styles.poolFeedbacks].join(" ")} id="feedbacks">
          <div className={styles.sectionInner}>
            <p className={styles.miniKicker}>Feedbacks</p>
            <h2 className={styles.sectionTitle}>Quem já está na festa.</h2>
            <p className={styles.sectionLead}>O que a comunidade diz sobre o método de pools do MQM.</p>
          </div>
          <RoundCarousel images={feedbackImages} />
          <p className={styles.poolCarouselHint}>Arraste para girar</p>
        </section>

        <section className={[styles.sectionInner, styles.finalCta].join(" ")}>
          <h2 className={styles.sectionTitle}>
            Garanta seu lugar na <span className={styles.poolHighlight}>Pool Party</span>.
          </h2>
          <p className={styles.sectionLead}>
            Aprenda com um dos pioneiros em pools de liquidez no Brasil e comece a ganhar taxa com
            estratégia, não com sorte.
          </p>
          <div className={[styles.ctaRow, styles.centeredCta].join(" ")}>
            <a
              className={[styles.btn, styles.poolBtn].join(" ")}
              href={POOL_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={19} aria-hidden="true" /> Quero entrar na Pool Party
            </a>
          </div>
        </section>
      </main>

      <footer className={mkStyles.siteFooter}>© MQM</footer>
    </div>
  );
}
