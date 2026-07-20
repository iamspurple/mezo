document.addEventListener("DOMContentLoaded", () => {
  // Декоративные точки через IntersectionObserver
  const track = document.querySelector(".product-slider-track");
  const dots = document.querySelectorAll(".product-slider-dot");

  if (track && dots.length) {
    const slides = track.querySelectorAll(".product-slider-slide");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Array.from(slides).indexOf(entry.target);
          if (index === -1) return;
          if (entry.intersectionRatio >= 0.99) {
            dots[index]?.classList.add("active");
          } else {
            dots[index]?.classList.remove("active");
          }
        });
      },
      {
        root: track,
        threshold: 0.99,
      },
    );

    slides.forEach((slide) => observer.observe(slide));
  }

  // Перемещение h1 на мобиле
  const product = document.querySelector(".product");
  const productImages = document.querySelector(".product-images");
  const productInfo = document.querySelector(".product-info");
  const h1 = productInfo?.querySelector(".product-title");

  if (product && productImages && productInfo && h1) {
    const originalParent = productInfo;
    const originalNextSibling = h1.nextElementSibling;
    let isMoved = false;

    function syncH1Position() {
      const isMobile = window.innerWidth < 768;

      if (isMobile && !isMoved) {
        product.insertBefore(h1, product.firstElementChild);
        isMoved = true;
      } else if (!isMobile && isMoved) {
        originalParent.insertBefore(h1, originalNextSibling);
        isMoved = false;
      }
    }

    syncH1Position();
    window.addEventListener("resize", syncH1Position);
  }

  // Копирование
  const articulBtn = document.getElementById("articul");
  const urlBtn = document.getElementById("url");

  function handleCopy(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add("clicked");
      setTimeout(() => {
        btn.classList.remove("clicked");
      }, 3000);
    });
  }

  if (articulBtn) {
    articulBtn.addEventListener("click", () => {
      const span = articulBtn.querySelector("span");
      if (span) {
        handleCopy(articulBtn, span.textContent.trim());
      }
    });
  }

  if (urlBtn) {
    urlBtn.addEventListener("click", () => {
      handleCopy(urlBtn, window.location.href);
    });
  }

  // Модальное окно favorites-lists
  const openFavoritesBtn = document.getElementById("open-favorites-lists-btn");
  const closeFavoritesBtn = document.getElementById(
    "close-favorites-lists-btn",
  );
  const closeFavoritesDelayBtn = document.getElementById(
    "close-favorites-lists-btn-delay",
  );

  const favoritesOverlay = document.getElementById("overlay");
  const favoritesModal = document.getElementById("favorites-lists-modal");
  const step1 = document.querySelector(".favorites-lists-content .step1");
  const step2 = document.querySelector(".favorites-lists-content .step2");
  const goToStep2Btn = document.getElementById("gotostep2");
  const goToStep1Btn = document.getElementById("gotostep1");
  const saveToListBtns = document.querySelectorAll(".savetolist");

  if (
    openFavoritesBtn &&
    closeFavoritesBtn &&
    favoritesOverlay &&
    favoritesModal
  ) {
    const resetStep2FavoritesUi = () => {
      if (!step2) return;
      step2.classList.remove("is-success");
      const h2 = step2.querySelector("h2[data-success-message]");
      if (h2) h2.textContent = "Новый список";
    };

    const openFavoritesModal = () => {
      resetStep2FavoritesUi();
      favoritesOverlay.classList.remove("is-hidden");
      favoritesModal.classList.remove("is-hidden");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      step2?.classList.remove("is-visible");
    };

    const closeFavoritesModal = () => {
      favoritesOverlay.classList.add("is-hidden");
      favoritesModal.classList.add("is-hidden");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      step2?.classList.remove("is-visible");
      resetStep2FavoritesUi();
    };

    openFavoritesBtn.addEventListener("click", openFavoritesModal);
    closeFavoritesBtn.addEventListener("click", closeFavoritesModal);
    favoritesOverlay.addEventListener("click", closeFavoritesModal);

    if (closeFavoritesDelayBtn && step2) {
      closeFavoritesDelayBtn.addEventListener("click", () => {
        const h2 = step2.querySelector("h2[data-success-message]");
        const originalText = h2?.textContent?.trim() ?? "";
        const successMessage = h2?.dataset.successMessage;

        if (h2 && successMessage) {
          h2.textContent = successMessage;
        }
        step2.classList.add("is-success");

        setTimeout(() => {
          if (h2 && originalText) {
            h2.textContent = originalText;
          }
          step2.classList.remove("is-success");
          closeFavoritesModal();
        }, 2000);
      });
    }
  }

  if (goToStep2Btn && step2) {
    goToStep2Btn.addEventListener("click", () => {
      step2.classList.add("is-visible");
    });
  }

  if (goToStep1Btn && step2) {
    goToStep1Btn.addEventListener("click", () => {
      step2.classList.remove("is-visible", "is-success");
      const h2 = step2.querySelector("h2[data-success-message]");
      if (h2) h2.textContent = "Новый список";
    });
  }

  saveToListBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  const productTitle = document.getElementById("product-title");
  const productActionsAuthorized = document.getElementById(
    "product-actions-authorized",
  );
  const productActionsUnauthorized = document.getElementById(
    "product-actions-unauthorized",
  );

  if (productTitle && productActionsAuthorized && productActionsUnauthorized) {
    productTitle.addEventListener("click", () => {
      productActionsAuthorized.classList.toggle("visually-hidden");
      productActionsUnauthorized.classList.toggle("visually-hidden");
    });
  }
});
