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

class HeaderCollectionsSlider {
  constructor(trackSelector, options = {}) {
    this.track = document.querySelector(trackSelector);
    if (!this.track) return;

    this.options = options;
    this.slideMargin = options.slideMargin || 10;
    this.autoPlay = options.autoPlay !== undefined ? options.autoPlay : true;
    this.speed = options.speed || 50;
    this.isPaused = false;
    this.animationId = null;

    this.originalSlides = Array.from(
      this.track.querySelectorAll(".header-menu-collections-item:not(.clone)"),
    );
    this.originalSlidesCount = this.originalSlides.length;

    this.init();
  }

  init() {
    const slide = this.track.querySelector(
      ".header-menu-collections-item:not(.clone)",
    );
    const style = window.getComputedStyle(slide);
    const computedWidth = parseFloat(style.width);
    const computedMargin =
      parseFloat(style.marginRight) || this.options.slideMargin || 10;

    if (!computedWidth) {
      requestAnimationFrame(() => this.init());
      return;
    }

    this.slideWidth = computedWidth;
    this.slideMargin = computedMargin;

    this.cloneSlides();
    this.slides = this.track.querySelectorAll(".header-menu-collections-item");
    this.setTrackWidth();
    this.track.style.transition = "none";

    const slideUnit = this.slideWidth + this.slideMargin;
    this.position = -slideUnit * this.originalSlidesCount;
    this.updatePosition();

    this.startListeners();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.autoPlay) {
          this.startAnimation();
        }
      });
    });
  }

  destroy() {
    this.stopAnimation();
    this.track
      .querySelectorAll(".header-menu-collections-item.clone")
      .forEach((c) => c.remove());
    this.track.style.width = "";
    this.track.style.transform = "";
  }

  reinit() {
    this.destroy();
    requestAnimationFrame(() => requestAnimationFrame(() => this.init()));
  }

  setTrackWidth() {
    const totalSlides = this.track.querySelectorAll(
      ".header-menu-collections-item",
    ).length;
    const trackWidth = (this.slideWidth + this.slideMargin) * totalSlides;
    this.track.style.width = `${trackWidth}px`;
  }

  cloneSlides() {
    this.track
      .querySelectorAll(".header-menu-collections-item.clone")
      .forEach((c) => c.remove());

    const firstOriginal = this.track.querySelector(
      ".header-menu-collections-item:not(.clone)",
    );

    // 2 копии в конец для буфера
    for (let copy = 0; copy < 2; copy++) {
      this.originalSlides.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.classList.add("clone");
        this.track.appendChild(clone);
      });
    }

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
    const acceleration = this.speed * 10;
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

  startListeners() {
    if (this._listenersAdded) return;
    this._listenersAdded = true;

    const forwardBtn = document.getElementById(
      "header-menu-collections-slider-forward",
    );
    const backwardBtn = document.getElementById(
      "header-menu-collections-slider-backward",
    );

    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => this.accelerate("left"));
    }
    if (backwardBtn) {
      backwardBtn.addEventListener("click", () => this.accelerate("right"));
    }

    if (this.autoPlay) {
      const wrapper = this.track.closest(
        ".header-menu-collections-slider-wrapper",
      );
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

// Слайдер для новостей в меню (без автоплея, только кнопки)
class HeaderMenuInfoNewsSlider {
  constructor(trackSelector, options = {}) {
    this.track = document.querySelector(trackSelector);
    if (!this.track) {
      console.error(`Слайдер не найден: ${trackSelector}`);
      return;
    }

    this.options = options;
    this.slides = this.track.querySelectorAll(".header-menu-info-news-item");
    this.currentSlide = 0;
    this.slidesToShow = options.slidesToShow || 1;

    this.forwardBtn = document.getElementById(
      "header-menu-info-news-slider-forward",
    );
    this.backwardBtn = document.getElementById(
      "header-menu-info-news-slider-backward",
    );

    this.init();
  }

  init() {
    const slide = this.slides[0];
    if (!slide) return;

    const slideStyle = window.getComputedStyle(slide);
    const computedWidth = parseFloat(slideStyle.width);

    if (!computedWidth) {
      requestAnimationFrame(() => this.init());
      return;
    }

    // Читаем отступ: сначала margin-right элемента, потом gap трека
    const marginRight = parseFloat(slideStyle.marginRight) || 0;
    const trackGap = parseFloat(window.getComputedStyle(this.track).gap) || 0;
    const computedMargin =
      marginRight || trackGap || this.options.slideMargin || 15;

    this.slideWidth = computedWidth;
    this.slideMargin = computedMargin;

    this.setTrackWidth();
    this.startListeners();
    this.updatePosition();
    this.updateButtonsState();
  }

  destroy() {
    this.track.style.transform = "";
  }

  reinit() {
    this.destroy();
    // Сбрасываем на первый слайд при resize — позиция пересчитается с новой шириной
    this.currentSlide = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => this.init()));
  }

  setTrackWidth() {
    // Трек использует CSS gap — ширина считается браузером автоматически.
    // Инлайн-стиль не нужен, убираем чтобы не конфликтовал.
    this.track.style.width = "";
  }

  getSlideWidth() {
    return this.slideWidth + this.slideMargin;
  }

  updatePosition() {
    const slideUnit = this.getSlideWidth();
    // Максимальный сдвиг — чтобы последний слайд не уходил за край
    const trackWidth =
      this.slides.length * this.slideWidth +
      (this.slides.length - 1) * this.slideMargin;
    const wrapper = this.track.parentElement;
    const wrapperWidth = wrapper ? wrapper.getBoundingClientRect().width : 0;
    const maxOffset = Math.max(0, trackWidth - wrapperWidth);
    const offset = Math.min(this.currentSlide * slideUnit, maxOffset);
    this.track.style.transform = `translateX(${-offset}px)`;
    this.track.style.transition = "transform 0.4s ease";
    this.updateButtonsState();
  }

  updateButtonsState() {
    const slideUnit = this.getSlideWidth();
    const trackWidth =
      this.slides.length * this.slideWidth +
      (this.slides.length - 1) * this.slideMargin;
    const wrapper = this.track.parentElement;
    const wrapperWidth = wrapper ? wrapper.getBoundingClientRect().width : 0;
    const maxOffset = Math.max(0, trackWidth - wrapperWidth);
    const currentOffset = this.currentSlide * slideUnit;

    if (this.backwardBtn) {
      this.backwardBtn.disabled = this.currentSlide === 0;
      this.backwardBtn.toggleAttribute("disabled", this.currentSlide === 0);
    }

    if (this.forwardBtn) {
      const atEnd = currentOffset >= maxOffset;
      this.forwardBtn.disabled = atEnd;
      this.forwardBtn.toggleAttribute("disabled", atEnd);
    }
  }

  next() {
    const maxSlide = this.slides.length - this.slidesToShow;
    if (this.currentSlide < maxSlide) {
      this.currentSlide++;
      this.updatePosition();
    }
  }

  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updatePosition();
    }
  }

  startListeners() {
    if (this._listenersAdded) return;
    this._listenersAdded = true;

    if (this.forwardBtn) {
      this.forwardBtn.addEventListener("click", () => this.next());
    }
    if (this.backwardBtn) {
      this.backwardBtn.addEventListener("click", () => this.prev());
    }

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.reinit(), 200);
    });
  }
}

