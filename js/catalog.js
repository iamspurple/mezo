const productsList = document.querySelector(".catalog-products-list");

document.querySelectorAll(".custom-select").forEach((select) => {
  const trigger = select.querySelector(".custom-select-trigger");
  const dropdown = select.querySelector(".custom-select-dropdown");
  const tagsEl = select.querySelector(".custom-select-tags");
  const clearBtn = select.querySelector(".custom-select-clear");
  const nativeSelect = select.querySelector("select");
  const options = [...select.querySelectorAll(".custom-select-option")];
  const isSingle = select.dataset.name === "sort";

  // Хранилище выбранных значений: { value, label }
  // Предвыбираем опцию с data-default="true", если она есть
  const defaultOption = select.querySelector(
    ".custom-select-option[data-default='true']",
  );
  let selected = defaultOption
    ? [
        {
          value: defaultOption.dataset.value,
          label: defaultOption.textContent.trim(),
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

  // ── Обновить классы списка продуктов ──────────────────────────────────
  function updateProductsListClasses() {
    if (!productsList) return;
    if (select.dataset.name === "category") {
      productsList.classList.toggle("medium", selected.length > 0);
    }
    if (select.dataset.name === "collection") {
      productsList.classList.toggle("large", selected.length > 0);
    }
  }

  // ── Открыть дропдаун ─────────────────────────────────────────────────
  function openDropdown() {
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
    select.classList.contains("open") ? closeDropdown() : openDropdown();
  });

  // ── Кнопка "Очистить" ────────────────────────────────────────────────
  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
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
    updateProductsListClasses();
    closeDropdown();
    trigger.focus();
  });

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
        updateProductsListClasses();
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
        updateProductsListClasses();
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
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDropdown();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  // ── Начальный рендер ─────────────────────────────────────────────────
  renderTags();
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

// ── Логика тегов-фильтров catalog-tag-filters ─────────────────────────
document.querySelectorAll(".catalog-tag-filters").forEach((fieldset) => {
  const allInput = fieldset.querySelector("input[data-tag-all]");
  const otherInputs = [
    ...fieldset.querySelectorAll(
      'input[name="tag-filter"]:not([data-tag-all])',
    ),
  ];

  if (!allInput || !otherInputs.length) return;

  allInput.addEventListener("change", () => {
    if (allInput.checked) {
      otherInputs.forEach((inp) => (inp.checked = false));
    } else {
      const anyOtherChecked = otherInputs.some((i) => i.checked);
      if (!anyOtherChecked) allInput.checked = true;
    }
  });

  otherInputs.forEach((inp) => {
    inp.addEventListener("change", () => {
      if (inp.checked) {
        allInput.checked = false;
      } else {
        const anyOtherChecked = otherInputs.some((i) => i.checked);
        if (!anyOtherChecked) inp.checked = true;
      }
    });
  });
});

document.querySelectorAll(".addtolist, .favorites").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
  });
  console.log(btn);
});
