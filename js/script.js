const promotions = Array.isArray(window.COPA_PROMOTIONS) ? window.COPA_PROMOTIONS : [];
const missions = Array.isArray(window.COPA_MISSIONS) ? window.COPA_MISSIONS : [];
const cashbackPromotion = window.COPA_CASHBACK_PROMOTION || null;
const fallbackCashbackMatches = Array.isArray(window.COPA_CASHBACK_MATCHES) ? window.COPA_CASHBACK_MATCHES : [];
const cashbackCountries = window.COPA_CASHBACK_COUNTRIES || {};
const featuredPromoSection = document.querySelector("[data-featured-promo-section]");
const featuredPromoRoot = document.querySelector("[data-featured-promo]");
const promosDescription = document.querySelector("[data-promos-description]");
const promosList = document.querySelector("[data-promos-list]");
const missionsSection = document.querySelector(".missions-section");
const missionsList = document.querySelector("[data-missions-list]");
const cashbackSection = document.querySelector("[data-cashback-section]");
const cashbackTitle = document.querySelector("[data-cashback-title]");
const cashbackHeadline = document.querySelector("[data-cashback-headline]");
const cashbackDescription = document.querySelector("[data-cashback-description]");
const cashbackPlayLink = document.querySelector("[data-cashback-play]");
const cashbackMatchRoot = document.querySelector("[data-cashback-match]");
const cashbackPreviousButton = document.querySelector("[data-cashback-prev]");
const cashbackNextButton = document.querySelector("[data-cashback-next]");
const promoDetailRoot = document.querySelector("[data-promo-detail]");
const promoDetailHeader = document.querySelector("[data-promo-detail-header]");
const promoDetailBody = document.querySelector("[data-promo-detail-body]");
const promoDetailFooter = document.querySelector("[data-promo-detail-footer]");
const themePreferenceQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
const saoPauloDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo"
});
const dayMs = 24 * 60 * 60 * 1000;
const cashbackBrazilTeam = {
  abbreviation: "BRA",
  name: "Brasil",
  flagSlug: "brasil"
};
const cashbackFallbackFlag = "images/iconPaises/fallback.png";
const cashbackScoreboardUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200";
const cashbackRefreshMs = 5 * 60 * 1000;
const cashbackCopy = {
  section: {
    title: "Cashback da Copa",
    headline: "Brasil ou final: cashback de 30%",
    description: "Nos dias de jogo do Brasil e no dia da final, jogue nos jogos de cassino participantes e receba 30% das perdas líquidas em Pitacoins."
  },
  default: {
    title: "Cashback de 30%",
    headline: "Quando o Brasil joga, seu cashback vem turbinado.",
    description: "Nos dias em que o Brasil entrar em campo, jogue nos jogos de cassino participantes e receba 30% das suas perdas líquidas em Pitacoins no dia seguinte.",
    featuredTitle: "É hoje: cashback de 30%",
    featuredDescription: "A Seleção joga hoje. Jogue nos jogos de cassino participantes e receba 30% das perdas líquidas em Pitacoins.",
    featuredMatchLabel: "Jogo do Brasil de hoje"
  },
  final: {
    title: "Final com cashback de 30%",
    headline: "A grande final também entra na promoção.",
    description: "No dia da grande final, jogue nos jogos de cassino participantes e receba 30% das suas perdas líquidas em Pitacoins no dia seguinte.",
    featuredTitle: "É hoje: cashback de 30%",
    featuredDescription: "A grande final é hoje. Jogue nos jogos de cassino participantes e receba 30% das perdas líquidas em Pitacoins.",
    featuredMatchLabel: "Jogo da final de hoje"
  }
};
const cashbackGroupTeams = {
  C: ["BRA", "MAR", "HAI", "SCO"],
  F: ["NED", "JPN", "SWE", "TUN"]
};
const cashbackRoundNumbersByEventId = {
  760486: { round: "R32", number: 1 },
  760487: { round: "R32", number: 2 },
  760489: { round: "R32", number: 3 },
  760488: { round: "R32", number: 4 },
  760490: { round: "R32", number: 5 },
  760492: { round: "R32", number: 6 },
  760491: { round: "R32", number: 7 },
  760495: { round: "R32", number: 8 },
  760493: { round: "R32", number: 9 },
  760494: { round: "R32", number: 10 },
  760497: { round: "R32", number: 11 },
  760496: { round: "R32", number: 12 },
  760498: { round: "R32", number: 13 },
  760499: { round: "R32", number: 14 },
  760500: { round: "R32", number: 15 },
  760501: { round: "R32", number: 16 },
  760502: { round: "R16", number: 1 },
  760503: { round: "R16", number: 2 },
  760504: { round: "R16", number: 3 },
  760505: { round: "R16", number: 4 },
  760506: { round: "R16", number: 5 },
  760507: { round: "R16", number: 6 },
  760509: { round: "R16", number: 7 },
  760508: { round: "R16", number: 8 },
  760510: { round: "QF", number: 1 },
  760511: { round: "QF", number: 2 },
  760512: { round: "QF", number: 3 },
  760513: { round: "QF", number: 4 },
  760514: { round: "SF", number: 1 },
  760515: { round: "SF", number: 2 }
};
const cashbackState = {
  matches: fallbackCashbackMatches.map(normalizeFallbackCashbackMatch),
  currentIndex: 0
};
let promotionCountdownTimeoutId;
let promoDetailCloseFocusTarget;
let activePromoDetailId;
let promoDetailScrollY = 0;
let promoDetailBodyInlineStyles;
let promoDetailDragState;

function getThemeParam() {
  const themeParam = new URLSearchParams(window.location.search).get("theme");

  return themeParam === "light" || themeParam === "dark" ? themeParam : null;
}

function getPreviewDateOverride() {
  const params = new URLSearchParams(window.location.search);
  const previewDateParam = params.get("previewDate") || params.get("cashbackDate");

  if (!previewDateParam) {
    return null;
  }

  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(previewDateParam)
    ? new Date(`${previewDateParam}T12:00:00-03:00`)
    : new Date(previewDateParam);

  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
}

const previewDateOverride = getPreviewDateOverride();
const previewDateStartTime = previewDateOverride ? Date.now() : 0;

function getCurrentDate() {
  return previewDateOverride
    ? new Date(previewDateOverride.getTime() + Date.now() - previewDateStartTime)
    : new Date();
}

function getPreferredTheme() {
  const themeParam = getThemeParam();

  if (themeParam) {
    return themeParam;
  }

  return themePreferenceQuery && themePreferenceQuery.matches ? "light" : "dark";
}

function syncThemeAssets(theme = getPreferredTheme()) {
  document.documentElement.dataset.theme = theme;

  document.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach((image) => {
    const nextSource = image.dataset[`themeSrc${theme === "light" ? "Light" : "Dark"}`];

    if (nextSource && image.getAttribute("src") !== nextSource) {
      image.setAttribute("src", nextSource);
    }
  });
}

syncThemeAssets();

if (themePreferenceQuery && !getThemeParam()) {
  if (themePreferenceQuery.addEventListener) {
    themePreferenceQuery.addEventListener("change", () => syncThemeAssets());
  } else if (themePreferenceQuery.addListener) {
    themePreferenceQuery.addListener(() => syncThemeAssets());
  }
}

function preventZoomGesture(event) {
  event.preventDefault();
}

document.addEventListener("gesturestart", preventZoomGesture, { passive: false });
document.addEventListener("gesturechange", preventZoomGesture, { passive: false });
document.addEventListener("gestureend", preventZoomGesture, { passive: false });
document.addEventListener("touchmove", (event) => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSaoPauloDateParts(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo"
  }).formatToParts(date).reduce((parts, part) => {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }

    return parts;
  }, {});
}

