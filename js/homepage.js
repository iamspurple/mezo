const createRevealObserver = (
  { minRatio = 0.1, rootMargin = "0px 0px -7% 0px" },
  onVisible,
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < minRatio) return;
        onVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1], rootMargin },
  );
  return observer;
};

const initScrollRevealHeadings = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const headings = document.querySelectorAll("main .scroll-reveal-heading");
  if (!headings.length) return;

  headings.forEach((heading) => {
    const words = heading.textContent
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);
    if (!words.length) return;
    heading.textContent = "";
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "scroll-reveal-word";
      span.style.setProperty("--word-index", String(index));
      span.textContent = word;
      heading.appendChild(span);
      if (index < words.length - 1)
        heading.appendChild(document.createTextNode(" "));
    });
  });

  const observer = createRevealObserver(
    { minRatio: 0.12, rootMargin: "0px 0px -7% 0px" },
    (el) => el.classList.add("is-visible"),
  );
  headings.forEach((el) => observer.observe(el));
};

const initNewsImagesReveal = () => {
  const wrappers = document.querySelectorAll("main .news .news-item-image");
  if (!wrappers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wrappers.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = createRevealObserver(
    { minRatio: 0.12, rootMargin: "0px 0px -6% 0px" },
    (el) => el.classList.add("is-visible"),
  );
  wrappers.forEach((el, index) => {
    el.style.setProperty("--news-item-index", String(index));
    observer.observe(el);
  });
};

const initCategoriesImagesReveal = () => {
  const wrappers = document.querySelectorAll(
    "main .categories .categories-item-image",
  );
  if (!wrappers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wrappers.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = createRevealObserver(
    { minRatio: 0.12, rootMargin: "0px 0px -6% 0px" },
    (el) => el.classList.add("is-visible"),
  );
  wrappers.forEach((el, index) => {
    el.style.setProperty("--news-item-index", String(index));
    observer.observe(el);
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

  const observer = createRevealObserver(
    { minRatio: 0.1, rootMargin: "0px 0px -8% 0px" },
    (el) => el.classList.add("is-visible"),
  );
  observer.observe(list);
};

const initCategoriesSticky = () => {
  const section = document.querySelector("main .categories");
  if (!section) return;

  const items = Array.from(section.querySelectorAll(".categories-item"));
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const list = section.querySelector(".categories-list");
  const header = document.querySelector("header, .header");
  // On mobile the categories block is a plain static list with every item
  // already revealed — no sticky/scroll-driven behavior.
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  let ticking = false;
  let activeIndex = -1;
  let offsetInitialized = false;
  // Top offset (relative to the list) of each item while collapsed. Measured
  // from the fully-collapsed layout so it stays stable during expand/collapse
  // transitions.
  let collapsedTops = [];

  const isColumn = () => getComputedStyle(list).flexDirection === "column";

  const measure = () => {
    const active = section.querySelector(".categories-item.is-active");
    // Freeze transitions so the active item collapses instantly; otherwise its
    // 0.8s expand/collapse animation inflates the offsetTop of the items below
    // it and the measured tops come out too large, which makes later categories
    // over-translate and drift upward.
    items.forEach((item) => (item.style.transition = "none"));
    if (active) active.classList.remove("is-active");
    void list.offsetHeight;
    collapsedTops = items.map((item) => item.offsetTop);
    if (active) active.classList.add("is-active");
    void list.offsetHeight;
    items.forEach((item) => (item.style.transition = ""));
  };

  // On mobile the pinned block is taller than the viewport, so translate the
  // list to keep the active (expanded) category in view at the top.
  const applyOffset = () => {
    if (!isColumn()) {
      list.style.transform = "";
      return;
    }
    const gap = (header ? header.offsetHeight : 0) + 16;
    const y = Math.round(gap - (collapsedTops[activeIndex] || 0));
    if (!offsetInitialized) {
      // Position instantly the first time so the list doesn't slide in when the
      // page loads already scrolled into the section.
      list.style.transition = "none";
      list.style.transform = `translateY(${y}px)`;
      void list.offsetHeight;
      list.style.transition = "";
      offsetInitialized = true;
    } else {
      list.style.transform = `translateY(${y}px)`;
    }
  };

  const update = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const track = section.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(track, 0));
    const progress = track > 0 ? scrolled / track : 0;
    const index = Math.min(
      items.length - 1,
      Math.floor(progress * items.length),
    );
    if (index !== activeIndex) {
      activeIndex = index;
      items.forEach((item, i) =>
        item.classList.toggle("is-active", i === index),
      );
    }
    applyOffset();
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  // Collapsed heights only change with viewport width (title wrapping). Skip
  // re-measuring on height-only resizes — on mobile those fire constantly as the
  // address bar shows/hides, and re-measuring mid-scroll (with a category
  // expanded) would corrupt the offsets.
  let lastWidth = window.innerWidth;
  const onResize = () => {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      measure();
    }
    onScroll();
  };

  let stickyActive = false;

  const enableSticky = () => {
    if (stickyActive) return;
    stickyActive = true;
    section.classList.add("categories--pinned");
    activeIndex = -1;
    offsetInitialized = false;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    measure();
    update();
  };

  const disableSticky = () => {
    if (!stickyActive) return;
    stickyActive = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    section.classList.remove("categories--pinned");
    // Clear inline styles left over from the scroll-driven layout so the static
    // mobile block renders cleanly.
    list.style.transform = "";
    list.style.transition = "";
    items.forEach((item) => {
      item.style.transition = "";
      item.classList.remove("is-active");
    });
  };

  // Enable sticky only above the mobile breakpoint, and switch modes whenever
  // the viewport crosses it.
  const syncMode = () => {
    if (mobileQuery.matches) {
      disableSticky();
    } else {
      enableSticky();
    }
  };

  window.addEventListener("resize", syncMode);
  syncMode();
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-scroll-reveal");
  initScrollRevealHeadings();
  initNewsImagesReveal();
  initAboutStatisticsReveal();
  initCategoriesSticky();
  initCategoriesImagesReveal();
});
