class CollectionsSlider {
  constructor(trackSelector, options = {}) {
    this.track = document.querySelector(trackSelector);
    this.slides = this.track.querySelectorAll(".collections-item");
    this.position = 0;
    this.slideWidth = options.slideWidth || 450;
    this.slideMargin = options.slideMargin || 15;
    this.autoPlay = options.autoPlay !== undefined ? options.autoPlay : true;
    this.speed = options.speed || 50;
    this.isPaused = false;
    this.animationId = null;
    this.originalSlidesCount = this.slides.length;

    this.init();
  }

  init() {
    this.cloneSlides();
    this.setTrackWidth();
    this.track.style.transition = "none"; // Убираем transition для плавной анимации
    this.addEventListeners();

    if (this.autoPlay) {
      this.startAnimation();
    }
  }

  setTrackWidth() {
    // Устанавливаем ширину трека для всех слайдов
    const totalSlides = this.slides.length;
    const trackWidth = (this.slideWidth + this.slideMargin) * totalSlides;
    this.track.style.width = `${trackWidth}px`;
  }

  cloneSlides() {
    // Клонируем все оригинальные слайды для бесконечности
    const slidesArray = Array.from(this.slides);

    // Клонируем все слайды в конец
    slidesArray.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add("clone");
      this.track.appendChild(clone);
    });

    // Клонируем все слайды в начало (в обратном порядке)
    for (let i = slidesArray.length - 1; i >= 0; i--) {
      const clone = slidesArray[i].cloneNode(true);
      clone.classList.add("clone");
      this.track.insertBefore(clone, slidesArray[0]);
    }

    // Обновляем коллекцию слайдов
    this.slides = this.track.querySelectorAll(".collections-item");

    // Устанавливаем начальную позицию на первый оригинальный набор
    const slideUnit = this.slideWidth + this.slideMargin;
    this.position = -slideUnit * this.originalSlidesCount;
    this.updatePosition();
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
        // Движение влево (уменьшаем позицию)
        this.position -= this.speed / 60;

        // Проверяем границы и сбрасываем позицию для бесконечности
        const slideUnit = this.getSlideWidth();
        const totalWidth = slideUnit * this.originalSlidesCount;

        // Если прошли слишком далеко влево, сбрасываем на начало оригинальных слайдов
        if (this.position <= -totalWidth * 2) {
          this.position += totalWidth;
        }
        // Если прошли слишком далеко вправо, сбрасываем на конец оригинальных слайдов
        if (this.position > -totalWidth) {
          this.position -= totalWidth;
        }

        this.updatePosition();
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

  // Ускорение при нажатии кнопок
  accelerate(direction) {
    const acceleration = this.speed * 10;
    const step = () => {
      if (direction === "left") {
        this.position -= acceleration / 30;
      } else {
        this.position += acceleration / 30;
      }

      // Проверяем границы
      const slideUnit = this.getSlideWidth();
      const totalWidth = slideUnit * this.originalSlidesCount;

      if (this.position <= -totalWidth * 2) {
        this.position += totalWidth;
      }
      if (this.position > -totalWidth) {
        this.position -= totalWidth;
      }

      this.updatePosition();
    };

    // Ускорение на короткое время
    const interval = setInterval(step, 16);
    setTimeout(() => {
      clearInterval(interval);
    }, 500);
  }

  addEventListeners() {
    // Кнопки управления
    const forwardBtn = document.getElementById("collections-slider-forward");
    const backwardBtn = document.getElementById("collections-slider-backward");

    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => this.accelerate("left"));
    }

    if (backwardBtn) {
      backwardBtn.addEventListener("click", () => this.accelerate("right"));
    }

    // Пауза при наведении
    if (this.autoPlay) {
      const wrapper = this.track.closest(".collections-slider-wrapper");
      if (wrapper) {
        wrapper.addEventListener("mouseenter", () => this.pause());
        wrapper.addEventListener("mouseleave", () => this.resume());
      }
    }

    // Пауза при скрытии страницы
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else if (this.autoPlay) {
        this.resume();
      }
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

document.addEventListener("DOMContentLoaded", () => {
  const slider = new CollectionsSlider(".collections-slider", {
    slideWidth: 450,
    slideMargin: 15,
    autoPlay: true,
    speed: 50,
  });

  followCursor();
});