function getSaoPauloDateKey(date) {
  const parts = getSaoPauloDateParts(date);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatCashbackMatchDate(value) {
  const parts = getSaoPauloDateParts(new Date(value));

  return `${parts.day}/${parts.month}/${parts.year}, ${parts.hour}h${parts.minute}`;
}

function formatCashbackMatchToday(value) {
  const parts = getSaoPauloDateParts(new Date(value));

  return `Hoje, ${parts.hour}h${parts.minute}`;
}

function getFlagSource(flagSlug) {
  return flagSlug ? `images/iconPaises/${flagSlug}.png` : cashbackFallbackFlag;
}

function getCountryInfo(abbreviation, fallbackName) {
  const country = cashbackCountries[abbreviation];

  return {
    abbreviation,
    name: country?.name || fallbackName || abbreviation || "A definir",
    flagSlug: country?.flagSlug
  };
}

function getItemStart(item) {
  return new Date(`${item.startDate}T00:00:00-03:00`);
}

function getItemEnd(item) {
  return new Date(`${item.endDate}T23:59:59-03:00`);
}

function getItemStatus(item, now = getCurrentDate()) {
  const startDate = getItemStart(item);
  const endDate = getItemEnd(item);

  if (now < startDate) {
    return "upcoming";
  }

  if (now > endDate) {
    return "ended";
  }

  return "active";
}

function getPromotionStart(promotion) {
  return getItemStart(promotion);
}

function getPromotionEnd(promotion) {
  return getItemEnd(promotion);
}

function getPromotionStatus(promotion, now = getCurrentDate()) {
  return getItemStatus(promotion, now);
}

function formatDate(date) {
  return saoPauloDateFormatter.format(date);
}

function formatPromotionPeriod(promotion) {
  if (promotion.periodText) {
    return promotion.periodText;
  }

  return `${formatDate(getPromotionStart(promotion))} À ${formatDate(getPromotionEnd(promotion))}`;
}

function formatFinishedDate(promotion) {
  return `Dia ${formatDate(getPromotionEnd(promotion))}`;
}

function formatClockCountdown(timeLeft) {
  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}h:${String(minutes).padStart(2, "0")}m:${String(seconds).padStart(2, "0")}s`;
}

function formatRemainingTime(targetDate, now = getCurrentDate()) {
  const timeLeft = targetDate.getTime() - now.getTime();

  if (timeLeft <= dayMs) {
    return formatClockCountdown(timeLeft);
  }

  const daysLeft = Math.ceil(timeLeft / dayMs);

  return `${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`;
}

function getStatusViewModel(promotion, now = getCurrentDate()) {
  const status = getPromotionStatus(promotion, now);

  if (status === "upcoming") {
    return {
      status,
      label: "Começa em",
      value: formatRemainingTime(getPromotionStart(promotion), now),
      targetDate: getPromotionStart(promotion)
    };
  }

  if (status === "ended") {
    return {
      status,
      label: "Terminou",
      value: formatFinishedDate(promotion),
      targetDate: null
    };
  }

  return {
    status,
    label: "Termina em",
    value: formatRemainingTime(getPromotionEnd(promotion), now),
    targetDate: getPromotionEnd(promotion)
  };
}

function getTypeLabel(type) {
  return type === "prizeDrop" ? "Prize Drop" : "Torneio";
}

function getStatusCardClass(status) {
  if (status === "upcoming") {
    return "upcoming-promo-card--soon";
  }

  if (status === "ended") {
    return "upcoming-promo-card--ended";
  }

  return "upcoming-promo-card--active";
}

document.addEventListener("error", (event) => {
  const image = event.target;

  if (image instanceof HTMLImageElement && image.matches("[data-country-flag]")) {
    const fallbackSource = image.dataset.countryFallback;

    if (fallbackSource && image.getAttribute("src") !== fallbackSource) {
      image.setAttribute("src", fallbackSource);
      return;
    }

    image.hidden = true;
    return;
  }

  if (image instanceof HTMLImageElement && image.matches("[data-optional-game-image]")) {
    const gameTile = image.closest(".promo-detail__game-tile");

    if (gameTile) {
      const fallback = gameTile.querySelector(".promo-detail__game-fallback");

      image.remove();

      if (fallback) {
        fallback.hidden = false;
      }

      return;
    }

    const gamesContainer = image.closest(".featured-promo__games, .promo-detail__games");

    image.remove();

    if (gamesContainer && !gamesContainer.querySelector("img, .promo-detail__game-fallback:not([hidden])")) {
      const gamesSection = gamesContainer.closest(".promo-detail__section");

      if (gamesSection) {
        gamesSection.remove();
      } else {
        gamesContainer.remove();
      }
    }
  }
}, true);

function getPromotionDisplayPriority(promotion) {
  const priority = Number(promotion.displayPriority);

  return Number.isFinite(priority) ? priority : Number.POSITIVE_INFINITY;
}

function getPrimaryButton(promotion, status, classPrefix) {
  const className = `${classPrefix}__button`;

  if (status === "active") {
    if (promotion.playUrl) {
      return `<a class="${className} ${className}--primary" href="${escapeHtml(promotion.playUrl)}">Jogar Agora</a>`;
    }

    return `<span class="${className} ${className}--primary" aria-disabled="true">Jogar Agora</span>`;
  }

  if (status === "upcoming") {
    return `<span class="${className} ${className}--soon" aria-disabled="true">Em Breve</span>`;
  }

  return `<span class="${className} ${className}--ended" aria-disabled="true">Finalizada</span>`;
}

function hasPromotionDetails(promotion) {
  const details = promotion && promotion.details;

  if (!details) {
    return false;
  }

  return Array.isArray(details.howItWorks) || Array.isArray(details.faq) || Boolean(details.termsSummary);
}

function getPromotionById(promotionId) {
  if (cashbackPromotion && cashbackPromotion.id === promotionId) {
    return cashbackPromotion;
  }

  return promotions.find((currentPromotion) => currentPromotion.id === promotionId);
}

function getSecondaryButton(promotion, classPrefix) {
  const className = `${classPrefix}__button ${classPrefix}__button--secondary`;

  if (hasPromotionDetails(promotion)) {
    return `<button class="${className}" type="button" data-promo-detail-id="${escapeHtml(promotion.id)}">Saiba Mais</button>`;
  }

  if (!promotion.rulesUrl) {
    return "";
  }

  return `<a class="${className}" href="${escapeHtml(promotion.rulesUrl)}">Saiba Mais</a>`;
}

function getGameDisplayMode(promotion) {
  if (promotion.gameDisplay === "spotlight") {
    return "spotlight";
  }

  const games = Array.isArray(promotion.gameImages) ? promotion.gameImages : [];

  return games.length === 1 ? "spotlight" : "carousel";
}

function getMissionButton(mission, status) {
  const className = "mission-card__button";

  if (status === "active") {
    if (mission.playUrl) {
      return `<a class="${className} ${className}--primary" href="${escapeHtml(mission.playUrl)}">Acessar</a>`;
    }

    return `<span class="${className} ${className}--primary" aria-disabled="true">Acessar</span>`;
  }

  if (status === "upcoming") {
    return `<span class="${className} ${className}--soon" aria-disabled="true">Em Breve</span>`;
  }

  return `<span class="${className} ${className}--ended" aria-disabled="true">Finalizada</span>`;
}

function getFeaturedPromotion(now = getCurrentDate()) {
  const tournaments = promotions
    .filter((promotion) => promotion.type === "tournament" && promotion.neverFeatured !== true)
    .sort((first, second) => {
      const firstPriority = getPromotionDisplayPriority(first);
      const secondPriority = getPromotionDisplayPriority(second);

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      return getPromotionStart(first) - getPromotionStart(second);
    });
  const forcedTournament = tournaments.find((promotion) => promotion.forceFeatured === true);

  if (forcedTournament) {
    return forcedTournament;
  }

  const activeTournament = tournaments.find((promotion) => getPromotionStatus(promotion, now) === "active");

  if (activeTournament) {
    return activeTournament;
  }

  return tournaments.find((promotion) => getPromotionStatus(promotion, now) === "upcoming") || tournaments[tournaments.length - 1];
}

function getSortedMissions(now = getCurrentDate()) {
  const statusOrder = {
    active: 0,
    upcoming: 1,
    ended: 2
  };

  return missions
    .map((mission) => ({
      mission,
      status: getItemStatus(mission, now)
    }))
    .sort((first, second) => {
      if (statusOrder[first.status] !== statusOrder[second.status]) {
        return statusOrder[first.status] - statusOrder[second.status];
      }

      if (first.status === "ended") {
        return getItemEnd(first.mission) - getItemEnd(second.mission);
      }

      return getItemStart(first.mission) - getItemStart(second.mission);
    })
    .map(({ mission }) => mission);
}

function getSortedPromotions(featuredPromotion, now = getCurrentDate()) {
  return promotions
    .filter((promotion) => !featuredPromotion || promotion.id !== featuredPromotion.id)
    .map((promotion) => ({
      promotion,
      status: getPromotionStatus(promotion, now)
    }))
    .sort((first, second) => {
      const firstEnded = first.status === "ended";
      const secondEnded = second.status === "ended";

      if (firstEnded !== secondEnded) {
        return firstEnded ? 1 : -1;
      }

      if (!firstEnded && !secondEnded) {
        const startDelta = getPromotionStart(first.promotion) - getPromotionStart(second.promotion);

        if (startDelta !== 0) {
          return startDelta;
        }
      }

      if (firstEnded && secondEnded) {
        const endDelta = getPromotionEnd(first.promotion) - getPromotionEnd(second.promotion);

        if (endDelta !== 0) {
          return endDelta;
        }
      }

      const firstPriority = getPromotionDisplayPriority(first.promotion);
      const secondPriority = getPromotionDisplayPriority(second.promotion);

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      return getPromotionStart(first.promotion) - getPromotionStart(second.promotion);
    })
    .map(({ promotion }) => promotion);
}

function normalizeFallbackCashbackMatch(match) {
  const teams = Array.isArray(match.teams) && match.teams.length >= 2
    ? match.teams
    : [
        cashbackBrazilTeam,
        {
          abbreviation: match.opponent?.abbreviation || "",
          name: match.opponent?.name || "A definir",
          flagSlug: match.opponent?.flagSlug
        }
      ];

  return {
    id: match.id,
    espnEventId: match.espnEventId,
    date: match.date,
    stage: match.stage,
    isFinal: match.isFinal === true || String(match.stage || "").trim().toLowerCase() === "final",
    teams,
    brazil: teams[0],
    opponent: teams[1],
    source: "fallback"
  };
}

function isBrazilTeam(team) {
  return team?.abbreviation === "BRA" || team?.name === "Brasil" || team?.displayName === "Brazil";
}

function isCashbackFinalEvent(event) {
  return event?.season?.slug === "final" || getCashbackStageLabel(event) === "Final";
}

function isCashbackFinalMatch(match) {
  return match?.isFinal === true || String(match?.stage || "").trim().toLowerCase() === "final";
}

function getCashbackCopy(match) {
  return isCashbackFinalMatch(match) ? cashbackCopy.final : cashbackCopy.default;
}

function updateCashbackSectionCopy() {
  const copy = cashbackCopy.section;

  if (cashbackTitle) {
    cashbackTitle.textContent = copy.title;
  }

  if (cashbackHeadline) {
    cashbackHeadline.textContent = copy.headline;
  }

  if (cashbackDescription) {
    cashbackDescription.textContent = copy.description;
  }

  if (cashbackPlayLink && cashbackPromotion?.playUrl) {
    cashbackPlayLink.setAttribute("href", cashbackPromotion.playUrl);
  }
}

function getCashbackStageLabel(event) {
  const eventId = String(event.id);
  const fallbackMatch = fallbackCashbackMatches.find((match) => match.espnEventId === eventId);

  if (fallbackMatch?.stage) {
    return fallbackMatch.stage;
  }

  const slug = event.season?.slug;

  if (slug === "round-of-32") {
    return "Mata-mata - 16 avos";
  }

  if (slug === "round-of-16") {
    return "Oitavas de Final";
  }

  if (slug === "quarterfinals") {
    return "Quartas de Final";
  }

  if (slug === "semifinals") {
    return "Semifinal";
  }

  if (slug === "3rd-place-match") {
    return "Disputa de 3º Lugar";
  }

  if (slug === "final") {
    return "Final";
  }

  return "Fase de Grupos";
}

function getCashbackWinnerSlot(round, number) {
  if (round === "R32") {
    return `R32W${number}`;
  }

  if (round === "R16") {
    return `R16W${number}`;
  }

  if (round === "QF") {
    return `QFW${number}`;
  }

  if (round === "SF") {
    return `SFW${number}`;
  }

  return "";
}

function getCashbackLoserSlot(round, number) {
  return round === "SF" ? `SFL${number}` : "";
}

function getCashbackPlaceholderKey(team) {
  const displayName = team?.displayName || "";
  const shortDisplayName = team?.shortDisplayName || "";
  const abbreviation = team?.abbreviation || "";
  const compactLabel = shortDisplayName || abbreviation;
  const groupPosition = /^([123])([A-L])$/.exec(compactLabel);

  if (groupPosition) {
    return `${groupPosition[1]}${groupPosition[2]}`;
  }

  const groupWinner = /Group ([A-L]) Winner/.exec(displayName);

  if (groupWinner) {
    return `1${groupWinner[1]}`;
  }

  const groupSecond = /Group ([A-L]) 2nd Place/.exec(displayName);

  if (groupSecond) {
    return `2${groupSecond[1]}`;
  }

  const roundOf32Winner = /Round of 32 (\d+) Winner/.exec(displayName);

  if (roundOf32Winner) {
    return `R32W${roundOf32Winner[1]}`;
  }

  const roundOf16Winner = /Round of 16 (\d+) Winner/.exec(displayName);

  if (roundOf16Winner) {
    return `R16W${roundOf16Winner[1]}`;
  }

  const quarterfinalWinner = /Quarterfinal (\d+) Winner/.exec(displayName);

  if (quarterfinalWinner) {
    return `QFW${quarterfinalWinner[1]}`;
  }

  const semifinalWinner = /Semifinal (\d+) Winner/.exec(displayName);

  if (semifinalWinner) {
    return `SFW${semifinalWinner[1]}`;
  }

  const semifinalLoser = /Semifinal (\d+) Loser/.exec(displayName);

  if (semifinalLoser) {
    return `SFL${semifinalLoser[1]}`;
  }

  return "";
}

function getCashbackPlaceholderName(team, placeholderKey) {
  if (/^[12][A-L]$/.test(placeholderKey)) {
    return `${placeholderKey[0]}º Grupo ${placeholderKey[1]}`;
  }

  if (/^R32W\d+$/.test(placeholderKey)) {
    return `Vencedor 16 avos ${placeholderKey.replace("R32W", "")}`;
  }

  if (/^R16W\d+$/.test(placeholderKey)) {
    return `Vencedor oitavas ${placeholderKey.replace("R16W", "")}`;
  }

  if (/^QFW\d+$/.test(placeholderKey)) {
    return `Vencedor quartas ${placeholderKey.replace("QFW", "")}`;
  }

  if (/^SFW\d+$/.test(placeholderKey)) {
    return `Vencedor semifinal ${placeholderKey.replace("SFW", "")}`;
  }

  if (/^SFL\d+$/.test(placeholderKey)) {
    return `Perdedor semifinal ${placeholderKey.replace("SFL", "")}`;
  }

  if ((team?.displayName || "").includes("Third Place")) {
    return "3º colocado";
  }

  return team?.shortDisplayName || team?.displayName || "A definir";
}

function normalizeCashbackCompetitor(competitor) {
  const espnTeam = competitor.team || {};
  const abbreviation = espnTeam.abbreviation || espnTeam.shortDisplayName || "";
  const placeholderKey = getCashbackPlaceholderKey(espnTeam);
  const countryInfo = getCountryInfo(abbreviation, espnTeam.displayName || espnTeam.shortDisplayName);

  return {
    abbreviation,
    name: placeholderKey ? getCashbackPlaceholderName(espnTeam, placeholderKey) : countryInfo.name,
    flagSlug: placeholderKey ? "" : countryInfo.flagSlug,
    displayName: espnTeam.displayName,
    placeholderKey,
    score: Number(competitor.score),
    winner: competitor.winner === true
  };
}

function isCompletedCashbackEvent(event) {
  return event.competitions?.[0]?.status?.type?.completed === true;
}

function getCashbackEventCompetitors(event) {
  return Array.isArray(event.competitions?.[0]?.competitors) ? event.competitions[0].competitors : [];
}

function getCashbackGroupRankings(events, groupLetter) {
  const groupTeams = cashbackGroupTeams[groupLetter];

  if (!groupTeams) {
    return [];
  }

  const standings = groupTeams.reduce((currentStandings, abbreviation) => {
    currentStandings[abbreviation] = {
      abbreviation,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      wins: 0
    };

    return currentStandings;
  }, {});
  let completedMatches = 0;

  events.forEach((event) => {
    if (event.season?.slug !== "group-stage" || !isCompletedCashbackEvent(event)) {
      return;
    }

    const competitors = getCashbackEventCompetitors(event);
    const abbreviations = competitors.map((competitor) => competitor.team?.abbreviation);

    if (competitors.length !== 2 || !abbreviations.every((abbreviation) => groupTeams.includes(abbreviation))) {
      return;
    }

    const first = competitors[0];
    const second = competitors[1];
    const firstAbbreviation = first.team.abbreviation;
    const secondAbbreviation = second.team.abbreviation;
    const firstScore = Number(first.score);
    const secondScore = Number(second.score);

    if (!Number.isFinite(firstScore) || !Number.isFinite(secondScore)) {
      return;
    }

    completedMatches += 1;
    standings[firstAbbreviation].goalsFor += firstScore;
    standings[firstAbbreviation].goalsAgainst += secondScore;
    standings[secondAbbreviation].goalsFor += secondScore;
    standings[secondAbbreviation].goalsAgainst += firstScore;

    if (firstScore > secondScore) {
      standings[firstAbbreviation].points += 3;
      standings[firstAbbreviation].wins += 1;
    } else if (secondScore > firstScore) {
      standings[secondAbbreviation].points += 3;
      standings[secondAbbreviation].wins += 1;
    } else {
      standings[firstAbbreviation].points += 1;
      standings[secondAbbreviation].points += 1;
    }
  });

  if (completedMatches < 6) {
    return [];
  }

  return Object.values(standings).sort((first, second) => {
    const goalDifferenceDelta = (second.goalsFor - second.goalsAgainst) - (first.goalsFor - first.goalsAgainst);
    const goalsForDelta = second.goalsFor - first.goalsFor;

    return second.points - first.points || goalDifferenceDelta || goalsForDelta || second.wins - first.wins || first.abbreviation.localeCompare(second.abbreviation);
  });
}

function getCashbackSlotReplacements(events) {
  const slotReplacements = {};

  Object.keys(cashbackGroupTeams).forEach((groupLetter) => {
    getCashbackGroupRankings(events, groupLetter).forEach((team, index) => {
      const countryInfo = getCountryInfo(team.abbreviation, team.abbreviation);

      slotReplacements[`${index + 1}${groupLetter}`] = countryInfo;
    });
  });

  events.forEach((event) => {
    if (!isCompletedCashbackEvent(event)) {
      return;
    }

    const roundInfo = cashbackRoundNumbersByEventId[event.id];

    if (!roundInfo) {
      return;
    }

    const competitors = getCashbackEventCompetitors(event)
      .map(normalizeCashbackCompetitor)
      .map((competitor) => resolveCashbackCompetitor(competitor, slotReplacements));
    const winner = competitors.find((competitor) => competitor.winner === true);
    const loser = competitors.find((competitor) => competitor.winner !== true);
    const winnerSlot = getCashbackWinnerSlot(roundInfo.round, roundInfo.number);
    const loserSlot = getCashbackLoserSlot(roundInfo.round, roundInfo.number);

    if (winner && winnerSlot) {
      slotReplacements[winnerSlot] = winner;
    }

    if (loser && loserSlot) {
      slotReplacements[loserSlot] = loser;
    }
  });

  return slotReplacements;
}

function resolveCashbackCompetitor(competitor, slotReplacements) {
  if (!competitor.placeholderKey || !slotReplacements[competitor.placeholderKey]) {
    return competitor;
  }

  return {
    ...slotReplacements[competitor.placeholderKey],
    winner: competitor.winner
  };
}

function normalizeCashbackEvent(event, slotReplacements) {
  const competitors = getCashbackEventCompetitors(event)
    .map(normalizeCashbackCompetitor)
    .map((competitor) => resolveCashbackCompetitor(competitor, slotReplacements));
  const brazil = competitors.find(isBrazilTeam);
  const isFinal = isCashbackFinalEvent(event);

  if (!brazil && !isFinal) {
    return null;
  }

  const opponent = competitors.find((competitor) => !isBrazilTeam(competitor)) || {
    name: "A definir",
    flagSlug: ""
  };
  const teams = brazil
    ? [cashbackBrazilTeam, opponent]
    : competitors.slice(0, 2);
  const normalizedTeams = teams.length >= 2
    ? teams
    : [
        teams[0] || { name: "Finalista 1", flagSlug: "" },
        { name: "Finalista 2", flagSlug: "" }
      ];

  return {
    id: `espn-${event.id}`,
    espnEventId: String(event.id),
    date: event.date,
    stage: getCashbackStageLabel(event),
    isFinal,
    teams: normalizedTeams,
    brazil: normalizedTeams[0],
    opponent: normalizedTeams[1],
    source: "espn"
  };
}

function getCashbackMatchesFromEspn(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  const slotReplacements = getCashbackSlotReplacements(events);

  return events
    .map((event) => normalizeCashbackEvent(event, slotReplacements))
    .filter(Boolean)
    .sort((first, second) => new Date(first.date) - new Date(second.date));
}

function mergeCashbackMatches(remoteMatches) {
  const matchesByKey = new Map();

  cashbackState.matches.forEach((match) => {
    matchesByKey.set(match.espnEventId || match.id, match);
  });

  remoteMatches.forEach((match) => {
    matchesByKey.set(match.espnEventId || match.id, match);
  });

  return Array.from(matchesByKey.values()).sort((first, second) => new Date(first.date) - new Date(second.date));
}

function getCashbackInitialIndex(matches, now = getCurrentDate()) {
  const nextIndex = matches.findIndex((match) => new Date(match.date).getTime() + 3 * 60 * 60 * 1000 >= now.getTime());

  return nextIndex === -1 ? Math.max(0, matches.length - 1) : nextIndex;
}

function getCashbackMatchForDate(now = getCurrentDate()) {
  const currentDateKey = getSaoPauloDateKey(now);

  return cashbackState.matches.find((match) => getSaoPauloDateKey(new Date(match.date)) === currentDateKey) || null;
}

function isCashbackMatchDay(now = getCurrentDate()) {
  return Boolean(getCashbackMatchForDate(now));
}

function hasUpcomingCashbackMatch(now = getCurrentDate()) {
  return cashbackState.matches.some((match) => new Date(match.date).getTime() > now.getTime());
}

function isCashbackPromotionVisible(now = getCurrentDate()) {
  if (!cashbackPromotion) {
    return hasUpcomingCashbackMatch(now);
  }

  return hasUpcomingCashbackMatch(now) || (now >= getItemStart(cashbackPromotion) && now <= getItemEnd(cashbackPromotion));
}

function positionCashbackSection(now = getCurrentDate()) {
  if (!cashbackSection) {
    return;
  }

  if (!missionsSection || isCashbackMatchDay(now)) {
    return;
  }

  if (missionsSection.nextElementSibling !== cashbackSection) {
    missionsSection.insertAdjacentElement("afterend", cashbackSection);
  }
}

function renderCashbackMatch(match, options = {}) {
  const teams = Array.isArray(match.teams) && match.teams.length >= 2
    ? match.teams
    : [match.brazil || cashbackBrazilTeam, match.opponent || { name: "A definir", flagSlug: "" }];
  const firstTeam = teams[0];
  const secondTeam = teams[1];
  const dateLabel = options.dateLabel || formatCashbackMatchDate(match.date);
  const renderFlag = (team, modifier) => {
    const className = `cashback-match-card__flag cashback-match-card__flag--${modifier}`;

    if (!team.flagSlug) {
      return `<span class="${className}" aria-hidden="true"></span>`;
    }

    return `<img class="${className}" src="${escapeHtml(getFlagSource(team.flagSlug))}" alt="" data-country-flag data-country-fallback="${escapeHtml(cashbackFallbackFlag)}">`;
  };

  return `
    <article class="cashback-match-card" data-cashback-slide>
      <div class="cashback-match-card__meta">
        <span class="cashback-match-card__stage">${escapeHtml(match.stage)}</span>
        <time class="cashback-match-card__date" datetime="${escapeHtml(match.date)}">${escapeHtml(dateLabel)}</time>
      </div>

      <div class="cashback-match-card__confrontation">
        <p class="cashback-match-card__team">${escapeHtml(firstTeam.name)}</p>
        <div class="cashback-match-card__versus" aria-hidden="true">
          ${renderFlag(firstTeam, "brazil")}
          <span class="cashback-match-card__vs">vs</span>
          ${renderFlag(secondTeam, "opponent")}
        </div>
        <p class="cashback-match-card__team">${escapeHtml(secondTeam.name)}</p>
      </div>
    </article>
  `;
}

function getCashbackTrackTransform(deltaX = 0) {
  const baseOffset = -cashbackState.currentIndex * 100;

  return deltaX === 0
    ? `translate3d(${baseOffset}%, 0, 0)`
    : `translate3d(calc(${baseOffset}% + ${deltaX}px), 0, 0)`;
}

function getCashbackTrack() {
  return cashbackMatchRoot ? cashbackMatchRoot.querySelector("[data-cashback-track]") : null;
}

function updateCashbackCarouselState() {
  if (!cashbackMatchRoot) {
    return;
  }

  const matches = cashbackState.matches;
  const maxIndex = Math.max(0, matches.length - 1);

  cashbackState.currentIndex = Math.min(Math.max(cashbackState.currentIndex, 0), maxIndex);

  const track = getCashbackTrack();

  if (track) {
    track.style.transition = "";
    track.style.transform = getCashbackTrackTransform();
  }

  cashbackMatchRoot.querySelectorAll("[data-cashback-slide]").forEach((slide, index) => {
    slide.setAttribute("aria-hidden", index === cashbackState.currentIndex ? "false" : "true");
  });

  updateCashbackSectionCopy(matches[cashbackState.currentIndex]);

  if (cashbackPreviousButton) {
    cashbackPreviousButton.disabled = matches.length <= 1 || cashbackState.currentIndex === 0;
  }

  if (cashbackNextButton) {
    cashbackNextButton.disabled = matches.length <= 1 || cashbackState.currentIndex === maxIndex;
  }
}

function renderCashbackSection(now = getCurrentDate()) {
  if (!cashbackSection || !cashbackMatchRoot) {
    return;
  }

  const matches = cashbackState.matches;

  cashbackSection.hidden = matches.length === 0 || isCashbackMatchDay(now) || !isCashbackPromotionVisible(now);

  if (matches.length === 0) {
    cashbackMatchRoot.innerHTML = "";
    return;
  }

  cashbackState.currentIndex = Math.min(Math.max(cashbackState.currentIndex, 0), matches.length - 1);
  cashbackMatchRoot.innerHTML = `
    <div class="cashback__track" data-cashback-track>
      ${matches.map(renderCashbackMatch).join("")}
    </div>
  `;

  updateCashbackCarouselState();
  positionCashbackSection(now);
}

function showCashbackMatch(direction) {
  const matches = cashbackState.matches;
  const nextIndex = cashbackState.currentIndex + direction;

  if (matches.length <= 1 || nextIndex < 0 || nextIndex >= matches.length) {
    return;
  }

  cashbackState.currentIndex = nextIndex;
  updateCashbackCarouselState();
}

function setupCashbackSwipe() {
  if (!cashbackMatchRoot) {
    return;
  }

  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let pointerMode;
  let activePointerId;
  let isDragging = false;

  cashbackMatchRoot.addEventListener("pointerdown", (event) => {
    if (event.button > 0 || cashbackState.matches.length <= 1) {
      return;
    }

    startX = event.clientX;
    startY = event.clientY;
    lastX = event.clientX;
    pointerMode = undefined;
    activePointerId = event.pointerId;
    isDragging = true;

    if (cashbackMatchRoot.setPointerCapture) {
      cashbackMatchRoot.setPointerCapture(event.pointerId);
    }
  });

  cashbackMatchRoot.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    lastX = event.clientX;

    const distanceX = lastX - startX;
    const distanceY = event.clientY - startY;

    if (!pointerMode) {
      if (Math.abs(distanceX) < 8 && Math.abs(distanceY) < 8) {
        return;
      }

      pointerMode = Math.abs(distanceX) > Math.abs(distanceY) * 1.25 ? "horizontal" : "vertical";
    }

    if (pointerMode !== "horizontal") {
      return;
    }

    event.preventDefault();

    const maxIndex = Math.max(0, cashbackState.matches.length - 1);
    const isPullingBeforeStart = cashbackState.currentIndex === 0 && distanceX > 0;
    const isPullingAfterEnd = cashbackState.currentIndex === maxIndex && distanceX < 0;
    const visibleDistanceX = isPullingBeforeStart || isPullingAfterEnd ? distanceX * 0.28 : distanceX;
    const track = getCashbackTrack();

    cashbackMatchRoot.classList.add("is-swiping");

    if (track) {
      track.style.transition = "none";
      track.style.transform = getCashbackTrackTransform(visibleDistanceX);
    }
  });

  function finishSwipe() {
    if (!isDragging) {
      return;
    }

    const distanceX = lastX - startX;
    const direction = distanceX < 0 ? 1 : -1;
    const nextIndex = cashbackState.currentIndex + direction;
    const maxIndex = Math.max(0, cashbackState.matches.length - 1);
    const minDistance = Math.min(90, (cashbackMatchRoot.clientWidth || 0) * 0.22);
    const shouldMove = pointerMode === "horizontal" && Math.abs(distanceX) >= minDistance && nextIndex >= 0 && nextIndex <= maxIndex;

    isDragging = false;
    pointerMode = undefined;
    activePointerId = undefined;
    cashbackMatchRoot.classList.remove("is-swiping");

    if (shouldMove) {
      showCashbackMatch(direction);
      return;
    }

    updateCashbackCarouselState();
  }

  cashbackMatchRoot.addEventListener("pointerup", finishSwipe);
  cashbackMatchRoot.addEventListener("pointercancel", finishSwipe);
  cashbackMatchRoot.addEventListener("lostpointercapture", finishSwipe);
}

async function fetchCashbackMatches() {
  if (!cashbackSection) {
    return;
  }

  try {
    const response = await fetch(cashbackScoreboardUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Unable to load World Cup matches");
    }

    const data = await response.json();
    const remoteMatches = getCashbackMatchesFromEspn(data.events);

    if (remoteMatches.length === 0) {
      renderCashbackSection();
      renderPromotionSections();
      refreshPromotionRenderEffects();
      return;
    }

    cashbackState.matches = mergeCashbackMatches(remoteMatches);
    cashbackState.currentIndex = getCashbackInitialIndex(cashbackState.matches);
    renderCashbackSection();
    renderPromotionSections();
    refreshPromotionRenderEffects();
  } catch (error) {
    renderCashbackSection();
    renderPromotionSections();
    refreshPromotionRenderEffects();
  }
}

function renderMissionCard(mission, now = getCurrentDate()) {
  const status = getItemStatus(mission, now);
  const mediaMarkup = mission.image
    ? `<img class="mission-card__image" src="${escapeHtml(mission.image)}" alt="${escapeHtml(mission.imageAlt || "")}">`
    : `<span class="mission-card__placeholder" aria-hidden="true"></span>`;
  const providerMarkup = mission.providerName
    ? `<p class="mission-card__provider">${escapeHtml(mission.providerName)}</p>`
    : "";

  return `
    <article class="mission-card">
      <div class="mission-card__media">
        ${mediaMarkup}
      </div>

      <div class="mission-card__content">
        <p class="mission-card__text">${escapeHtml(mission.text)}</p>
        ${providerMarkup}
        ${getMissionButton(mission, status)}
      </div>
    </article>
  `;
}

function renderMissions(now = getCurrentDate()) {
  if (!missionsList) {
    return;
  }

  if (missionsSection) {
    missionsSection.hidden = missions.length === 0;
  }

  missionsList.innerHTML = getSortedMissions(now)
    .map((mission) => renderMissionCard(mission, now))
    .join("");
}

function renderPromosDescription() {
  if (!promosDescription) {
    return;
  }

  const tournamentCount = promotions.filter((promotion) => promotion.type === "tournament").length;
  const prizeDropCount = promotions.filter((promotion) => promotion.type === "prizeDrop").length;
  const totalPromotions = tournamentCount + prizeDropCount;
  const totalLabel = totalPromotions === 1 ? "promoção" : "promoções";
  const tournamentLabel = tournamentCount === 1 ? "Torneio" : "Torneios";
  const prizeDropLabel = prizeDropCount === 1 ? "Prize Drop" : "Prize Drops";
  const promoTypes = [];

  if (tournamentCount > 0) {
    promoTypes.push(`${tournamentCount} ${tournamentLabel}`);
  }

  if (prizeDropCount > 0) {
    promoTypes.push(`${prizeDropCount} ${prizeDropLabel}`);
  }

  promosDescription.textContent = `São ${totalPromotions} ${totalLabel} no total: ${promoTypes.join(" e ")} para você ganhar prêmios durante toda a Copa do Mundo. Aproveite!!!`;
}

renderMissions();

if (cashbackSection) {
  cashbackState.currentIndex = getCashbackInitialIndex(cashbackState.matches);
  renderCashbackSection();
  fetchCashbackMatches();
  setInterval(fetchCashbackMatches, cashbackRefreshMs);
}

function renderFeaturedCashback(now = getCurrentDate()) {
  if (!cashbackPromotion) {
    return "";
  }

  const match = getCashbackMatchForDate(now);

  if (!match) {
    return "";
  }

  const copy = getCashbackCopy(match);

  return `
    <section class="featured-cashback" aria-labelledby="featured-cashback-title">
      <div class="featured-cashback__copy">
        <div class="featured-cashback__heading">
          <img class="featured-cashback__icon" src="images/icon-cashback.png?v=icons-20260529" alt="">
          <h2 class="featured-cashback__title" id="featured-cashback-title">${escapeHtml(copy.featuredTitle)}</h2>
        </div>

        <p class="featured-cashback__description">${escapeHtml(copy.featuredDescription)}</p>

        <div class="featured-cashback__actions">
          <a class="featured-cashback__button featured-cashback__button--primary" href="${escapeHtml(cashbackPromotion.playUrl || "#")}">Jogar Agora</a>
          <button class="featured-cashback__button featured-cashback__button--secondary" type="button" data-promo-detail-id="${escapeHtml(cashbackPromotion.id)}">Saiba Mais</button>
        </div>
      </div>

      <div class="featured-cashback__match" aria-label="${escapeHtml(copy.featuredMatchLabel)}">
        ${renderCashbackMatch(match, { dateLabel: formatCashbackMatchToday(match.date) })}
      </div>
    </section>
  `;
}

function renderFeaturedPromotion(promotion, now = getCurrentDate()) {
  if (!featuredPromoSection || !featuredPromoRoot) {
    return;
  }

  if (!promotion) {
    featuredPromoSection.hidden = true;
    featuredPromoRoot.innerHTML = "";
    return;
  }

  const statusViewModel = getStatusViewModel(promotion, now);
  const period = formatPromotionPeriod(promotion);
  const games = Array.isArray(promotion.gameImages) ? promotion.gameImages : [];
  const gameDisplayMode = getGameDisplayMode(promotion);
  const featuredGamesClass = promotion.featuredGamesClass ? ` ${escapeHtml(promotion.featuredGamesClass)}` : "";
  const gamesMarkup = games
    .map((game) => renderGameImage(game, "featured-promo__game"))
    .join("");
  const featuredCashbackMarkup = renderFeaturedCashback(now);
  const featuredCashbackClass = featuredCashbackMarkup ? " featured-promo--cashback-active" : "";

  featuredPromoSection.hidden = false;
  featuredPromoRoot.innerHTML = `
    <div class="featured-promo${featuredCashbackClass}">
      ${featuredCashbackMarkup}

      <div class="featured-promo__header">
        <div class="featured-promo__heading">
          <img class="featured-promo__icon" src="images/icon-promocao-destaque.png?v=icons-20260529" alt="">
          <h2 class="featured-promo__title" id="featured-promo-title">Promoção em Destaque</h2>
        </div>

        <div class="featured-promo__meta">
          <img class="featured-promo__brand featured-promo__brand--mobile" src="${escapeHtml(promotion.providerLogo)}" alt="${escapeHtml(promotion.providerName)}">
          <p class="featured-promo__date">${escapeHtml(period)}</p>
        </div>
      </div>

      <div class="featured-promo__details">
        <dl class="featured-promo__stats" aria-label="Informações da promoção">
          <div class="featured-promo__stat">
            <dt>${escapeHtml(statusViewModel.label)}</dt>
            <dd data-promo-timer="${escapeHtml(promotion.id)}">${escapeHtml(statusViewModel.value)}</dd>
          </div>

          <div class="featured-promo__stat">
            <dt>Torneio</dt>
            <dd>${escapeHtml(promotion.title)}</dd>
          </div>

          <div class="featured-promo__stat">
            <dt>${escapeHtml(promotion.prizeLabel)}</dt>
            <dd>${escapeHtml(promotion.prizeValue)}</dd>
          </div>
        </dl>

        <img class="featured-promo__brand featured-promo__brand--desktop" src="${escapeHtml(promotion.providerLogo)}" alt="${escapeHtml(promotion.providerName)}">
      </div>

      <div class="featured-promo__games featured-promo__games--${escapeHtml(gameDisplayMode)}${featuredGamesClass}" aria-label="Jogos da promoção">
        ${gamesMarkup}
      </div>

      <div class="featured-promo__actions">
        ${getPrimaryButton(promotion, statusViewModel.status, "featured-promo")}
        ${getSecondaryButton(promotion, "featured-promo")}
      </div>
    </div>
  `;
}

function renderPromotionCard(promotion, index, now = getCurrentDate()) {
  const statusViewModel = getStatusViewModel(promotion, now);
  const cardClass = getStatusCardClass(statusViewModel.status);
  const brandClass = promotion.providerLogoClass ? ` ${promotion.providerLogoClass}` : "";

  return `
    <article class="upcoming-promo-card ${cardClass}" style="z-index: ${index + 1}">
      <div class="upcoming-promo-card__content">
        <img class="upcoming-promo-card__brand${brandClass}" src="${escapeHtml(promotion.providerLogo)}" alt="${escapeHtml(promotion.providerName)}">

        <dl class="upcoming-promo-card__details">
          <div class="upcoming-promo-card__group upcoming-promo-card__group--status">
            <dt>${escapeHtml(statusViewModel.label)}</dt>
            <dd data-promo-timer="${escapeHtml(promotion.id)}">${escapeHtml(statusViewModel.value)}</dd>
            <span>${escapeHtml(formatPromotionPeriod(promotion))}</span>
          </div>

          <div class="upcoming-promo-card__group">
            <dt>${escapeHtml(getTypeLabel(promotion.type))}</dt>
            <dd>${escapeHtml(promotion.title)}</dd>
          </div>

          <div class="upcoming-promo-card__group">
            <dt>${escapeHtml(promotion.prizeLabel)}</dt>
            <dd>${escapeHtml(promotion.prizeValue)}</dd>
          </div>
        </dl>

        <div class="upcoming-promo-card__actions">
          ${getPrimaryButton(promotion, statusViewModel.status, "upcoming-promo-card")}
          ${getSecondaryButton(promotion, "upcoming-promo-card")}
        </div>
      </div>
    </article>
  `;
}

function renderGameImage(game, className) {
  const optionalAttribute = game.optional === true ? ' data-optional-game-image="true"' : "";

  return `<img class="${className}" src="${escapeHtml(game.src)}" alt="${escapeHtml(game.alt || "")}"${optionalAttribute}>`;
}

function renderPromotionDetailGame(game) {
  const image = renderGameImage(game, "promo-detail__game");

  if (game.optional !== true) {
    return image;
  }

  return `
    <span class="promo-detail__game-tile">
      ${image}
      <span class="promo-detail__game-fallback" hidden>${escapeHtml(game.alt || "Jogo")}</span>
    </span>
  `;
}

function renderPromotionDetailStep(step, index) {
  if (typeof step === "string") {
    return `
      <li class="promo-detail__step">
        <span class="promo-detail__step-number">${index + 1}</span>
        <p class="promo-detail__step-text">${escapeHtml(step)}</p>
      </li>
    `;
  }

  return `
    <li class="promo-detail__step">
      <span class="promo-detail__step-number">${index + 1}</span>
      <div class="promo-detail__step-copy">
        <h3 class="promo-detail__step-title">${escapeHtml(step.title || `Passo ${index + 1}`)}</h3>
        <p class="promo-detail__step-text">${escapeHtml(step.text || "")}</p>
      </div>
    </li>
  `;
}

function renderPromotionDetailFaq(item, index) {
  const panelId = `promo-detail-faq-panel-${index + 1}`;
  const triggerId = `promo-detail-faq-trigger-${index + 1}`;
  const isOpen = index === 0;

  return `
    <div class="promo-detail-faq__item${isOpen ? " is-open" : ""}">
      <button class="promo-detail-faq__button" type="button" id="${triggerId}" aria-expanded="${isOpen ? "true" : "false"}" aria-controls="${panelId}">
        <span>${escapeHtml(item.question || "")}</span>
        <img class="promo-detail-faq__icon" src="images/icon-accordion.svg" alt="">
      </button>

      <div class="promo-detail-faq__panel" id="${panelId}" aria-labelledby="${triggerId}"${isOpen ? "" : " hidden"}>
        <p class="promo-detail-faq__answer">${escapeHtml(item.answer || "")}</p>
      </div>
    </div>
  `;
}

function renderPromotionDetail(promotion, now = getCurrentDate()) {
  if (!promoDetailHeader || !promoDetailBody || !promoDetailFooter || !hasPromotionDetails(promotion)) {
    return;
  }

  const detailPromotion = promotion;
  const details = detailPromotion.details;
  const statusViewModel = getStatusViewModel(detailPromotion, now);
  const howItWorks = Array.isArray(details.howItWorks) ? details.howItWorks : [];
  const faq = Array.isArray(details.faq) ? details.faq : [];
  const games = Array.isArray(detailPromotion.gameImages) ? detailPromotion.gameImages : [];
  const gameDisplayMode = getGameDisplayMode(detailPromotion);
  const detailGamesClass = detailPromotion.detailGamesClass ? ` ${escapeHtml(detailPromotion.detailGamesClass)}` : "";
  const stepsMarkup = howItWorks.map(renderPromotionDetailStep).join("");
  const faqMarkup = faq.map(renderPromotionDetailFaq).join("");
  const gamesMarkup = games
    .map(renderPromotionDetailGame)
    .join("");
  const termsMarkup = details.termsSummary
    ? `<p class="promo-detail__terms">${escapeHtml(details.termsSummary)}</p>`
    : "";

  promoDetailHeader.innerHTML = `
    <div class="promo-detail__header-main">
      <p class="promo-detail__eyebrow">${escapeHtml(detailPromotion.providerName)}</p>
      <h2 class="promo-detail__title" id="promo-detail-title">${escapeHtml(detailPromotion.title)}</h2>
    </div>

    <button class="promo-detail__close" type="button" aria-label="Fechar detalhes da promoção" data-promo-detail-close>
      <span aria-hidden="true">&times;</span>
    </button>

    <dl class="promo-detail__meta" aria-label="Informações da promoção">
      <div class="promo-detail__meta-item">
        <dt>${escapeHtml(statusViewModel.label)}</dt>
        <dd data-promo-timer="${escapeHtml(promotion.id)}" data-promo-status="${escapeHtml(statusViewModel.status)}">${escapeHtml(statusViewModel.value)}</dd>
      </div>

      <div class="promo-detail__meta-item">
        <dt>Período</dt>
        <dd>${escapeHtml(formatPromotionPeriod(detailPromotion))}</dd>
      </div>

      <div class="promo-detail__meta-item">
        <dt>${escapeHtml(detailPromotion.prizeLabel)}</dt>
        <dd>${escapeHtml(detailPromotion.prizeValue)}</dd>
      </div>
    </dl>
  `;

  promoDetailBody.innerHTML = `
    ${stepsMarkup ? `
      <section class="promo-detail__section" aria-labelledby="promo-detail-how-it-works">
        <h3 class="promo-detail__section-title" id="promo-detail-how-it-works">Como funciona</h3>
        <ol class="promo-detail__steps">
          ${stepsMarkup}
        </ol>
      </section>
    ` : ""}

    ${gamesMarkup ? `
      <section class="promo-detail__section" aria-labelledby="promo-detail-games-title">
        <h3 class="promo-detail__section-title" id="promo-detail-games-title">Jogos participantes</h3>
        <div class="promo-detail__games promo-detail__games--${escapeHtml(gameDisplayMode)}${detailGamesClass}" aria-label="Jogos participantes da promoção">
          ${gamesMarkup}
        </div>
      </section>
    ` : ""}

    ${faqMarkup ? `
      <section class="promo-detail__section" aria-labelledby="promo-detail-faq-title">
        <h3 class="promo-detail__section-title" id="promo-detail-faq-title">FAQ</h3>
        <div class="promo-detail-faq">
          ${faqMarkup}
        </div>
      </section>
    ` : ""}

    ${termsMarkup}
  `;

  promoDetailBody.querySelectorAll(".promo-detail__games").forEach(setupDraggableCarousel);
  promoDetailFooter.innerHTML = getPrimaryButton(detailPromotion, statusViewModel.status, "promo-detail");
}

function lockPromoDetailPageScroll() {
  if (document.body.classList.contains("promo-detail-open")) {
    return;
  }

  promoDetailScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  promoDetailBodyInlineStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    right: document.body.style.right,
    left: document.body.style.left,
    width: document.body.style.width
  };

  document.body.classList.add("promo-detail-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${promoDetailScrollY}px`;
  document.body.style.right = "0";
  document.body.style.left = "0";
  document.body.style.width = "100%";
}

function unlockPromoDetailPageScroll() {
  if (!document.body.classList.contains("promo-detail-open")) {
    return;
  }

  document.body.classList.remove("promo-detail-open");

  if (promoDetailBodyInlineStyles) {
    document.body.style.position = promoDetailBodyInlineStyles.position;
    document.body.style.top = promoDetailBodyInlineStyles.top;
    document.body.style.right = promoDetailBodyInlineStyles.right;
    document.body.style.left = promoDetailBodyInlineStyles.left;
    document.body.style.width = promoDetailBodyInlineStyles.width;
  } else {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.right = "";
    document.body.style.left = "";
    document.body.style.width = "";
  }

  window.scrollTo(0, promoDetailScrollY);
  promoDetailBodyInlineStyles = undefined;
}

function resetPromotionDetailDrag(panel) {
  promoDetailDragState = undefined;

  if (!panel) {
    return;
  }

  panel.classList.remove("is-dragging");
  panel.style.transform = "";
}

function setupPromotionDetailDrag() {
  if (!promoDetailRoot || promoDetailRoot.dataset.dragReady === "true") {
    return;
  }

  const panel = promoDetailRoot.querySelector(".promo-detail__panel");
  const handle = promoDetailRoot.querySelector(".promo-detail__handle");

  if (!panel || !handle) {
    return;
  }

  promoDetailRoot.dataset.dragReady = "true";

  handle.addEventListener("pointerdown", (event) => {
    if (window.matchMedia("(min-width: 769px)").matches) {
      return;
    }

    promoDetailDragState = {
      pointerId: event.pointerId,
      startY: event.clientY,
      currentY: event.clientY
    };

    panel.classList.add("is-dragging");
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!promoDetailDragState || promoDetailDragState.pointerId !== event.pointerId) {
      return;
    }

    const distanceY = Math.max(0, event.clientY - promoDetailDragState.startY);
    promoDetailDragState.currentY = event.clientY;
    panel.style.transform = `translateY(${distanceY}px)`;
  });

  function finishDrag(event) {
    if (!promoDetailDragState || promoDetailDragState.pointerId !== event.pointerId) {
      return;
    }

    const distanceY = Math.max(0, promoDetailDragState.currentY - promoDetailDragState.startY);
    const shouldClose = distanceY > 72;

    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }

    resetPromotionDetailDrag(panel);

    if (shouldClose) {
      closePromotionDetail();
    }
  }

  handle.addEventListener("pointerup", finishDrag);
  handle.addEventListener("pointercancel", finishDrag);
}

