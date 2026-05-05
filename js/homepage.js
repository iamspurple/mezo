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

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-scroll-reveal");
  initScrollRevealHeadings();
  initNewsImagesReveal();
  initAboutStatisticsReveal();
});
