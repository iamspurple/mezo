const followCursor = () => {
  const feedbackCursor = document.getElementById("feedback-cursor");
  if (!feedbackCursor) return;

  let x = 0;
  let y = 0;
  let rafId = null;

  const render = () => {
    rafId = null;
    // Двигаем только через transform (композитинг на GPU) — иначе Safari
    // перерисовывает blur на CPU и оставляет «шлейф» из прямоугольников.
    feedbackCursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  };

  document.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (rafId === null) rafId = requestAnimationFrame(render);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  followCursor();
});