function openPromotionDetail(promotionId, triggerElement) {
  const promotion = getPromotionById(promotionId);

  if (!promotion || !promoDetailRoot || !hasPromotionDetails(promotion)) {
    return;
  }

  activePromoDetailId = promotionId;
  promoDetailCloseFocusTarget = triggerElement || document.activeElement;
  renderPromotionDetail(promotion);

  setupPromotionDetailDrag();
  lockPromoDetailPageScroll();
  promoDetailRoot.hidden = false;
  window.requestAnimationFrame(() => {
    promoDetailRoot.classList.add("is-open");
    promoDetailRoot.querySelector(".promo-detail__close")?.focus();
  });
}

function closePromotionDetail() {
  if (!promoDetailRoot || promoDetailRoot.hidden) {
    return;
  }

  activePromoDetailId = undefined;
  promoDetailRoot.classList.remove("is-open");

  setTimeout(() => {
    if (!promoDetailRoot.classList.contains("is-open")) {
      promoDetailRoot.hidden = true;
      unlockPromoDetailPageScroll();
    }
  }, 240);

  if (promoDetailCloseFocusTarget && typeof promoDetailCloseFocusTarget.focus === "function") {
    promoDetailCloseFocusTarget.focus();
  }

  promoDetailCloseFocusTarget = undefined;
}

