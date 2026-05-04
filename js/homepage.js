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
  initScrollRevealHeadings();
  initNewsImagesReveal();
  initAboutStatisticsReveal();
});
