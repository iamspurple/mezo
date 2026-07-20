/**
 * Универсальная логика аккордеона.
 * Использует классы: .accordion (контейнер details), .accordion-content (контент внутри).
 * Внутри .accordion-group-single одновременно открыт только один пункт.
 *
 * Публичный API через кастомные события на элементе <details>:
 *   details.dispatchEvent(new CustomEvent("accordion:open"))
 *   details.dispatchEvent(new CustomEvent("accordion:close"))
 */
document.addEventListener("DOMContentLoaded", () => {
  function runClose(details, content) {
    if (!details.open) return;
    const h = content.scrollHeight;
    content.style.height = h + "px";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        content.classList.add("is-closed");
        content.style.height = "0px";
      });
    });

    const onEnd = (ev) => {
      if (ev.target !== content || ev.propertyName !== "height") return;
      ev.stopPropagation();
      content.removeEventListener("transitionend", onEnd);
      details.removeAttribute("open");
    };
    content.addEventListener("transitionend", onEnd);
  }

  function runOpen(details, content) {
    details.setAttribute("open", "");
    content.style.height = "0px";

    requestAnimationFrame(() => {
      content.classList.remove("is-closed");
      content.style.height = `${content.scrollHeight}px`;
    });

    const onEnd = (ev) => {
      if (ev.target !== content || ev.propertyName !== "height") return;
      ev.stopPropagation();
      content.removeEventListener("transitionend", onEnd);
      // Иначе сброс height (px → auto) даёт подпрыгивание на 1px из‑за reflow.
      const prevTransition = content.style.transition;
      content.style.transition = "none";
      content.style.height = "";
      void content.offsetHeight;
      content.style.transition = prevTransition;
    };
    content.addEventListener("transitionend", onEnd);
  }

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

    // Публичный API: внешний код может открывать/закрывать через кастомные события
    details.addEventListener("accordion:open", () => {
      const group = details.closest(".accordion-group-single");
      if (group) {
        group.querySelectorAll(".accordion").forEach((other) => {
          if (other === details) return;
          const otherContent = other.querySelector(".accordion-content");
          if (!otherContent) return;
          runClose(other, otherContent);
        });
      }
      runOpen(details, content);
    });

    details.addEventListener("accordion:close", () => {
      runClose(details, content);
    });

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (details.open) {
        runClose(details, content);
      } else {
        details.dispatchEvent(new CustomEvent("accordion:open"));
      }
    });
  });
});
