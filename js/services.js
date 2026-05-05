const SERVICE_IMAGE_SECTIONS = [
  {
    section: ".services",
    containers: ".services-images-container",
    items: ".services-images-item",
    accordions: ".services-accordion",
    imagesWrapper: ".services-images-wrapper",
  },
  {
    section: ".other-services",
    containers: ".other-services-images-container",
    items: ".other-services-images-item",
    accordions: ".other-services-accordion",
    imagesWrapper: ".other-services-images-wrapper",
  },
];

const isHoverDevice = () => window.matchMedia("(hover: hover)").matches;

const initServicesImagesForSection = (cfg) => {
  const servicesSection = document.querySelector(cfg.section);
  if (!servicesSection) return;

  const imageContainers = Array.from(
    servicesSection.querySelectorAll(cfg.containers),
  );
  const accordionItems = Array.from(
    servicesSection.querySelectorAll(cfg.accordions),
  );
  if (!imageContainers.length) return;

  const VISIBILITY_THRESHOLD = 0.3;
  const ITEM_DELAY_MS = 220;
  const REVEAL_DURATION_S = 0.95;
  const HIDE_DURATION_S = 0.88;
  const INTERSECTION_THRESHOLDS = [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1];

  let containerZIndexCounter = 1;

  const setItemsHiddenInstantly = (container) => {
    container.querySelectorAll(cfg.items).forEach((item) => {
      item.style.transition = "none";
      item.style.transitionDelay = "0ms";
      item.style.opacity = "0";
      item.style.transform = "scale(0)";
    });
  };

  const revealItemsSequentially = (container) => {
    const items = container.querySelectorAll(cfg.items);
    if (!items.length) return;

    items.forEach((item, index) => {
      item.style.transition = `opacity ${REVEAL_DURATION_S}s ease, transform ${REVEAL_DURATION_S}s cubic-bezier(0.34, 1.02, 0.64, 1)`;
      item.style.transitionDelay = `${index * ITEM_DELAY_MS}ms`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((item) => {
          item.style.opacity = "1";
          item.style.transform = "scale(1)";
        });
      });
    });
  };

  const hideActiveItemsBelowVisibility = () => {
    const activeContainer = servicesSection.querySelector(
      `${cfg.containers}.active`,
    );
    if (!activeContainer) return;

    const items = activeContainer.querySelectorAll(cfg.items);
    if (!items.length) return;

    items.forEach((item, index) => {
      item.style.transition = `opacity ${HIDE_DURATION_S}s ease, transform ${HIDE_DURATION_S}s cubic-bezier(0.45, 0, 0.55, 1)`;
      item.style.transitionDelay = `${index * ITEM_DELAY_MS}ms`;
    });

    requestAnimationFrame(() => {
      items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "scale(0)";
      });
    });
  };

  const setActiveContainer = (name) => {
    const target =
      imageContainers.find((c) => c.dataset.name === name) ||
      imageContainers.find((c) => c.dataset.name === "default");

    if (!target) return;

    imageContainers.forEach((container) => {
      const isTarget = container === target;
      container.classList.toggle("active", isTarget);
      if (!isTarget) setItemsHiddenInstantly(container);
    });

    containerZIndexCounter += 1;
    target.style.zIndex = String(containerZIndexCounter);
    setItemsHiddenInstantly(target);
    void target.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => revealItemsSequentially(target));
    });
  };

  // Инициализация: скрыть все, активировать начальный контейнер
  const initialContainer =
    imageContainers.find((c) => c.classList.contains("active")) ||
    imageContainers.find((c) => c.dataset.name === "default") ||
    imageContainers[0];

  imageContainers.forEach((container) => {
    container.classList.toggle("active", container === initialContainer);
    container.style.zIndex = "1";
    container.querySelectorAll(cfg.items).forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "scale(0)";
    });
  });

  if (initialContainer) {
    containerZIndexCounter = 2;
    initialContainer.style.zIndex = String(containerZIndexCounter);
  }

  // Visibility observer: показывать/скрывать при скролле
  const servicesImagesWrapper =
    servicesSection.querySelector(cfg.imagesWrapper) || servicesSection;

  let viewportImagesShown = false;

  const applyVisibilityFromRatio = (ratio) => {
    const shouldShow = ratio >= VISIBILITY_THRESHOLD;
    if (shouldShow && !viewportImagesShown) {
      viewportImagesShown = true;
      const activeContainer = servicesSection.querySelector(
        `${cfg.containers}.active`,
      );
      if (!activeContainer) return;
      setItemsHiddenInstantly(activeContainer);
      void activeContainer.offsetHeight;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => revealItemsSequentially(activeContainer));
      });
    } else if (!shouldShow && viewportImagesShown) {
      viewportImagesShown = false;
      hideActiveItemsBelowVisibility();
    }
  };

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === servicesImagesWrapper) {
          applyVisibilityFromRatio(entry.intersectionRatio);
        }
      });
    },
    { threshold: INTERSECTION_THRESHOLDS, rootMargin: "0px" },
  );
  visibilityObserver.observe(servicesImagesWrapper);

  // Навешивание событий на аккордеоны
  accordionItems.forEach((accordion) => {
    const summary = accordion.querySelector("summary");
    if (!summary) return;

    const name = accordion.dataset.name;
    if (!name || name === "default") return;

    if (isHoverDevice()) {
      // Desktop: hover открывает <details> через публичный API accordion.js
      // и переключает картинки. При уходе — закрывает и возвращает default.
      accordion.addEventListener("mouseenter", () => {
        setActiveContainer(name);
        accordion.dispatchEvent(
          new CustomEvent("accordion:open", { bubbles: false }),
        );
      });

      accordion.addEventListener("mouseleave", () => {
        setActiveContainer("default");
        accordion.dispatchEvent(
          new CustomEvent("accordion:close", { bubbles: false }),
        );
      });
    } else {
      // Mobile: click на <summary> (до открытия <details>)
      summary.addEventListener("click", () => {
        if (!accordion.hasAttribute("open")) {
          setActiveContainer(name);
        }
      });

      // Когда все закрыты — вернуть default
      accordion.addEventListener("toggle", () => {
        const hasOpen = accordionItems.some((a) => a.hasAttribute("open"));
        if (!hasOpen) setActiveContainer("default");
      });
    }
  });
};

const initServicesImages = () => {
  SERVICE_IMAGE_SECTIONS.forEach(initServicesImagesForSection);
};

document.addEventListener("DOMContentLoaded", () => {
  initServicesImages();
});
