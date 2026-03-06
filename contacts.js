document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".howtofind-accordion").forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector(".howtofind-accordion-content");

    // Инициализация: если открыт по умолчанию (атрибут open) — выставляем высоту
    if (details.open) {
      content.style.height = content.scrollHeight + "px";
    } else {
      content.style.height = "0px";
    }

    summary.addEventListener("click", (e) => {
      e.preventDefault();

      if (details.open) {
        // Закрытие
        content.style.height = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.height = "0px";
        });
        content.addEventListener(
          "transitionend",
          () => {
            details.removeAttribute("open");
          },
          { once: true },
        );
      } else {
        // Открытие
        details.setAttribute("open", "");
        content.style.height = "0px";
        requestAnimationFrame(() => {
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
