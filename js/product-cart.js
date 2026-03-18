/**
 * Переключение класса active на кнопках добавления в корзину и избранное
 */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".addtocart, .favorites").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      btn.classList.toggle("active");
    });
  });
});
