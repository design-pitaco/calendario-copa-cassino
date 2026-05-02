const promotions = Array.isArray(window.COPA_PROMOTIONS) ? window.COPA_PROMOTIONS : [];
const missions = Array.isArray(window.COPA_MISSIONS) ? window.COPA_MISSIONS : [];
const featuredPromoSection = document.querySelector("[data-featured-promo-section]");
const featuredPromoRoot = document.querySelector("[data-featured-promo]");
const promosDescription = document.querySelector("[data-promos-description]");
const promosList = document.querySelector("[data-promos-list]");
const missionsList = document.querySelector("[data-missions-list]");
const themePreferenceQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
const saoPauloDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo"
});
const dayMs = 24 * 60 * 60 * 1000;
let promotionCountdownTimeoutId;

function getThemeParam() {
  const themeParam = new URLSearchParams(window.location.search).get("theme");

  return themeParam === "light" || themeParam === "dark" ? themeParam : null;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getItemStart(item) {
  return new Date(`${item.startDate}T00:00:00-03:00`);
}

function getItemEnd(item) {
  return new Date(`${item.endDate}T23:59:59-03:00`);
}

function getItemStatus(item, now = new Date()) {
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

function getPromotionStatus(promotion, now = new Date()) {
  return getItemStatus(promotion, now);
}

function formatDate(date) {
  return saoPauloDateFormatter.format(date);
}

function formatPromotionPeriod(promotion) {
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

function formatRemainingTime(targetDate, now = new Date()) {
  const timeLeft = targetDate.getTime() - now.getTime();

  if (timeLeft <= dayMs) {
    return formatClockCountdown(timeLeft);
  }

  const daysLeft = Math.ceil(timeLeft / dayMs);

  return `${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`;
}

function getStatusViewModel(promotion, now = new Date()) {
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

function getPrimaryButton(promotion, status, classPrefix) {
  const className = `${classPrefix}__button`;

  if (status === "active" && promotion.playUrl) {
    return `<a class="${className} ${className}--primary" href="${escapeHtml(promotion.playUrl)}">Jogar Agora</a>`;
  }

  if (status === "upcoming") {
    return `<span class="${className} ${className}--soon" aria-disabled="true">Em Breve</span>`;
  }

  return `<span class="${className} ${className}--ended" aria-disabled="true">Finalizada</span>`;
}

function getSecondaryButton(promotion, classPrefix) {
  if (!promotion.rulesUrl) {
    return "";
  }

  return `<a class="${classPrefix}__button ${classPrefix}__button--secondary" href="${escapeHtml(promotion.rulesUrl)}">Saiba Mais</a>`;
}

function getMissionButton(mission, status) {
  const className = "mission-card__button";

  if (status === "active") {
    if (mission.playUrl) {
      return `<a class="${className} ${className}--primary" href="${escapeHtml(mission.playUrl)}">Jogar</a>`;
    }

    return `<span class="${className} ${className}--primary" aria-disabled="true">Jogar</span>`;
  }

  if (status === "upcoming") {
    return `<span class="${className} ${className}--soon" aria-disabled="true">Em Breve</span>`;
  }

  return `<span class="${className} ${className}--ended" aria-disabled="true">Finalizada</span>`;
}

function getFeaturedPromotion(now = new Date()) {
  const tournaments = promotions
    .filter((promotion) => promotion.type === "tournament")
    .sort((first, second) => getPromotionStart(first) - getPromotionStart(second));
  const activeTournament = tournaments.find((promotion) => getPromotionStatus(promotion, now) === "active");

  if (activeTournament) {
    return activeTournament;
  }

  return tournaments.find((promotion) => getPromotionStatus(promotion, now) === "upcoming") || tournaments[tournaments.length - 1];
}

function getSortedMissions(now = new Date()) {
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

function getSortedPromotions(featuredPromotion, now = new Date()) {
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

      const firstActivePrizeDrop = first.promotion.type === "prizeDrop" && first.status === "active";
      const secondActivePrizeDrop = second.promotion.type === "prizeDrop" && second.status === "active";

      if (firstActivePrizeDrop !== secondActivePrizeDrop) {
        return firstActivePrizeDrop ? -1 : 1;
      }

      if (firstEnded && secondEnded) {
        return getPromotionEnd(first.promotion) - getPromotionEnd(second.promotion);
      }

      return getPromotionStart(first.promotion) - getPromotionStart(second.promotion);
    })
    .map(({ promotion }) => promotion);
}

function renderMissionCard(mission, now = new Date()) {
  const status = getItemStatus(mission, now);

  return `
    <article class="mission-card">
      <div class="mission-card__media">
        <img class="mission-card__image" src="${escapeHtml(mission.image)}" alt="${escapeHtml(mission.imageAlt || "")}">
      </div>

      <div class="mission-card__content">
        <p class="mission-card__text">${escapeHtml(mission.text)}</p>
        ${getMissionButton(mission, status)}
      </div>
    </article>
  `;
}

function renderMissions(now = new Date()) {
  if (!missionsList) {
    return;
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
  const tournamentLabel = tournamentCount === 1 ? "Torneio" : "Torneios";
  const prizeDropLabel = prizeDropCount === 1 ? "Prize Drop" : "Prize Drops";

  promosDescription.textContent = `São ${tournamentCount} ${tournamentLabel} e ${prizeDropCount} ${prizeDropLabel} para você ganhar prêmios durante toda a Copa do Mundo. Aproveite!!!`;
}

renderMissions();

function renderFeaturedPromotion(promotion, now = new Date()) {
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
  const gamesMarkup = games
    .map((game) => `<img class="featured-promo__game" src="${escapeHtml(game.src)}" alt="${escapeHtml(game.alt || "")}">`)
    .join("");

  featuredPromoSection.hidden = false;
  featuredPromoRoot.innerHTML = `
    <div class="featured-promo">
      <div class="featured-promo__header">
        <div class="featured-promo__heading">
          <img class="featured-promo__icon" src="images/icon-promocao-destaque.png" alt="">
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

      <div class="featured-promo__games" aria-label="Jogos da promoção">
        ${gamesMarkup}
      </div>

      <div class="featured-promo__actions">
        ${getPrimaryButton(promotion, statusViewModel.status, "featured-promo")}
        ${getSecondaryButton(promotion, "featured-promo")}
      </div>
    </div>
  `;
}

function renderPromotionCard(promotion, index, now = new Date()) {
  const statusViewModel = getStatusViewModel(promotion, now);
  const cardClass = getStatusCardClass(statusViewModel.status);
  const brandClass = promotion.providerLogoClass ? ` ${promotion.providerLogoClass}` : "";

  return `
    <article class="upcoming-promo-card ${cardClass}" style="z-index: ${index + 1}">
      <img class="upcoming-promo-card__background" src="${escapeHtml(promotion.backgroundImage)}" alt="">

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

function renderPromotionSections(now = new Date()) {
  const featuredPromotion = getFeaturedPromotion(now);
  const sortedPromotions = getSortedPromotions(featuredPromotion, now);

  renderPromosDescription();
  renderFeaturedPromotion(featuredPromotion, now);

  if (promosList) {
    promosList.innerHTML = sortedPromotions
      .map((promotion, index) => renderPromotionCard(promotion, index, now))
      .join("");
  }
}

function updatePromotionTimers() {
  const now = new Date();
  let shouldRenderSections = false;

  document.querySelectorAll("[data-promo-timer]").forEach((element) => {
    const promotion = promotions.find((currentPromotion) => currentPromotion.id === element.dataset.promoTimer);

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
    document.querySelectorAll(".featured-promo__games").forEach(setupDraggableCarousel);
    window.dispatchEvent(new CustomEvent("promotionsrendered"));
  }
}

renderPromotionSections();

function getPromotionTimerDelay(now = new Date()) {
  let hasPendingTimer = false;
  let needsSecondPrecision = false;

  document.querySelectorAll("[data-promo-timer]").forEach((element) => {
    const promotion = promotions.find((currentPromotion) => currentPromotion.id === element.dataset.promoTimer);

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

document.querySelectorAll(".featured-promo__games, .missions__grid").forEach(setupDraggableCarousel);

if (missionsList) {
  setInterval(() => {
    const currentScrollLeft = missionsList.scrollLeft;

    renderMissions();
    missionsList.scrollLeft = currentScrollLeft;
  }, 60000);
}

document.querySelectorAll(".faq").forEach((faq) => {
  const items = faq.querySelectorAll(".faq__item");

  items.forEach((item) => {
    const button = item.querySelector(".faq__button");
    const panel = item.querySelector(".faq__panel");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", () => {
      const shouldOpen = button.getAttribute("aria-expanded") !== "true";

      items.forEach((currentItem) => {
        const currentButton = currentItem.querySelector(".faq__button");
        const currentPanel = currentItem.querySelector(".faq__panel");

        if (!currentButton || !currentPanel) {
          return;
        }

        currentButton.setAttribute("aria-expanded", "false");
        currentPanel.hidden = true;
        currentItem.classList.remove("is-open");
      });

      if (shouldOpen) {
        button.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        item.classList.add("is-open");
      }
    });
  });
});