// Функция для управления скроллом body
const toggleBodyScroll = () => {
  const headerNav = document.querySelector(".header-nav");
  const isMenuOpen = headerNav && headerNav.classList.contains("menu");

  if (isMenuOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

// Функция для управления меню
const initMenu = () => {
  const headerNav = document.querySelector(".header-nav");
  const headerNavItems = document.querySelectorAll(".header-nav-item");
  const burgerBtn = document.querySelector(".header-burger-btn");

  if (!headerNav || !headerNavItems.length) {
    console.error("Элементы меню не найдены");
    return;
  }

  // Проверяем начальное состояние
  toggleBodyScroll();

  // Кнопка-бургер (только на < 1024px): открывает/закрывает меню
  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      const isOpen = headerNav.classList.contains("menu");
      const isMobile = window.innerWidth < 768;

      if (isOpen) {
        headerNav.classList.remove("menu", "tablet", "mobile");
        headerNavItems.forEach((navItem) => navItem.classList.remove("active"));
      } else {
        const modeClass = isMobile ? "mobile" : "tablet";
        headerNav.classList.add("menu", modeClass);
        // Активируем первый пункт по умолчанию, если ни один не активен
        if (!isMobile && !headerNav.querySelector(".header-nav-item.active")) {
          headerNavItems[0]?.classList.add("active");
        }
      }

      toggleBodyScroll();
    });
  }

  // Предотвращаем закрытие меню при клике на содержимое
  const headerNavItemContents = document.querySelectorAll(
    ".header-nav-item-content",
  );
  headerNavItemContents.forEach((content) => {
    content.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Предотвращаем hover на родителе при наведении на содержимое
    const parentItem = content.closest(".header-nav-item");
    if (parentItem) {
      content.addEventListener("mouseenter", () => {
        parentItem.classList.add("content-hovered");
      });
      content.addEventListener("mouseleave", () => {
        parentItem.classList.remove("content-hovered");
      });
    }
  });

  headerNavItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const isTablet = headerNav.classList.contains("tablet");
      const hasMenuClass = headerNav.classList.contains("menu");
      const isActive = item.classList.contains("active");

      // В tablet-режиме: клик на активный пункт ничего не делает,
      // меню закрывается только бургер-кнопкой
      if (isTablet) {
        if (!isActive) {
          headerNavItems.forEach((navItem) =>
            navItem.classList.remove("active"),
          );
          item.classList.add("active");
        }
        return;
      }

      // В mobile-режиме: клик на неактивный пункт — показывает его контент;
      // клик на активный пункт — скрывает контент, возвращает к списку
      if (headerNav.classList.contains("mobile")) {
        if (isActive) {
          item.classList.remove("active");
        } else {
          headerNavItems.forEach((navItem) =>
            navItem.classList.remove("active"),
          );
          item.classList.add("active");
        }
        return;
      }

      // Desktop-режим: стандартная логика
      if (!hasMenuClass) {
        headerNav.classList.add("menu");
        item.classList.add("active");
      } else if (hasMenuClass && isActive) {
        headerNav.classList.remove("menu");
        item.classList.remove("active");
      } else if (hasMenuClass && !isActive) {
        headerNavItems.forEach((navItem) => navItem.classList.remove("active"));
        item.classList.add("active");
      }

      toggleBodyScroll();
    });
  });
};

