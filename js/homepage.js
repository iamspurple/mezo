const initCategoriesListHover = () => {
  const container = document.querySelector(".categories-list-container");
  if (!container) return;

  const items = container.querySelectorAll(".categories-item");
  const imageItems = container.querySelectorAll(".categories-image-item");

  const clearImageStates = () => {
    imageItems.forEach((el) => el.classList.remove("active", "inactive"));
  };

  items.forEach((item) => {
    const name = item.dataset.name;
    if (!name) return;

    item.addEventListener("mouseenter", () => {
      imageItems.forEach((img) => {
        img.classList.remove("active", "inactive");
        img.classList.add(img.dataset.name === name ? "active" : "inactive");
      });
    });

    item.addEventListener("mouseleave", clearImageStates);
  });
};

const initServicesImages = () => {
  const servicesSection = document.querySelector(".services");
  if (!servicesSection) return;

  const imageContainers = Array.from(
    servicesSection.querySelectorAll(".services-images-container"),
  );
  const accordionItems = Array.from(
    servicesSection.querySelectorAll(".services-accordion"),
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
    const items = container.querySelectorAll(".services-images-item");
    items.forEach((item) => {
      item.style.transition = "none";
      item.style.transitionDelay = "0ms";
      item.style.opacity = "0";
      item.style.transform = "scale(0)";
    });
  };

  const revealItemsSequentially = (container) => {
    const items = container.querySelectorAll(".services-images-item");
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
      ".services-images-container.active",
    );
    if (!activeContainer) return;

    const items = activeContainer.querySelectorAll(".services-images-item");
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
      const items = container.querySelectorAll(".services-images-item");
      items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "scale(0)";
      });
    });
    containerZIndexCounter = 2;
    initialContainer.style.zIndex = String(containerZIndexCounter);
  }

  const servicesImagesWrapper =
    servicesSection.querySelector(".services-images-wrapper") || servicesSection;

  const runViewportRevealForActiveContainer = () => {
    const activeContainer = servicesSection.querySelector(
      ".services-images-container.active",
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

const initScrollRevealHeadings = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const headings = document.querySelectorAll("main .scroll-reveal-heading");
  if (!headings.length) return;

  headings.forEach((heading) => {
    const text = heading.textContent.replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter(Boolean);
    if (!words.length) return;

    heading.textContent = "";
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "scroll-reveal-word";
      span.style.setProperty("--word-index", String(index));
      span.textContent = word;
      heading.appendChild(span);
      if (index < words.length - 1) {
        heading.appendChild(document.createTextNode(" "));
      }
    });
  });

  const headingObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          !entry.isIntersecting ||
          entry.intersectionRatio < 0.12
        ) {
          return;
        }
        entry.target.classList.add("is-visible");
        headingObserver.unobserve(entry.target);
      });
    },
    {
      threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      rootMargin: "0px 0px -7% 0px",
    },
  );

  headings.forEach((heading) => headingObserver.observe(heading));

  requestAnimationFrame(() => {
    headingObserver.takeRecords().forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        entry.target.classList.add("is-visible");
        headingObserver.unobserve(entry.target);
      }
    });
  });
};

const initNewsImagesReveal = () => {
  const wrappers = document.querySelectorAll("main .news .news-item-image");
  if (!wrappers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wrappers.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const newsImgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.12) {
          return;
        }
        entry.target.classList.add("is-visible");
        newsImgObserver.unobserve(entry.target);
      });
    },
    {
      threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      rootMargin: "0px 0px -6% 0px",
    },
  );

  wrappers.forEach((el, index) => {
    el.style.setProperty("--news-item-index", String(index));
    newsImgObserver.observe(el);
  });

  requestAnimationFrame(() => {
    newsImgObserver.takeRecords().forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        entry.target.classList.add("is-visible");
        newsImgObserver.unobserve(entry.target);
      }
    });
  });
};

const initAboutStatisticsReveal = () => {
  const list = document.querySelector(
    "main .about-statistic-list.scroll-reveal-statistics",
  );
  if (!list) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    list.classList.add("is-visible");
    return;
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.1) {
          return;
        }
        entry.target.classList.add("is-visible");
        statsObserver.unobserve(entry.target);
      });
    },
    {
      threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      rootMargin: "0px 0px -8% 0px",
    },
  );

  statsObserver.observe(list);

  requestAnimationFrame(() => {
    statsObserver.takeRecords().forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
        entry.target.classList.add("is-visible");
        statsObserver.unobserve(entry.target);
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-scroll-reveal");
  initCategoriesListHover();
  initServicesImages();
  initScrollRevealHeadings();
  initNewsImagesReveal();
  initAboutStatisticsReveal();
});
