const isElementRoughlyOnScreen = (el) => {
  const rect = el.getBoundingClientRect();
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const margin = 36;
  return rect.bottom > margin && rect.top < vh - margin;
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
        if (!entry.isIntersecting || entry.intersectionRatio < 0.12) {
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

  const flushVisibleHeadings = () => {
    headingObserver.takeRecords().forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        entry.target.classList.add("is-visible");
        headingObserver.unobserve(entry.target);
      }
    });

    headings.forEach((heading) => {
      if (
        !heading.classList.contains("is-visible") &&
        isElementRoughlyOnScreen(heading)
      ) {
        heading.classList.add("is-visible");
        headingObserver.unobserve(heading);
      }
    });
  };

  requestAnimationFrame(flushVisibleHeadings);
  window.addEventListener("load", flushVisibleHeadings, { once: true });
  window.addEventListener("pageshow", flushVisibleHeadings, { once: true });
};

const initImagesReveal = () => {
  const wrappers = document.querySelectorAll(
    ".presentation-images > div, .presentation-image, .hero-image",
  );
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

const initTextReveal = () => {
  const textWrappers = document.querySelectorAll(".scroll-reveal-text");
  if (!textWrappers.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const revealParagraphs = (wrapper) => {
    const texts = wrapper.querySelectorAll("p.scroll-reveal-text-item");
    texts.forEach((text, index) => {
      const delay = reducedMotion ? 0 : index * 500;
      setTimeout(() => {
        text.classList.add("is-visible");
      }, delay);
    });
  };

  textWrappers.forEach((wrapper) => {
    const texts = wrapper.querySelectorAll("p");
    texts.forEach((text, index) => {
      text.classList.add("scroll-reveal-text-item");
      text.style.setProperty("--text-index", String(index));
    });
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    textWrappers.forEach((wrapper) => revealParagraphs(wrapper));
    return;
  }

  const textObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
        revealParagraphs(entry.target);
        textObserver.unobserve(entry.target);
      });
    },
    {
      threshold: [0, 0.2, 0.4, 0.6, 1],
      rootMargin: "0px 0px -8% 0px",
    },
  );

  textWrappers.forEach((wrapper) => textObserver.observe(wrapper));

  const flushVisibleText = () => {
    textObserver.takeRecords().forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;
      revealParagraphs(entry.target);
      textObserver.unobserve(entry.target);
    });

    textWrappers.forEach((wrapper) => {
      if (isElementRoughlyOnScreen(wrapper)) {
        revealParagraphs(wrapper);
        textObserver.unobserve(wrapper);
      }
    });
  };

  requestAnimationFrame(flushVisibleText);
  window.addEventListener("load", flushVisibleText, { once: true });
  window.addEventListener("pageshow", flushVisibleText, { once: true });
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-scroll-reveal");
  initScrollRevealHeadings();
  initImagesReveal();
  initTextReveal();
});
