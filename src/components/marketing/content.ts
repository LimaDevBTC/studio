export const marketingLinks = {
  communityCheckout: "https://lastlink.com/p/C9020FF58/checkout-payment/",
  mentoriaWhatsapp:
    "https://wa.me/5511977486383?text=Ol%C3%A1%20Marcelo%2C%20tenho%20interesse%20na%20Mentoria%20Personalizada!",
  mqmp2p: "https://mqmp2p.com",
  x: "https://x.com/mqmcrypto",
  youtube: "https://www.youtube.com/@mQmcrypto",
  instagram: "https://www.instagram.com/mqm_racional/",
};

export const assetPath = (name: string) => `/marketing/mqm/${name}`;

/**
 * VÍDEO DE APRESENTAÇÃO (primeira dobra da home)
 *
 * Enquanto `src` estiver vazio, a página mostra apenas a foto (`poster`), sem player e sem botão de play.
 * Para publicar o vídeo, preencha `src` com UMA das opções:
 *  - arquivo próprio: coloque em `public/marketing/mqm/` e use assetPath("historia.mp4") (ou URL direta .mp4/.webm);
 *  - YouTube ou Vimeo: cole a URL normal do vídeo (ex.: https://www.youtube.com/watch?v=ID).
 * `poster` é a imagem de capa (troque por um frame do vídeo quando houver).
 * `ratio` é a proporção da moldura no desktop ("16 / 9" para vídeo horizontal).
 * `srcMobile`, `posterMobile` e `ratioMobile` são a versão vertical, usada em telas estreitas (até 759px).
 * `captions` recebe legendas WebVTT (apenas para arquivo próprio; no YouTube/Vimeo a legenda vem da plataforma).
 * No modo "click" nada é baixado nem reproduzido antes do clique; no "autoplayMuted" o vídeo começa sozinho, sem som.
 */
export const heroVideo: {
  src: string;
  srcMobile: string;
  type: string;
  poster: string;
  posterMobile: string;
  posterAlt: string;
  ratio: string;
  ratioMobile: string;
  title: string;
  playLabel: string;
  mode: "click" | "autoplayMuted";
  unmuteLabel: string;
  captions: { src: string; srclang: string; label: string; default?: boolean }[];
} = {
  src: assetPath("mqm-institucional-16x9.mp4"),
  srcMobile: assetPath("mqm-institucional-9x16.mp4"),
  type: "video/mp4",
  poster: assetPath("mqm-institucional-16x9.jpg"),
  posterMobile: assetPath("mqm-institucional-9x16.jpg"),
  posterAlt: "Vídeo de apresentação do MQM",
  ratio: "16 / 9",
  ratioMobile: "9 / 16",
  title: "A história que deu origem ao MQM",
  playLabel: "Assistir à história",
  // "click": o vídeo só começa quando o visitante aperta o play.
  // "autoplayMuted": começa sozinho, sem som e em loop, com o aviso "Toque para ouvir" (só para arquivo próprio).
  mode: "autoplayMuted",
  unmuteLabel: "Ativar som",
  captions: [],
  // Exemplo de legenda: { src: assetPath("historia.pt-BR.vtt"), srclang: "pt-BR", label: "Português", default: true }
};

/**
 * TEXTOS E LINKS DA HOME (/pt)
 * Tudo o que aparece na página inicial é editado aqui.
 * Títulos são listas de linhas: cada item vira uma linha. Trechos entre *asteriscos* recebem o destaque
 * em degradê laranja (nos títulos) ou em branco (nos textos).
 */
export const homeNav = {
  links: [
    { label: "A história", href: "#historia" },
    { label: "O que você aprende", href: "#aprender" },
    { label: "Comunidade", href: "#comunidade" },
    { label: "Mentoria", href: "#mentoria" },
    { label: "MQMp2p", href: "#p2p" },
  ],
  cta: { label: "Conhecer a comunidade", href: "#comunidade" },
} as const;

export const homeHero = {
  eyebrow: "A história por trás do MQM",
  title: ["Bitcoin mudou a minha vida.", "*Conhecimento mudou a forma como eu penso.*"],
  lead: "Uma *história real* que deu origem ao MQM: educação para entender o mercado, cuidar da sua custódia e tomar decisões com mais consciência.",
  cta: { label: "Conheça o MQM", href: "#aprender" },
  /** Letreiro vazado que passa ao fundo (abaixo da primeira dobra e atrás dos títulos das seções). */
  backdrop: "MQM CRYPTO",
} as const;

export const homeStory = {
  id: "historia",
  eyebrow: "A história",
  title: ["O MQM nasceu de uma", "*experiência real.*"],
  text: "Depois de enfrentar dívidas, contas bloqueadas e dificuldades financeiras, o fundador do MQM encontrou no Bitcoin e na autocustódia uma nova perspectiva sobre dinheiro. Dessa experiência nasceu a vontade de estudar, compartilhar e ajudar outras pessoas a entender o que estão fazendo.",
  closing: ["Mais do que acompanhar o mercado.", "*Aprender a pensar por conta própria.*"],
} as const;

