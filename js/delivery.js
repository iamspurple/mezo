const DELIVERY_IO = {
  threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
  rootMargin: "0px",
};

const isReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initDeliveryHeadingReveal = () => {
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
  }, DELIVERY_IO);

  headings.forEach((el) => observer.observe(el));
};

const initListReveal = (selector) => {
  document.querySelectorAll(selector).forEach((el) => {
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
    }, DELIVERY_IO);
    observer.observe(el);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-delivery-scroll-reveal");
  initDeliveryHeadingReveal();
  initListReveal("main .companies-list");
  // Страховка для edge cases (вкладка была фоновой и т.п.)
  setTimeout(() => {
    document
      .querySelectorAll(
        "main .scroll-reveal-heading:not(.is-visible), main .companies-list:not(.is-visible)",
      )
      .forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add("is-visible");
      });
  }, 350);
});
