class CollectionsSlider {
  constructor(trackSelector, options = {}) {
    this.trackSelector = trackSelector;
    this.track = document.querySelector(trackSelector);
    if (!this.track) return;

    this.options = options;
    this.slideMargin = options.slideMargin || 15;
    this.autoPlay = options.autoPlay !== undefined ? options.autoPlay : true;
    this.speed = options.speed || 50;
    this.isPaused = false;
    this.animationId = null;

    // Сохраняем оригинальные слайды до клонирования
    this.originalSlides = Array.from(
      this.track.querySelectorAll(".collections-item:not(.clone)"),
    );
    this.originalSlidesCount = this.originalSlides.length;

    this.init();
  }

  init() {
    const slide = this.track.querySelector(".collections-item:not(.clone)");
    const style = window.getComputedStyle(slide);

    const computedWidth = parseFloat(style.width);
    const computedMargin =
      parseFloat(style.marginRight) || this.options.slideMargin || 15;

    if (!computedWidth) {
      requestAnimationFrame(() => this.init());
      return;
    }

    this.slideWidth = computedWidth;
    this.slideMargin = computedMargin;

    this.cloneSlides();
    this.slides = this.track.querySelectorAll(".collections-item");
    this.setTrackWidth();
    this.track.style.transition = "none";

    const slideUnit = this.slideWidth + this.slideMargin;
    this.position = -slideUnit * this.originalSlidesCount;
    this.updatePosition();

    this.startListeners();

    // Ждём два кадра: первый — браузер применяет позицию и рисует клоны,
    // второй — убеждаемся что layout завершён, и только потом запускаем анимацию
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.autoPlay) {
          this.startAnimation();
        }
      });
    });
  }

  // Удаляет клоны и останавливает анимацию (для переинициализации)
  destroy() {
    this.stopAnimation();

    this.track.querySelectorAll(".collections-item.clone").forEach((clone) => {
      clone.remove();
    });

    this.track.style.width = "";
    this.track.style.transform = "";
  }

  // Переинициализация (вызывается при resize)
  reinit() {
    this.destroy();
    // Небольшая задержка, чтобы браузер успел применить медиа-запросы
    requestAnimationFrame(() => requestAnimationFrame(() => this.init()));
  }

  setTrackWidth() {
    const totalSlides = this.track.querySelectorAll(".collections-item").length;
    const trackWidth = (this.slideWidth + this.slideMargin) * totalSlides;
    this.track.style.width = `${trackWidth}px`;
  }

  cloneSlides() {
    // Удаляем старые клоны перед клонированием
    this.track
      .querySelectorAll(".collections-item.clone")
      .forEach((c) => c.remove());

    // Находим первый оригинальный слайд в DOM актуально
    const firstOriginal = this.track.querySelector(
      ".collections-item:not(.clone)",
    );

    // Клонируем в конец — 2 копии, чтобы сброс позиции всегда успевал
    for (let copy = 0; copy < 2; copy++) {
      this.originalSlides.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.classList.add("clone");
        this.track.appendChild(clone);
      });
    }

    // Клонируем в начало (в обратном порядке), вставляем перед первым оригиналом
    for (let i = this.originalSlides.length - 1; i >= 0; i--) {
      const clone = this.originalSlides[i].cloneNode(true);
      clone.classList.add("clone");
      this.track.insertBefore(clone, firstOriginal);
    }
  }

  getSlideWidth() {
    return this.slideWidth + this.slideMargin;
  }

  updatePosition() {
    this.track.style.transform = `translateX(${this.position}px)`;
  }

  startAnimation() {
    if (this.animationId) return;

    const step = () => {
      if (!this.isPaused) {
        this.position -= this.speed / 60;

        const slideUnit = this.getSlideWidth();
        const totalWidth = slideUnit * this.originalSlidesCount;

        if (this.position <= -totalWidth * 2) {
          this.position += totalWidth;
          this.track.style.transition = "none";
          this.updatePosition();
          this.track.getBoundingClientRect();
        } else if (this.position > -totalWidth) {
          this.position -= totalWidth;
          this.track.style.transition = "none";
          this.updatePosition();
          this.track.getBoundingClientRect();
        } else {
          this.updatePosition();
        }
      }

      this.animationId = requestAnimationFrame(step);
    };

    this.animationId = requestAnimationFrame(step);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    if (!this.animationId) {
      this.startAnimation();
    }
  }

  accelerate(direction) {
    const acceleration = this.speed * 8;
    const step = () => {
      if (direction === "left") {
        this.position -= acceleration / 30;
      } else {
        this.position += acceleration / 30;
      }

      const slideUnit = this.getSlideWidth();
      const totalWidth = slideUnit * this.originalSlidesCount;

      if (this.position <= -totalWidth * 2) {
        this.position += totalWidth;
        this.track.style.transition = "none";
        this.updatePosition();
        this.track.getBoundingClientRect();
        return;
      }
      if (this.position > -totalWidth) {
        this.position -= totalWidth;
        this.track.style.transition = "none";
        this.updatePosition();
        this.track.getBoundingClientRect();
        return;
      }

      this.updatePosition();
    };

    const interval = setInterval(step, 16);
    setTimeout(() => clearInterval(interval), 500);
  }

  // Навешиваем слушатели один раз — они не пересоздаются при reinit
  startListeners() {
    if (this._listenersAdded) return;
    this._listenersAdded = true;

    const forwardBtn = document.getElementById("collections-slider-forward");
    const backwardBtn = document.getElementById("collections-slider-backward");

    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => this.accelerate("left"));
    }
    if (backwardBtn) {
      backwardBtn.addEventListener("click", () => this.accelerate("right"));
    }

    if (this.autoPlay) {
      const wrapper = this.track.closest(".collections-slider-wrapper");
      if (wrapper) {
        wrapper.addEventListener("mouseenter", () => this.pause());
        wrapper.addEventListener("mouseleave", () => this.resume());
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else if (this.autoPlay) {
        this.resume();
      }
    });

    // Debounce resize → reinit
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.reinit(), 200);
    });
  }
}

const followCursor = () => {
  const feedbackCursor = document.getElementById("feedback-cursor");

  document.addEventListener("mousemove", (e) => {
    feedbackCursor.style.left = e.clientX + "px";
    feedbackCursor.style.top = e.clientY + "px";
  });
};
