const isHoverDevice = () => window.matchMedia("(hover: hover)").matches;
const isReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ABOUT_IO = {
  threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
  rootMargin: "0px",
};

const initRevealObserver = (elements) => {
  if (!elements.length) return;

  if (isReducedMotion() || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, ABOUT_IO);

  elements.forEach((element) => observer.observe(element));
};

const initAboutHeadingReveal = () => {
  const headings = document.querySelectorAll(
    "main h1, main h2, main h3, main h4, main .title-medium, main .title-large-to-medium",
  );

  if (!headings.length) return;

  headings.forEach((heading) => {
    heading.classList.add("scroll-reveal-heading");
  });

  if (isReducedMotion()) {
    headings.forEach((heading) => heading.classList.add("is-visible"));
    return;
  }

  headings.forEach((heading) => {
    if (heading.querySelector(".scroll-reveal-word")) return;

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
      if (index < words.length - 1) {
        heading.appendChild(document.createTextNode(" "));
      }
    });
  });

  initRevealObserver([...headings]);
};

const initListReveal = (selector) => {
  const items = document.querySelectorAll(selector);
  if (!items.length) return;

  items.forEach((item, index) => {
    item.classList.add("scroll-reveal-item");
    item.style.setProperty("--reveal-index", String(index % 8));
  });

  initRevealObserver([...items]);
};

const initImagesReveal = () => {
  const images = document.querySelectorAll(
    "main .directions-image, main .chronology-images, main .photo figure",
  );
  if (!images.length) return;

  images.forEach((image, index) => {
    image.classList.add("scroll-reveal-image");
    image.style.setProperty("--images-index", String(index));
  });

  initRevealObserver([...images]);
};

const flushAboutReveal = () => {
  document
    .querySelectorAll(
      "main .scroll-reveal-heading:not(.is-visible), main .scroll-reveal-item:not(.is-visible), main .scroll-reveal-image:not(.is-visible)",
    )
    .forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add("is-visible");
    });
};

const initAboutItemReveal = () => {
  initListReveal(
    "main .directions-item, main .chronology-item, main .main-message-content p, main .directions-text",
  );
};

const initChronology = () => {
  const chronologyWrapper = document.querySelector(".chronology-wrapper");

  if (!chronologyWrapper) {
    return;
  }

  const chronologyItems = [
    ...chronologyWrapper.querySelectorAll(".chronology-item[data-year]"),
  ];
  const chronologyParagraphs = [
    ...chronologyWrapper.querySelectorAll(".chronology-content [data-year]"),
  ];
  const chronologyImages = [
    ...chronologyWrapper.querySelectorAll(".chronology-images [data-year]"),
  ];

  if (
    !chronologyItems.length ||
    !chronologyParagraphs.length ||
    !chronologyImages.length
  ) {
    return;
  }

  const defaultYear = "2015";

  const setActiveYear = (year) => {
    chronologyItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.year === year);
    });

    chronologyParagraphs.forEach((paragraph) => {
      paragraph.classList.toggle("active", paragraph.dataset.year === year);
    });

    chronologyImages.forEach((image) => {
      image.classList.toggle("active", image.dataset.year === year);
    });
  };

  chronologyItems.forEach((item) => {
    if (!item.hasAttribute("tabindex")) {
      item.setAttribute("tabindex", "0");
    }

    if (isHoverDevice()) {
      item.addEventListener("mouseenter", () => {
        setActiveYear(item.dataset.year);
      });

      item.addEventListener("mouseleave", () => {
        setActiveYear(defaultYear);
      });
    } else {
      item.addEventListener("click", () => {
        setActiveYear(item.dataset.year);
      });
    }

    item.addEventListener("focus", () => {
      setActiveYear(item.dataset.year);
    });
  });

  setActiveYear(defaultYear);
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-about-scroll-reveal");
  initAboutHeadingReveal();
  initAboutItemReveal();
  initImagesReveal();
  initChronology();

  setTimeout(flushAboutReveal, 350);
});
