const DELIVERY_IO = {
  threshold: Array.from({ length: 21 }, (_, index) => index * 0.05),
  rootMargin: "0px",
};

const isElementRoughlyOnScreen = (el) => {
  const rect = el.getBoundingClientRect();
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const margin = 40;
  return rect.bottom > margin && rect.top < vh - margin;
};

const runReflowThenReveal = (el, pendingSet, onReveal) => {
  if (!el || el.classList.contains("is-visible")) return;
  if (pendingSet.has(el)) return;
  pendingSet.add(el);
  void el.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      onReveal(el);
      pendingSet.delete(el);
    });
  });
};

const companiesListRevealPending = new WeakSet();

const applyCompaniesListVisible = (listEl) => {
  runReflowThenReveal(listEl, companiesListRevealPending, (list) => {
    list.classList.add("is-visible");
  });
};

const flushDeliveryRevealFallback = () => {
  document.querySelectorAll("main .scroll-reveal-heading:not(.is-visible)").forEach((el) => {
    if (isElementRoughlyOnScreen(el)) {
      el.classList.add("is-visible");
    }
  });

  document.querySelectorAll("main .companies-list:not(.is-visible)").forEach((el) => {
    if (isElementRoughlyOnScreen(el)) {
      applyCompaniesListVisible(el);
    }
  });
};

let flushDeliveryFallbackRaf = 0;
const scheduleDeliveryRevealFallback = () => {
  cancelAnimationFrame(flushDeliveryFallbackRaf);
  flushDeliveryFallbackRaf = requestAnimationFrame(flushDeliveryRevealFallback);
};

const initCompaniesListReveal = (listEl) => {
  if (!listEl) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    listEl.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        applyCompaniesListVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    DELIVERY_IO,
  );

  observer.observe(listEl);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      observer.takeRecords().forEach((entry) => {
        if (entry.isIntersecting) {
          applyCompaniesListVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
      document.querySelectorAll("main .companies-list:not(.is-visible)").forEach((el) => {
        if (isElementRoughlyOnScreen(el)) {
          applyCompaniesListVisible(el);
        }
      });
    });
  });
};

const initDeliveryHeadingReveal = () => {
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
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        headingObserver.unobserve(entry.target);
      });
    },
    DELIVERY_IO,
  );

  headings.forEach((heading) => headingObserver.observe(heading));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      headingObserver.takeRecords().forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          headingObserver.unobserve(entry.target);
        }
      });
      flushDeliveryRevealFallback();
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-delivery-scroll-reveal");

  initDeliveryHeadingReveal();

  initCompaniesListReveal(document.querySelector("main .companies-list"));

  window.addEventListener("scroll", scheduleDeliveryRevealFallback, { passive: true });
  window.addEventListener("resize", scheduleDeliveryRevealFallback);
  setTimeout(flushDeliveryRevealFallback, 320);
});
