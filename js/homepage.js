const followCursor = () => {
  const feedbackCursor = document.getElementById("feedback-cursor");

  document.addEventListener("mousemove", (e) => {
    feedbackCursor.style.left = e.clientX + "px";
    feedbackCursor.style.top = e.clientY + "px";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  followCursor();
});
