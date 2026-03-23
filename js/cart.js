document.querySelectorAll(".custom-select").forEach((select) => {
  const trigger = select.querySelector(".custom-select-trigger");
  const dropdown = select.querySelector(".custom-select-dropdown");
  const tagsEl = select.querySelector(".custom-select-tags");
  const clearBtn = select.querySelector(".custom-select-clear");
  const nativeSelect = select.querySelector("select");
  const options = [...select.querySelectorAll(".custom-select-option")];
  const isSingle = true; // В корзине все селекты одиночные

  function isNativeDisabled() {
    return Boolean(nativeSelect?.disabled);
  }

  function syncTriggerDisabled() {
    const disabled = isNativeDisabled();
    trigger.setAttribute("aria-disabled", disabled ? "true" : "false");
    if (disabled) {
      select.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
  }

  // Хранилище выбранных значений: { value, label }
  // Предвыбираем опцию с data-default="true", если она есть, иначе первую выбранную в native select
  const defaultOption = select.querySelector(
    ".custom-select-option[data-default='true']",
  );
  const initialSelected = nativeSelect?.querySelector("option:checked");
  let selected = defaultOption
    ? [
        {
          value: defaultOption.dataset.value,
          label: defaultOption.textContent.trim(),
        },
      ]
    : initialSelected
      ? [
          {
            value: initialSelected.value,
            label: initialSelected.textContent.trim(),
          },
        ]
      : [];

  // ── Рендер тегов в триггере ──────────────────────────────────────────
  function renderTags() {
    tagsEl.innerHTML = "";

    if (selected.length === 0) {
      select.classList.remove("has-value");
      const allTag = document.createElement("span");
      allTag.className = "custom-select-tag custom-select-tag-all";
      allTag.textContent = "Все";
      tagsEl.appendChild(allTag);
      return;
    }

    select.classList.add("has-value");

    // Для одиночного выбора скрываем кнопку "Очистить" если выбрано дефолтное значение
    if (
      isSingle &&
      defaultOption &&
      selected.length === 1 &&
      selected[0].value === defaultOption.dataset.value
    ) {
      select.classList.add("is-default");
    } else {
      select.classList.remove("is-default");
    }

    const visible = selected.slice(0, 2);
    const rest = selected.length - 2;

    visible.forEach(({ label }) => {
      const tag = document.createElement("span");
      tag.className = "custom-select-tag";
      tag.textContent = label;
      tagsEl.appendChild(tag);
    });

    if (rest > 0) {
      const more = document.createElement("span");
      more.className = "custom-select-tag custom-select-tag-more";
      more.textContent = `+${rest}`;
      tagsEl.appendChild(more);
    }
  }

  // ── Синхронизация нативного select ───────────────────────────────────
  function syncNative() {
    if (!nativeSelect) return;
    [...nativeSelect.options].forEach((opt) => {
      opt.selected = selected.some((s) => s.value === opt.value);
    });
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ── Обновить состояние опций в dropdown ───────────────────────────────
  function updateOptions() {
    options.forEach((opt) => {
      const isSelected = selected.some((s) => s.value === opt.dataset.value);
      opt.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  // ── Открыть дропдаун ─────────────────────────────────────────────────
  function openDropdown() {
    if (isNativeDisabled()) return;
    document.querySelectorAll(".custom-select.open").forEach((s) => {
      if (s !== select) closeDropdown(s);
    });
    select.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    // Фокус на первую выбранную опцию или первую
    const firstSelected =
      dropdown.querySelector("[aria-selected='true']") || options[0];
    if (firstSelected) firstSelected.focus();
  }

  // ── Закрыть дропдаун ─────────────────────────────────────────────────
  function closeDropdown(s = select) {
    s.classList.remove("open");
    s.querySelector(".custom-select-trigger").setAttribute(
      "aria-expanded",
      "false",
    );
  }

  // ── Клик на триггер ──────────────────────────────────────────────────
  trigger.addEventListener("click", (e) => {
    // Не реагировать на клик по кнопке очистить
    if (e.target.closest(".custom-select-clear")) return;
    if (isNativeDisabled()) return;
    select.classList.contains("open") ? closeDropdown() : openDropdown();
  });

  // ── Кнопка "Очистить" ────────────────────────────────────────────────
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isNativeDisabled()) return;
      if (isSingle && defaultOption) {
        selected = [
          {
            value: defaultOption.dataset.value,
            label: defaultOption.textContent.trim(),
          },
        ];
      } else {
        selected = [];
      }
      renderTags();
      updateOptions();
      syncNative();
      closeDropdown();
      trigger.focus();
    });
  }

  // ── Клик по опции ────────────────────────────────────────────────────
  options.forEach((option) => {
    option.setAttribute("tabindex", "-1");

    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = option.dataset.value;
      const label = option.textContent.trim();
      const idx = selected.findIndex((s) => s.value === value);

      if (isSingle) {
        // Одиночный выбор: заменяем текущий и закрываем дропдаун
        selected = [{ value, label }];
        renderTags();
        updateOptions();
        syncNative();
        closeDropdown();
        trigger.focus();
      } else {
        if (idx > -1) {
          selected.splice(idx, 1);
        } else {
          selected.push({ value, label });
        }
        renderTags();
        updateOptions();
        syncNative();
        // Дропдаун остаётся открытым для мультивыбора
        option.focus();
      }
    });

    // ── Клавиатурная навигация ────────────────────────────────────────
    option.addEventListener("keydown", (e) => {
      const idx = options.indexOf(option);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        options[Math.min(idx + 1, options.length - 1)].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx === 0) trigger.focus();
        else options[Math.max(idx - 1, 0)].focus();
      } else if (e.key === "Escape") {
        closeDropdown();
        trigger.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        option.click();
      }
    });
  });

  // ── Клавиши на триггере ───────────────────────────────────────────────
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown();
      return;
    }
    if (isNativeDisabled()) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDropdown();
    }
  });

  // ── Начальный рендер ─────────────────────────────────────────────────
  renderTags();
  updateOptions();
  syncTriggerDisabled();
});

// ── Закрыть при клике вне ─────────────────────────────────────────────
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-select")) {
    document.querySelectorAll(".custom-select.open").forEach((s) => {
      s.classList.remove("open");
      s.querySelector(".custom-select-trigger").setAttribute(
        "aria-expanded",
        "false",
      );
    });
  }
});

// ── Модальное окно счёта (check-modal) ─────────────────────────────────
(function initCheckModal() {
  const openBtn = document.getElementById("open-check-modal");
  const closeBtn = document.getElementById("close-check-modal");
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("check-modal");

  if (!openBtn || !closeBtn || !overlay || !modal) return;

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

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
})();