// Функция для обработки клика на header-menu-account-mode-item
const initAccountMode = () => {
  const accountModeItems = document.querySelectorAll(
    ".header-menu-account-mode-item",
  );
  const accountForms = document.querySelectorAll(".header-menu-account-form");

  if (!accountModeItems.length || !accountForms.length) {
    return;
  }

  accountModeItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Определяем тип (sign-in или sign-up)
      const isSignIn = item.classList.contains("sign-in");
      const isSignUp = item.classList.contains("sign-up");
      const formClass = isSignIn ? "sign-in" : isSignUp ? "sign-up" : null;

      if (!formClass) {
        return;
      }

      // Убираем active у всех элементов списка
      accountModeItems.forEach((modeItem) => {
        modeItem.classList.remove("active");
      });

      // Добавляем active к кликнутому элементу
      item.classList.add("active");

      // Убираем active у всех форм
      accountForms.forEach((form) => {
        form.classList.remove("active");
      });

      // Находим и активируем форму с соответствующим классом
      const targetForm = document.querySelector(
        `.header-menu-account-form.${formClass}`,
      );
      if (targetForm) {
        targetForm.classList.add("active");
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const slider = new CollectionsSlider(".collections-slider", {
    slideMargin: 15,
    autoPlay: true,
    speed: 50,
  });

  const headerSlider = new HeaderCollectionsSlider(
    ".header-menu-collections-slider",
    {
      autoPlay: true,
      speed: 50,
    },
  );

  const headerMenuInfoNewsSlider = new HeaderMenuInfoNewsSlider(
    "#header-menu-info-news-slider",
    {
      slidesToShow: 1,
    },
  );

  followCursor();
  initMenu();
  initAccountMode();
});
