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
  const INTERSECTION_THRESHOLDS = Array.from(
    { length: 21 },
    (_, index) => index * 0.05,
  );

  let containerZIndexCounter = 1;

  const setItemsHiddenInstantly = (container) => {
    const items = container.querySelectorAll(cfg.items);
    items.forEach((item) => {
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
      imageContainers.find((container) => container.dataset.name === name) ||
      imageContainers.find((container) => container.dataset.name === "default");

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

  const hasOpenedAccordions = () =>
    accordionItems.some((accordion) => accordion.hasAttribute("open"));

  const initialContainer =
    imageContainers.find((container) =>
      container.classList.contains("active"),
    ) ||
    imageContainers.find((container) => container.dataset.name === "default") ||
    imageContainers[0];

  if (initialContainer) {
    imageContainers.forEach((container) => {
      container.classList.toggle("active", container === initialContainer);
      container.style.zIndex = "1";
      const items = container.querySelectorAll(cfg.items);
      items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "scale(0)";
      });
    });
    containerZIndexCounter = 2;
    initialContainer.style.zIndex = String(containerZIndexCounter);
  }

  const servicesImagesWrapper =
    servicesSection.querySelector(cfg.imagesWrapper) || servicesSection;

  const runViewportRevealForActiveContainer = () => {
    const activeContainer = servicesSection.querySelector(
      `${cfg.containers}.active`,
    );
    if (!activeContainer) return;
    setItemsHiddenInstantly(activeContainer);
    void activeContainer.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => revealItemsSequentially(activeContainer));
    });
  };

  let viewportImagesShown = false;

  const applyVisibilityFromRatio = (ratio) => {
    const shouldShow = ratio >= VISIBILITY_THRESHOLD;

    if (shouldShow && !viewportImagesShown) {
      viewportImagesShown = true;
      runViewportRevealForActiveContainer();
    } else if (!shouldShow && viewportImagesShown) {
      viewportImagesShown = false;
      hideActiveItemsBelowVisibility();
    }
  };

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== servicesImagesWrapper) return;
        applyVisibilityFromRatio(entry.intersectionRatio);
      });
    },
    { threshold: INTERSECTION_THRESHOLDS, rootMargin: "0px" },
  );
  visibilityObserver.observe(servicesImagesWrapper);

  requestAnimationFrame(() => {
    visibilityObserver.takeRecords().forEach((entry) => {
      if (entry.target !== servicesImagesWrapper) return;
      applyVisibilityFromRatio(entry.intersectionRatio);
    });
  });

  accordionItems.forEach((accordion) => {
    const summary = accordion.querySelector("summary");
    if (!summary) return;

    summary.addEventListener("click", () => {
      const name = accordion.dataset.name;
      if (!name || accordion.hasAttribute("open")) return;
      setActiveContainer(name);
    });

    accordion.addEventListener("toggle", () => {
      if (!hasOpenedAccordions()) {
        setActiveContainer("default");
      }
    });
  });
};

const initServicesImages = () => {
  SERVICE_IMAGE_SECTIONS.forEach(initServicesImagesForSection);
};

document.addEventListener("DOMContentLoaded", () => {
  initServicesImages();
});
