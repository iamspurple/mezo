const NEWS_IO = {
  threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
  rootMargin: "0px",
};

const isReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isElementRoughlyOnScreen = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.98 && rect.bottom > 0;
};

const initNewsHeadingReveal = () => {
  if (isReducedMotion()) return;

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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, NEWS_IO);

  headings.forEach((el) => observer.observe(el));
};

const initListReveal = (selector) => {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  elements.forEach((el, index) => {
    el.style.setProperty("--reveal-index", String(index % 10));
    if (isReducedMotion()) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, NEWS_IO);
    observer.observe(el);
  });
};

const initSequentialListReveal = (listSelector, itemSelector) => {
  const list = document.querySelector(listSelector);
  if (!list) return;

  const items = list.querySelectorAll(itemSelector);
  if (!items.length) return;

  if (isReducedMotion()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  let nextIndexToReveal = 0;
  let revealedCount = 0;
  let revealStep = 0;

  const revealReadyItemsInOrder = () => {
    while (nextIndexToReveal < items.length) {
      const item = items[nextIndexToReveal];
      if (!item || item.dataset.revealReady !== "true") break;

      item.style.setProperty("--reveal-index", "0");
      window.setTimeout(() => {
        item.classList.add("is-visible");
      }, revealStep * 90);

      item.dataset.revealDone = "true";
      nextIndexToReveal += 1;
      revealedCount += 1;
      revealStep += 1;
    }

    if (revealedCount === items.length) observer.disconnect();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      if (item.dataset.revealDone === "true") {
        observer.unobserve(item);
        return;
      }
      item.dataset.revealReady = "true";
      observer.unobserve(item);
    });
    revealReadyItemsInOrder();
  }, NEWS_IO);

  items.forEach((item) => observer.observe(item));
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-news-scroll-reveal");
  initNewsHeadingReveal();
  initSequentialListReveal("main .news-list", ".news-item");
  initListReveal(
    "main .post-description, main .post > p, main .post-preview, main .post-details-item, main .post-details-content > p, main .post-gallery-image, main .others-item",
  );

  const flushVisible = () => {
    document
      .querySelectorAll(
        "main .scroll-reveal-heading:not(.is-visible), main .news-item:not(.is-visible), main .post-description:not(.is-visible), main .post > p:not(.is-visible), main .post-preview:not(.is-visible), main .post-details-item:not(.is-visible), main .post-details-content > p:not(.is-visible), main .post-gallery-image:not(.is-visible), main .others-item:not(.is-visible)",
      )
      .forEach((el) => {
        if (isElementRoughlyOnScreen(el)) el.classList.add("is-visible");
      });
  };

  setTimeout(flushVisible, 350);
  requestAnimationFrame(flushVisible);
  window.addEventListener("load", flushVisible, { once: true });
  window.addEventListener("pageshow", flushVisible, { once: true });
});
