export const marketingLinks = {
  communityCheckout: "https://lastlink.com/p/C9020FF58/checkout-payment/",
  x: "https://x.com/mqmcrypto",
  youtube: "https://www.youtube.com/@mQmcrypto",
  instagram: "https://www.instagram.com/mqm_racional/",
};

export const assetPath = (name: string) => `/marketing/mqm/${name}`;

export type ProductKey = "community";

export const products = {
  community: {
    slug: "comunidade",
    eyebrow: "Comunidade MQM",
    homeImage: "home-community.png",
    homeAlt: "Comunidade MQM",
    accent: "orange",
    heroTitle: "O lugar para trocar ideias e evoluir em cripto com gente seria.",
    heroLead:
      "A Comunidade MQM e o espaco para quem quer conversar sobre cripto com mais profundidade, trocar experiencias, participar de lives exclusivas e construir network com pessoas que levam soberania financeira a serio.",
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
          text: "Encontros ao vivo para discutir mercado, seguranca, autocustodia, P2P, DeFi e os erros que muita gente comete por falta de clareza.",
        },
        {
          title: "Grupo de WhatsApp",
          text: "Um canal de conversa para trocar ideias, compartilhar experiencias, levantar duvidas e acompanhar discussoes importantes do ecossistema.",
        },
        {
          title: "Network cripto",
          text: "Conexao com pessoas que querem aprender, preservar patrimonio e agir com responsabilidade, sem promessa facil e sem ruido barato.",
        },
      ],
      secondEyebrow: "Para quem e",
      secondTitle: "Para quem nao quer caminhar sozinho.",
      secondLead:
        "A Comunidade MQM e para quem entende que cripto exige estudo constante, troca de visao e contato com pessoas que estao olhando para os mesmos riscos e oportunidades.",
      bullets: [
        "Quem quer participar de conversas mais maduras sobre cripto.",
        "Quem quer acompanhar lives e discussoes exclusivas.",
        "Quem quer trocar ideias sem depender de hype ou manada.",
        "Quem quer criar network com pessoas do mesmo mercado.",
      ],
      finalTitle: "Entre para a Comunidade MQM.",
      finalLead:
        "Lives, WhatsApp, troca de ideias e network para quem leva cripto com seriedade.",
    },
  },
} as const;
