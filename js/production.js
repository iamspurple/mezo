const PRODUCTION_IO = {
  threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
  rootMargin: "0px",
};

const isReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initProductionHeadingReveal = () => {
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
  }, PRODUCTION_IO);

  headings.forEach((el) => observer.observe(el));
};

const initListReveal = (selector) => {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  elements.forEach((el, index) => {
    el.style.setProperty("--reveal-index", String(index % 8));
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
    }, PRODUCTION_IO);
    observer.observe(el);
  });
};

const initImagesReveal = () => {
  const wrappers = document.querySelectorAll("main .production-example-image");
  if (!wrappers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wrappers.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const imagesObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.12) {
          return;
        }
        entry.target.classList.add("is-visible");
        imagesObserver.unobserve(entry.target);
      });
    },
    {
      threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      rootMargin: "0px 0px -6% 0px",
    },
  );

  wrappers.forEach((el, index) => {
    el.style.setProperty("--images-index", String(index));
    imagesObserver.observe(el);
  });

  const flushVisibleImages = () => {
    imagesObserver.takeRecords().forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        entry.target.classList.add("is-visible");
        imagesObserver.unobserve(entry.target);
      }
    });

    wrappers.forEach((el) => {
      if (
        !el.classList.contains("is-visible") &&
        isElementRoughlyOnScreen(el)
      ) {
        el.classList.add("is-visible");
        imagesObserver.unobserve(el);
      }
    });
  };

  requestAnimationFrame(flushVisibleImages);
  window.addEventListener("load", flushVisibleImages, { once: true });
  window.addEventListener("pageshow", flushVisibleImages, { once: true });
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-production-scroll-reveal");
  initProductionHeadingReveal();
  initListReveal(
    "main .production-block1-content > p, main .production-block1-item, main .production-block2-content p",
  );
  initImagesReveal();

  setTimeout(() => {
    document
      .querySelectorAll(
        "main .scroll-reveal-heading:not(.is-visible), main .production-block1-content > p:not(.is-visible), main .production-block1-item:not(.is-visible), main .production-block2-content p:not(.is-visible), main .production-example-image:not(.is-visible)",
      )
      .forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add("is-visible");
      });
  }, 350);
});