function renderPromotionSections(now = getCurrentDate()) {
  const featuredPromotion = getFeaturedPromotion(now);
  const sortedPromotions = getSortedPromotions(featuredPromotion, now);

  renderPromosDescription();
  renderFeaturedPromotion(featuredPromotion, now);

  if (promosList) {
    promosList.innerHTML = sortedPromotions
      .map((promotion, index) => renderPromotionCard(promotion, index, now))
      .join("");
  }

  if (activePromoDetailId) {
    const activePromotion = getPromotionById(activePromoDetailId);

    if (activePromotion) {
      renderPromotionDetail(activePromotion, now);
    }
  }
}

function refreshPromotionRenderEffects() {
  document.querySelectorAll(".featured-promo__games").forEach(setupDraggableCarousel);
  window.dispatchEvent(new CustomEvent("promotionsrendered"));
}

function updatePromotionTimers() {
  const now = getCurrentDate();
  let shouldRenderSections = false;

  document.querySelectorAll("[data-promo-timer]").forEach((element) => {
    const promotion = getPromotionById(element.dataset.promoTimer);

    if (!promotion) {
      return;
    }

    const previousStatus = element.dataset.promoStatus;
    const statusViewModel = getStatusViewModel(promotion, now);

    if (previousStatus && previousStatus !== statusViewModel.status) {
      shouldRenderSections = true;
      return;
    }

    element.dataset.promoStatus = statusViewModel.status;

    if (element.textContent !== statusViewModel.value) {
      element.textContent = statusViewModel.value;
    }
  });

  if (shouldRenderSections) {
    renderPromotionSections(now);
    refreshPromotionRenderEffects();
  }
}

