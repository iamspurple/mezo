function initCheckModal() {
  const openBtn = document.getElementById("open-check-modal");
  const closeBtn = document.getElementById("close-check-modal");
  const openBtns = document.querySelectorAll(".open-check-modal");
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("check-modal");

  if (!overlay || !modal) return;

  function openModal() {
    overlay.classList.remove("is-hidden");
    modal.classList.remove("is-hidden");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.add("is-hidden");
    modal.classList.add("is-hidden");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  openBtns.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
}

document.addEventListener("DOMContentLoaded", () => {
  initCheckModal();
});
