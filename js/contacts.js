const CONTACTS_IO = {
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

const teamListRevealPending = new WeakSet();

/** Список команды — при входе в viewport или уже видим при загрузке */
const applyTeamListVisible = (listEl) => {
  runReflowThenReveal(listEl, teamListRevealPending, (list) => {
    list.classList.add("is-visible");
  });
};

const flushRevealFallback = () => {
  document
    .querySelectorAll("main .scroll-reveal-heading:not(.is-visible)")
    .forEach((el) => {
      if (isElementRoughlyOnScreen(el)) {
        el.classList.add("is-visible");
      }
    });

  document.querySelectorAll("main .team-list:not(.is-visible)").forEach((el) => {
    if (isElementRoughlyOnScreen(el)) {
      applyTeamListVisible(el);
    }
  });
};

let flushFallbackRaf = 0;
const scheduleRevealFallback = () => {
  cancelAnimationFrame(flushFallbackRaf);
  flushFallbackRaf = requestAnimationFrame(flushRevealFallback);
};

const initTeamListReveal = (teamList) => {
  if (!teamList) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    teamList.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        applyTeamListVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    CONTACTS_IO,
  );

  observer.observe(teamList);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      observer.takeRecords().forEach((entry) => {
        if (entry.isIntersecting) {
          applyTeamListVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
      document.querySelectorAll("main .team-list:not(.is-visible)").forEach((el) => {
        if (isElementRoughlyOnScreen(el)) {
          applyTeamListVisible(el);
        }
      });
    });
  });
};

const initContactsHeadingReveal = () => {
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
    CONTACTS_IO,
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
      flushRevealFallback();
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-contacts-scroll-reveal");

  initContactsHeadingReveal();

  const teamList = document.querySelector("main .team-list");
  initTeamListReveal(teamList);

  window.addEventListener("scroll", scheduleRevealFallback, { passive: true });
  window.addEventListener("resize", scheduleRevealFallback);
  setTimeout(flushRevealFallback, 320);
});
