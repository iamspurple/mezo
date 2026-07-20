document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".all-collections-item");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  items.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${index * 80}ms`);
    observer.observe(item);
  });
});