renderPromotionSections();

function getPromotionTimerDelay(now = getCurrentDate()) {
  let hasPendingTimer = false;
  let needsSecondPrecision = false;

  document.querySelectorAll("[data-promo-timer]").forEach((element) => {
    const promotion = getPromotionById(element.dataset.promoTimer);

    if (!promotion) {
      return;
    }

    const statusViewModel = getStatusViewModel(promotion, now);

    if (!statusViewModel.targetDate) {
      return;
    }

    hasPendingTimer = true;

    if (statusViewModel.targetDate.getTime() - now.getTime() <= dayMs) {
      needsSecondPrecision = true;
    }
  });

  if (!hasPendingTimer) {
    return null;
  }

  return needsSecondPrecision ? 1000 : 60000;
}

function schedulePromotionTimerUpdate() {
  clearTimeout(promotionCountdownTimeoutId);

  const delay = getPromotionTimerDelay();

  if (delay === null) {
    return;
  }

  promotionCountdownTimeoutId = setTimeout(() => {
    updatePromotionTimers();
    schedulePromotionTimerUpdate();
  }, delay);
}

updatePromotionTimers();
schedulePromotionTimerUpdate();

const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  let isHeaderTicking = false;
  let headerHideTimeoutId;
  let headerResizeTimeoutId;
  let headerTransitionEndHandler;
  let headerFlowHeight = Math.ceil(siteHeader.getBoundingClientRect().height);
  const headerTransitionMs = 260;

  function removeFloatingHeader() {
    if (!siteHeader.classList.contains("site-header--visible")) {
      siteHeader.classList.remove("site-header--floating", "site-header--preparing");
    }
  }

  function clearHeaderHideState() {
    clearTimeout(headerHideTimeoutId);

    if (headerTransitionEndHandler) {
      siteHeader.removeEventListener("transitionend", headerTransitionEndHandler);
      headerTransitionEndHandler = undefined;
    }
  }

  function syncHeaderSpacerHeight() {
    if (!siteHeader.classList.contains("site-header--floating")) {
      headerFlowHeight = Math.ceil(siteHeader.getBoundingClientRect().height);
    }

    document.documentElement.style.setProperty("--site-header-spacer-height", `${headerFlowHeight}px`);
  }

  function showHeader() {
    clearHeaderHideState();

    if (siteHeader.classList.contains("site-header--visible")) {
      syncHeaderSpacerHeight();
      return;
    }

    if (!siteHeader.classList.contains("site-header--floating")) {
      syncHeaderSpacerHeight();
      siteHeader.classList.add("site-header--floating", "site-header--preparing");
      siteHeader.classList.remove("site-header--visible");
      siteHeader.offsetHeight;
      siteHeader.classList.remove("site-header--preparing");
      siteHeader.offsetHeight;
    }

    syncHeaderSpacerHeight();
    siteHeader.classList.add("site-header--visible");
  }

  function hideHeader() {
    if (!siteHeader.classList.contains("site-header--floating")) {
      return;
    }

    clearHeaderHideState();
    siteHeader.classList.remove("site-header--visible");

    headerTransitionEndHandler = (event) => {
      if (event.propertyName !== "transform") {
        return;
      }

      clearHeaderHideState();
      removeFloatingHeader();
    };

    siteHeader.addEventListener("transitionend", headerTransitionEndHandler);

    headerHideTimeoutId = setTimeout(() => {
      clearHeaderHideState();
      removeFloatingHeader();
    }, headerTransitionMs + 80);
  }

  function updateHeaderState() {
    const currentFeaturedPromo = document.querySelector(".featured-promo");

    if (!siteHeader.classList.contains("site-header--floating")) {
      syncHeaderSpacerHeight();
    }

    if (!currentFeaturedPromo) {
      hideHeader();
      isHeaderTicking = false;
      return;
    }

    const featuredPromoBottom = currentFeaturedPromo.getBoundingClientRect().bottom;
    const isHeaderVisible = siteHeader.classList.contains("site-header--visible");
    const shouldShowHeader = isHeaderVisible
      ? featuredPromoBottom <= headerFlowHeight + 16
      : featuredPromoBottom <= 1;

    if (shouldShowHeader) {
      showHeader();
    } else {
      hideHeader();
    }

    isHeaderTicking = false;
  }

  function requestHeaderUpdate() {
    if (isHeaderTicking) {
      return;
    }

    isHeaderTicking = true;
    window.requestAnimationFrame(updateHeaderState);
  }

  function requestHeaderResizeUpdate() {
    clearTimeout(headerResizeTimeoutId);
    headerResizeTimeoutId = setTimeout(requestHeaderUpdate, 160);
  }

  updateHeaderState();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
  window.addEventListener("resize", requestHeaderResizeUpdate);
  window.addEventListener("load", requestHeaderUpdate);
  window.addEventListener("promotionsrendered", requestHeaderUpdate);
}

