/**
 * Универсальная логика аккордеона.
 * Использует классы: .accordion (контейнер details), .accordion-content (контент внутри).
 */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accordion").forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector(".accordion-content");

    if (!summary || !content) return;

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
          { once: true }
        );
      } else {
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
          { once: true }
        );
      }
    });
  });
});
