document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".howtofind-accordion").forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector(".howtofind-accordion-content");

    // Получить полную высоту с учётом padding
    function getFullHeight() {
      // Временно снимаем is-closed чтобы padding участвовал в расчёте
      content.classList.remove("is-closed");
      const h = content.scrollHeight;
      if (!details.open) content.classList.add("is-closed");
      return h;
    }

    // Инициализация
    if (details.open) {
      content.style.height = "";
    } else {
      content.classList.add("is-closed");
      content.style.height = "0px";
    }

    summary.addEventListener("click", (e) => {
      e.preventDefault();

      if (details.open) {
        // Закрытие: фиксируем высоту → следующий кадр → анимируем в 0 + убираем padding
        const h = content.scrollHeight;
        content.style.height = h + "px";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            content.classList.add("is-closed");
            content.style.height = "0px";
          });
        });

        content.addEventListener(
          "transitionend",
          () => {
            details.removeAttribute("open");
          },
          { once: true },
        );
      } else {
        // Открытие: добавляем open, снимаем is-closed, анимируем высоту
        details.setAttribute("open", "");
        content.style.height = "0px";

        requestAnimationFrame(() => {
          content.classList.remove("is-closed");
          content.style.height = content.scrollHeight + "px";
        });

        content.addEventListener(
          "transitionend",
          () => {
            content.style.height = "";
          },
          { once: true },
        );
      }
    });
  });
});
