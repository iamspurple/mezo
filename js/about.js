const isHoverDevice = () => window.matchMedia("(hover: hover)").matches;

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
  let resetToDefaultTimeoutId = null;

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

  const scheduleDefaultYearRestore = () => {
    if (resetToDefaultTimeoutId) {
      clearTimeout(resetToDefaultTimeoutId);
    }

    resetToDefaultTimeoutId = setTimeout(() => {
      setActiveYear(defaultYear);
    }, 10000);
  };

  chronologyItems.forEach((item) => {
    if (!item.hasAttribute("tabindex")) {
      item.setAttribute("tabindex", "0");
    }

    if (isHoverDevice()) {
      item.addEventListener("mouseenter", () => {
        setActiveYear(item.dataset.year);
        scheduleDefaultYearRestore();
      });

      item.addEventListener("mouseleave", () => {
        setActiveYear(null);
        scheduleDefaultYearRestore();
      });
    } else {
      item.addEventListener("click", () => {
        setActiveYear(item.dataset.year);
        scheduleDefaultYearRestore();
      });
    }

    item.addEventListener("focus", () => {
      setActiveYear(item.dataset.year);
      scheduleDefaultYearRestore();
    });
  });

  setActiveYear(defaultYear);
};

initChronology();