function setupDraggableCarousel(carousel) {
  if (carousel.classList.contains("featured-promo__games--spotlight") || carousel.classList.contains("promo-detail__games--spotlight")) {
    return;
  }

  if (carousel.dataset.draggableCarouselReady === "true") {
    return;
  }

  carousel.dataset.draggableCarouselReady = "true";

  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let touchMode;

  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    if (event.target.closest("a, button")) {
      return;
    }

    isPointerDown = true;
    isDragging = false;
    startX = event.clientX;
    startY = event.clientY;
    startScrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const distanceX = event.clientX - startX;
    const distanceY = event.clientY - startY;

    if (!isDragging) {
      if (Math.abs(distanceX) < 8) {
        return;
      }

      if (Math.abs(distanceY) > Math.abs(distanceX)) {
        isPointerDown = false;
        return;
      }

      isDragging = true;
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    carousel.scrollLeft = startScrollLeft - distanceX;
  });

  function stopDragging(event) {
    isPointerDown = false;
    isDragging = false;
    carousel.classList.remove("is-dragging");

    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
  }

  carousel.addEventListener("pointerup", stopDragging);
  carousel.addEventListener("pointercancel", stopDragging);
  carousel.addEventListener("pointerleave", stopDragging);
  carousel.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  carousel.addEventListener("touchstart", (event) => {
    if (event.target.closest("a, button")) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchMode = undefined;
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true });

  carousel.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    const distanceX = touch.clientX - startX;
    const distanceY = touch.clientY - startY;

    if (!touchMode) {
      if (Math.abs(distanceX) < 8 && Math.abs(distanceY) < 8) {
        return;
      }

      touchMode = Math.abs(distanceX) > Math.abs(distanceY) * 1.25 ? "horizontal" : "vertical";
    }

    carousel.classList.toggle("is-touch-scrolling", touchMode === "horizontal");
  }, { passive: true });

  function clearTouchMode() {
    touchMode = undefined;
    carousel.classList.remove("is-touch-scrolling");
  }

  carousel.addEventListener("touchend", clearTouchMode, { passive: true });
  carousel.addEventListener("touchcancel", clearTouchMode, { passive: true });
}

