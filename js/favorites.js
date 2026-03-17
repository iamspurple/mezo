document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("favorites-modal");
  const createList = document.querySelector(".create-list");
  const renameList = document.querySelector(".rename-list");
  const deleteList = document.querySelector(".delete-list");

  function openModal(contentEl) {
    document.querySelectorAll(".favorites-menu-content").forEach((el) => {
      el.classList.remove("is-visible", "is-success");
    });
    contentEl?.classList.add("is-visible");
    overlay?.classList.remove("is-hidden");
    modal?.classList.remove("is-hidden");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay?.classList.add("is-hidden");
    modal?.classList.add("is-hidden");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".rename").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(renameList);
    });
  });

  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(deleteList);
    });
  });

  document.querySelectorAll(".create").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(createList);
    });
  });

  document.querySelectorAll(".close-favorites-modal").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  overlay?.addEventListener("click", closeModal);

  document.querySelectorAll(".close-favorites-modal-delay").forEach((btn) => {
    btn.addEventListener("click", () => {
      const content = btn.closest(".favorites-menu-content");
      const h2 = content?.querySelector("h2[data-success-message]");
      const originalText = h2?.textContent?.trim() ?? "";
      const successMessage = h2?.dataset.successMessage;

      if (h2 && successMessage) {
        h2.textContent = successMessage;
      }
      content?.classList.add("is-success");

      setTimeout(() => {
        if (h2 && originalText) {
          h2.textContent = originalText;
        }
        content?.classList.remove("is-success");
        closeModal();
      }, 2000);
    });
  });
});
