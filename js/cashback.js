window.COPA_CASHBACK_PROMOTION = {
  id: "cashback-brasil",
  type: "cashback",
  title: "Cashback da Copa",
  providerName: "Cashback Copa",
  startDate: "2026-06-13",
  endDate: "2026-07-19",
  periodText: "Toda a Copa",
  prizeLabel: "Cashback",
  prizeValue: "Até 30% em Pitacoins",
  playUrl: "#",
  details: {
    howItWorks: [
      {
        title: "Jogue nos jogos participantes",
        text: "Durante a Copa, jogue nos jogos de cassino participantes da promoção nos dias elegíveis."
      },
      {
        title: "Receba 20% ou 30% de volta",
        text: "Nos jogos do Brasil e no dia da final, o cashback é de 30%. Nos demais dias da Copa, o cashback é de 20%."
      },
      {
        title: "Use no dia seguinte",
        text: "As Pitacoins acumuladas são creditadas na sua carteira de bônus no dia seguinte para você continuar jogando no Cassino ou em Apostas Esportivas."
      }
    ],
    faq: [
      {
        question: "Como participar da promoção Cashback da Copa?",
        answer: "Para participar, jogue com dinheiro real nos jogos de cassino participantes da promoção durante a Copa. Nos jogos do Brasil e no dia da final, o cashback é de 30%; nos demais dias da Copa, é de 20%. A participação é automática."
      },
      {
        question: "Quais jogos participam da promoção?",
        answer: "Os jogos de cassino participantes podem mudar a cada dia promocional. Confira a lista na página da promoção para ver os jogos válidos no período."
      },
      {
        question: "O que são Pitacoins?",
        answer: "Pitacoins são valores promocionais que podem ser usados tanto no Cassino quanto em Apostas Esportivas."
      },
      {
        question: "Como o retorno é calculado?",
        answer: "O cashback é calculado com base nas perdas líquidas em jogadas feitas com dinheiro real nos jogos de cassino participantes. Se, ao final do dia promocional, suas perdas forem maiores que seus ganhos, você recebe 20% ou 30% desse valor de volta em Pitacoins, conforme a regra do dia."
      },
      {
        question: "Quando as Pitacoins são depositadas na minha conta?",
        answer: "O valor acumulado é creditado automaticamente na sua conta no dia seguinte. Para conferir seu saldo de Pitacoins, acesse a área \"Bônus\" no menu."
      },
      {
        question: "As Pitacoins podem ser usadas no Cassino ou em Apostas Esportivas?",
        answer: "Sim. Assim que forem liberadas como bônus, você pode usar as Pitacoins em qualquer jogo do Cassino ou em Apostas. Elas são usadas antes do saldo sacável ao fazer apostas."
      }
    ],
    termsSummary: "Cashback em Pitacoins válido durante a Copa nos jogos de cassino participantes da promoção. Nos jogos do Brasil e no dia da final, o cashback é de 30%; nos demais dias da Copa, é de 20%. Válido sobre perdas líquidas em jogadas com dinheiro real. Participação automática, sem valor mínimo. Crédito realizado no dia seguinte."
  }
};

window.COPA_CASHBACK_MATCHES = [
  {
    id: "brazil-morocco-group-01",
    espnEventId: "760419",
    date: "2026-06-13T22:00:00Z",
    stage: "Fase de Grupos - Jogo 01",
    opponent: {
      name: "Marrocos",
      flagSlug: "marrocos"
    }
  },
  {
    id: "brazil-haiti-group-02",
    espnEventId: "760444",
    date: "2026-06-20T00:30:00Z",
    stage: "Fase de Grupos - Jogo 02",
    opponent: {
      name: "Haiti",
      flagSlug: "haiti"
    }
  },
  {
    id: "brazil-scotland-group-03",
    espnEventId: "760465",
    date: "2026-06-24T22:00:00Z",
    stage: "Fase de Grupos - Jogo 03",
    opponent: {
      name: "Escócia",
      flagSlug: "escocia"
    }
  },
  {
    id: "world-cup-final",
    espnEventId: "760517",
    date: "2026-07-19T19:00:00Z",
    stage: "Final",
    isFinal: true,
    teams: [
      {
        abbreviation: "SFW1",
        name: "Vencedor semifinal 1",
        flagSlug: ""
      },
      {
        abbreviation: "SFW2",
        name: "Vencedor semifinal 2",
        flagSlug: ""
      }
    ]
  }
];

window.COPA_CASHBACK_COUNTRIES = {
  ALG: { name: "Argélia", flagSlug: "argelia" },
  ARG: { name: "Argentina", flagSlug: "argentina" },
  AUS: { name: "Austrália", flagSlug: "australia" },
  AUT: { name: "Áustria", flagSlug: "austria" },
  BEL: { name: "Bélgica", flagSlug: "belgica" },
  BRA: { name: "Brasil", flagSlug: "brasil" },
  CAN: { name: "Canadá", flagSlug: "canada" },
  CIV: { name: "Costa do Marfim", flagSlug: "costa-do-marfim" },
  COL: { name: "Colômbia", flagSlug: "colombia" },
  CRO: { name: "Croácia", flagSlug: "croacia" },
  CUW: { name: "Curaçao", flagSlug: "curacao" },
  ECU: { name: "Equador", flagSlug: "equador" },
  ENG: { name: "Inglaterra", flagSlug: "inglaterra" },
  FRA: { name: "França", flagSlug: "franca" },
  GER: { name: "Alemanha", flagSlug: "alemanha" },
  GHA: { name: "Gana", flagSlug: "gana" },
  HAI: { name: "Haiti", flagSlug: "haiti" },
  IRN: { name: "Irã", flagSlug: "ira" },
  JPN: { name: "Japão", flagSlug: "japao" },
  JOR: { name: "Jordânia", flagSlug: "jordania" },
  KOR: { name: "Coreia do Sul", flagSlug: "corea-do-sul" },
  MAR: { name: "Marrocos", flagSlug: "marrocos" },
  MEX: { name: "México", flagSlug: "mexico" },
  NED: { name: "Holanda", flagSlug: "holanda" },
  NOR: { name: "Noruega", flagSlug: "noruega" },
  NZL: { name: "Nova Zelândia", flagSlug: "nova-zelandia" },
  PAN: { name: "Panamá", flagSlug: "panama" },
  POR: { name: "Portugal", flagSlug: "portugal" },
  QAT: { name: "Qatar", flagSlug: "quatar" },
  KSA: { name: "Arábia Saudita", flagSlug: "arabia-saudita" },
  SCO: { name: "Escócia", flagSlug: "escocia" },
  SEN: { name: "Senegal", flagSlug: "senegal" },
  RSA: { name: "África do Sul", flagSlug: "africa-do-sul" },
  ESP: { name: "Espanha", flagSlug: "espanha" },
  SUI: { name: "Suíça", flagSlug: "suica" },
  SWE: { name: "Suécia", flagSlug: "suecia" },
  TUN: { name: "Tunísia", flagSlug: "tunisia" },
  URU: { name: "Uruguai", flagSlug: "uruguai" },
  USA: { name: "Estados Unidos", flagSlug: "estados-unidos" },
  UZB: { name: "Uzbequistão", flagSlug: "uzubequistao" }
};