document.querySelectorAll(".featured-promo__games, .promo-detail__games, .missions__grid").forEach(setupDraggableCarousel);

if (cashbackPreviousButton) {
  cashbackPreviousButton.addEventListener("click", () => showCashbackMatch(-1));
}

if (cashbackNextButton) {
  cashbackNextButton.addEventListener("click", () => showCashbackMatch(1));
}

setupCashbackSwipe();

document.addEventListener("click", (event) => {
  const detailTrigger = event.target.closest("[data-promo-detail-id]");

  if (detailTrigger) {
    event.preventDefault();
    openPromotionDetail(detailTrigger.dataset.promoDetailId, detailTrigger);
    return;
  }

  if (event.target.closest("[data-promo-detail-close]")) {
    closePromotionDetail();
    return;
  }

  const detailFaqButton = event.target.closest(".promo-detail-faq__button");

  if (!detailFaqButton || !promoDetailRoot || !promoDetailRoot.contains(detailFaqButton)) {
    return;
  }

  const item = detailFaqButton.closest(".promo-detail-faq__item");
  const panel = item?.querySelector(".promo-detail-faq__panel");
  const shouldOpen = detailFaqButton.getAttribute("aria-expanded") !== "true";

  if (!item || !panel) {
    return;
  }

  promoDetailRoot.querySelectorAll(".promo-detail-faq__item").forEach((currentItem) => {
    const currentButton = currentItem.querySelector(".promo-detail-faq__button");
    const currentPanel = currentItem.querySelector(".promo-detail-faq__panel");

    if (!currentButton || !currentPanel) {
      return;
    }

    currentButton.setAttribute("aria-expanded", "false");
    currentPanel.hidden = true;
    currentItem.classList.remove("is-open");
  });

  if (shouldOpen) {
    detailFaqButton.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    item.classList.add("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePromotionDetail();
  }
});

if (missionsList) {
  setInterval(() => {
    const currentScrollLeft = missionsList.scrollLeft;

    renderMissions();
    missionsList.scrollLeft = currentScrollLeft;
  }, 60000);
}
