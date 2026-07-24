export const marketingLinks = {
  communityCheckout: "https://lastlink.com/p/C9020FF58/checkout-payment/",
  manualCheckout: "https://lastlink.com/p/C7C86F42F/checkout-payment",
  mentorshipWhatsapp:
    "https://wa.me/5511977486383?text=Ol%C3%A1%20Marcelo%2C%20tenho%20interesse%20na%20Mentoria%20Individual%20MQM!",
  x: "https://x.com/mqmcrypto",
  youtube: "https://www.youtube.com/@mQmcrypto",
  instagram: "https://www.instagram.com/mqm_racional/",
};

export const assetPath = (name: string) => `/marketing/mqm/${name}`;

export type ProductKey = "community" | "manual" | "mentorship";

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
  manual: {
    slug: "manual",
    eyebrow: "Curso online",
    homeImage: "home-manual.png",
    homeAlt: "Manual do Exito - Criptoeducacao",
    accent: "green",
    heroTitle: "Manual do Exito Cripto",
    heroTitleHighlight: "Cripto",
    heroLead:
      "O Manual do Exito e o curso online para organizar sua base em cripto. A proposta e tirar voce do improviso e colocar os fundamentos em uma sequencia clara de estudo.",
    heroImage: "mqm-2.png",
    heroAlt: "Marcelo de Queiroz",
    ctaLabel: "Acessar o Manual",
    ctaHref: marketingLinks.manualCheckout,
    ctaType: "checkout",
    sections: {
      firstEyebrow: "Estrutura do curso",
      firstTitle: "Aulas organizadas por modulos.",
      cards: [
        {
          title: "Fundamentos",
          text: "Bitcoin, soberania financeira, risco, custodia e a diferenca entre estudar com clareza e seguir a manada.",
        },
        {
          title: "Autocustodia",
          text: "Chaves, carteiras, backups, seguranca operacional e os cuidados para nao depender cegamente de terceiros.",
        },
        {
          title: "Uso com responsabilidade",
          text: "Cartao crypto, P2P e DeFi estudados com foco em risco, decisao e protecao antes de qualquer execucao.",
        },
      ],
      secondEyebrow: "Para quem e",
      secondTitle: "Para quem quer estudar cripto em ordem.",
      secondLead:
        "O Manual do Exito e para quem quer sair da confusao, entender os fundamentos e ter uma trilha de estudo clara para tomar decisoes com mais consciencia.",
      bullets: [
        "Quem esta comecando e quer uma base organizada.",
        "Quem ja comprou cripto, mas ainda se sente inseguro.",
        "Quem quer entender autocustodia, P2P, cartao crypto e DeFi.",
        "Quem quer estudar no proprio ritmo, com conteudo online.",
      ],
      finalTitle: "Comece pelo Manual do Exito.",
      finalLead: "Organize sua base antes de tentar acelerar. Clareza vem antes de estrategia.",
    },
  },
  mentorship: {
    slug: "mentoria",
    eyebrow: "Mentoria Completa",
    homeImage: "home-mentoria.png",
    homeAlt: "Mentoria Completa MqM",
    accent: "cyan",
    heroTitle: "A experiencia completa com o MqM.",
    heroTitleHighlight: "MqM",
    heroLead:
      "A Mentoria Completa reune 1 ano de acesso ao Manual do Exito, 1 ano de acesso a Comunidade MQM e uma mentoria exclusiva personalizada com o MqM.",
    heroImage: "mqm.png",
    heroAlt: "Marcelo de Queiroz",
    ctaLabel: "Falar no WhatsApp",
    ctaHref: marketingLinks.mentorshipWhatsapp,
    ctaType: "whatsapp",
    sections: {
      firstEyebrow: "O que esta dentro",
      firstTitle: "Tudo em um acompanhamento mais proximo.",
      cards: [
        {
          title: "1 ano de Manual do Exito",
          text: "Acesso ao curso online organizado por modulos para construir a base em cripto com clareza.",
        },
        {
          title: "1 ano de Comunidade MQM",
          text: "Acesso a comunidade, lives exclusivas, grupo de WhatsApp, troca de ideias e network.",
        },
        {
          title: "Mentoria personalizada",
          text: "Acompanhamento exclusivo e individualizado com o MqM para olhar sua realidade, suas duvidas e seus proximos passos.",
        },
      ],
      secondEyebrow: "Para quem e",
      secondTitle: "Para quem quer direcao individualizada.",
      secondLead:
        "A Mentoria Completa e para quem quer unir estudo, comunidade e acompanhamento exclusivo em uma experiencia mais proxima com o MqM.",
      bullets: [
        "1 ano de acesso ao Manual do Exito.",
        "1 ano de acesso a Comunidade MQM.",
        "Mentoria exclusiva personalizada com o MqM.",
      ],
      finalTitle: "Fale direto com o MqM.",
      finalLead:
        "Clique para abrir uma conversa no WhatsApp e demonstrar interesse na Mentoria Completa.",
    },
  },
} as const;

export const walletPhases = [
  {
    phase: "FASE 1: ALOCAÇÃO INICIAL",
    total: "$78,267.58",
    today: "+$2,472.88 (+3.26%)",
    crypto: "$48,278.56",
    stable: "$29,989.02",
    caption:
      "Montagem estruturada das carteiras de Hold e Risco no fundo do poço, quando o mercado entrava em pânico (FUD).",
  },
  {
    phase: "FASE 2: VALORIZAÇÃO TÁTICA",
    total: "$87,722.70",
    today: "+$2,580.58 (+3.03%)",
    crypto: "$53,750.65",
    stable: "$33,972.05",
    caption:
      "Aproveitando a alta exponencial com ativos de forte fundamento, protegendo a carteira de Hold no longo prazo.",
  },
  {
    phase: "FASE 3: REALIZAÇÃO DE LUCROS",
    total: "$102,289.34",
    today: "+$1,920.86 (+1.91%)",
    crypto: "$58,311.86",
    stable: "$43,977.49",
    caption:
      "Realização ativa da carteira de Risco ao bater as metas estabelecidas, colocando lucros reais no bolso do investidor.",
  },
] as const;

export const manualModules = [
  {
    image: "module-1.png",
    title: "Modulo 1: Comece pelo Jeito Certo",
    meta: "6 aulas • 1h 24 min",
  },
  {
    image: "module-2.png",
    title: "Modulo 2: Metodologia M e Construcao da Bag",
    meta: "7 aulas • 39 min",
  },
  {
    image: "module-3.png",
    title: "Modulo 3: Ferramentas, Wallets e Primeiras Operacoes",
    meta: "10 aulas • 1h 56 min",
  },
  {
    image: "module-4.png",
    title: "Modulo 4: DeFi na Pratica",
    meta: "11 aulas • 2h 12 min",
    locked: true,
  },
  {
    image: "module-5.png",
    title: "Modulo 5: Leitura de Mercado e Dados On-chain",
    meta: "5 aulas • 34 min",
    locked: true,
  },
] as const;
