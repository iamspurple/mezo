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
});
