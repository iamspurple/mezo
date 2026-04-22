const initCategoriesListHover = () => {
  const container = document.querySelector(".categories-list-container");
  if (!container) return;

  const items = container.querySelectorAll(".categories-item");
  const imageItems = container.querySelectorAll(".categories-image-item");

  const clearImageStates = () => {
    imageItems.forEach((el) => el.classList.remove("active", "inactive"));
  };

  items.forEach((item) => {
    const name = item.dataset.name;
    if (!name) return;

    item.addEventListener("mouseenter", () => {
      imageItems.forEach((img) => {
        img.classList.remove("active", "inactive");
        img.classList.add(img.dataset.name === name ? "active" : "inactive");
      });
    });

    item.addEventListener("mouseleave", clearImageStates);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initCategoriesListHover();
});