export const homeAbout = {
  id: "aprender",
  eyebrow: "O que é o MQM",
  title: ["Você não precisa de mais um palpite.", "*Precisa entender o que está fazendo.*"],
  lead: "O MQM reúne *educação e comunidade* para quem quer compreender Bitcoin e cripto, questionar narrativas e construir o próprio raciocínio.",
  /** Etapas do caminho (a ordem é a ordem da trilha). */
  pillars: [
    {
      icon: "bitcoin",
      stage: "Ponto de partida",
      title: "Entender o Bitcoin e as criptomoedas",
      text: "O que são, como funcionam e como usar no dia a dia, inclusive no cartão de crédito cripto. Um olhar que vai além da valorização.",
    },
    {
      icon: "key",
      stage: "Proteção",
      title: "Assumir a sua custódia",
      text: "Carteiras, backups e os cuidados que reduzem erros e riscos na hora de guardar o que é seu.",
    },
    {
      icon: "layers",
      stage: "Estratégia",
      title: "Organizar a sua exposição",
      text: "Como se expor ao mercado com critério: separar o que é para o longo prazo do que é risco e saber quanto colocar em cada estratégia.",
    },
    {
      icon: "users",
      stage: "Evolução",
      title: "Evoluir em comunidade",
      text: "Um espaço para estudar, trocar experiências e seguir aprendendo junto com outras pessoas.",
    },
  ],
} as const;

/**
 * OFERTAS. `community.ctaPath` é a página interna da comunidade (/pt/comunidade), que leva ao checkout
 * oficial (marketingLinks.communityCheckout). Liste em `benefits` apenas o que está confirmado.
 * Preço não é exibido na home de propósito.
 */
export const homeOffers = {
  id: "participar",
  eyebrow: "Escolha como participar",
  title: ["Seu *próximo passo* no MQM."],
  community: {
    id: "comunidade",
    tag: "Caminho principal",
    title: "Comunidade MQM",
    lead: "Aprendizado contínuo e troca entre participantes, para quem quer conversar sobre Bitcoin e cripto com mais profundidade.",
    benefitsLabel: "O que faz parte",
    benefits: [
      "Lives exclusivas",
      "Grupo de WhatsApp",
      "Discussões e troca de experiências",
      "Network com pessoas interessadas no mercado cripto",
    ],
    ctaLabel: "Conhecer a comunidade",
    ctaPath: "/comunidade",
  },
  mentorship: {
    id: "mentoria",
    tag: "Acompanhamento individual",
    title: "Mentoria Personalizada",
    lead: "Uma conversa mais próxima para trabalhar suas dúvidas e seus objetivos de aprendizado.",
    ctaLabel: "Conversar sobre a mentoria",
    ctaHref: marketingLinks.mentoriaWhatsapp,
  },
} as const;

export const homeP2p = {
  id: "p2p",
  eyebrow: "MQMp2p • Produto MQM",
  title: "Já sabe o que quer comprar? Conheça o *MQMp2p.*",
  /** Rótulos da animação PIX -> carteira. */
  flowFrom: "PIX",
  flowTo: "Sua carteira",
  text: "Compre cripto com PIX e receba direto na sua carteira.",
  ctaLabel: "Acessar MQMp2p",
  ctaHref: marketingLinks.mqmp2p,
} as const;

export const homeClosing = {
  title: ["Pare de seguir o barulho.", "*Comece a construir seu próprio raciocínio.*"],
  /** Foto pequena no fechamento da página. */
  portrait: assetPath("mqm-portrait.jpg"),
  portraitAlt: "MQM",
  ctaLabel: "Conhecer a comunidade",
  ctaPath: "/comunidade",
} as const;

export const homeFooter = {
  disclaimer: "Conteúdo educacional. Criptoativos envolvem riscos. Não há garantia de resultados.",
  copyright: "© MQM 2026. Todos os direitos reservados.",
  /** Links legais (Termos, Privacidade). Vazio = nada é exibido. Ex.: { label: "Termos de uso", href: "/pt/termos" } */
  legal: [] as { label: string; href: string }[],
};

export type ProductKey = "community";

export const products = {
  community: {
    slug: "comunidade",
    eyebrow: "Comunidade MQM",
    homeImage: "home-community.png",
    homeAlt: "Comunidade MQM",
    accent: "orange",
    heroTitle: "O lugar para trocar ideias e evoluir em cripto com gente séria.",
    heroLead:
      "A Comunidade MQM é o espaço para quem quer conversar sobre cripto com mais profundidade, trocar experiências, participar de lives exclusivas e construir network com pessoas que levam o mercado a sério.",
    heroImage: "community-hero.png",
    heroAlt: "Marcelo de Queiroz na Comunidade MQM",
    ctaLabel: "Entrar na Comunidade",
    ctaHref: marketingLinks.communityCheckout,
    ctaType: "checkout",
    sections: {
      firstEyebrow: "Dentro da comunidade",
      firstTitle: "Um ambiente para troca real.",
      cards: [
        {
          title: "Lives exclusivas",
          text: "Encontros ao vivo para discutir mercado, segurança, autocustódia, P2P e os erros que muita gente comete por falta de clareza.",
        },
        {
          title: "Grupo de WhatsApp",
          text: "Um canal de conversa para trocar ideias, compartilhar experiências, levantar dúvidas e acompanhar discussões importantes do ecossistema.",
        },
        {
          title: "Network cripto",
          text: "Conexão com pessoas que querem aprender e agir com responsabilidade, sem promessa fácil e sem ruído barato.",
        },
      ],
      secondEyebrow: "Para quem é",
      secondTitle: "Para quem não quer caminhar sozinho.",
      secondLead:
        "A Comunidade MQM é para quem entende que cripto exige estudo constante, troca de visão e contato com pessoas que estão olhando para os mesmos riscos e oportunidades.",
      bullets: [
        "Quem quer participar de conversas mais maduras sobre cripto.",
        "Quem quer acompanhar lives e discussões exclusivas.",
        "Quem quer trocar ideias sem depender de hype ou manada.",
        "Quem quer criar network com pessoas do mesmo mercado.",
      ],
      finalTitle: "Entre para a Comunidade MQM.",
      finalLead:
        "Lives, WhatsApp, troca de ideias e network para quem leva cripto com seriedade.",
    },
  },
} as const;
