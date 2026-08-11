/* Логика страницы каталога: фильтры, поиск, сортировка */

(function () {
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-count');
  const searchInput = document.getElementById('catalog-search-input');
  const sortSelect = document.getElementById('catalog-sort-select');
  const catList = document.getElementById('filter-categories');
  const matList = document.getElementById('filter-materials');
  const resetBtn = document.getElementById('filter-reset');
  const emptyState = document.getElementById('catalog-empty');

  const materials = Array.from(new Set(PRODUCTS.flatMap((p) => p.material))).sort((a, b) => a.localeCompare(b, 'ru'));

  const state = {
    categories: new Set(),
    materials: new Set(),
    search: '',
    sort: 'default',
  };

  // preselect category from URL (?cat=slug)
  const params = new URLSearchParams(location.search);
  const initialCat = params.get('cat');
  if (initialCat && CATEGORY_BY_SLUG[initialCat]) state.categories.add(initialCat);

  function countFor(catSlug) {
    return PRODUCTS.filter((p) => p.category === catSlug).length;
  }

  function renderFilters() {
    catList.innerHTML = CATEGORIES.map((c) => `
      <label class="filter-option">
        <span class="filter-option-label">
          <input type="checkbox" data-cat="${c.slug}" ${state.categories.has(c.slug) ? 'checked' : ''}>
          ${c.name}
        </span>
        <span class="filter-count">${countFor(c.slug)}</span>
      </label>`).join('');

    matList.innerHTML = materials.map((m) => `
      <label class="filter-option">
        <span class="filter-option-label">
          <input type="checkbox" data-mat="${m}" ${state.materials.has(m) ? 'checked' : ''}>
          ${m}
        </span>
      </label>`).join('');

    catList.querySelectorAll('input[data-cat]').forEach((inp) => {
      inp.addEventListener('change', () => {
        inp.checked ? state.categories.add(inp.dataset.cat) : state.categories.delete(inp.dataset.cat);
        renderGrid();
      });
    });
    matList.querySelectorAll('input[data-mat]').forEach((inp) => {
      inp.addEventListener('change', () => {
        inp.checked ? state.materials.add(inp.dataset.mat) : state.materials.delete(inp.dataset.mat);
        renderGrid();
      });
    });
  }

  function getFiltered() {
    let list = PRODUCTS.slice();
    if (state.categories.size) list = list.filter((p) => state.categories.has(p.category));
    if (state.materials.size) list = list.filter((p) => p.material.some((m) => state.materials.has(m)));
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break;
      default: break;
    }
    return list;
  }

  function renderGrid() {
    const list = getFiltered();
    countEl.textContent = `${list.length} ${pluralize(list.length)}`;
    grid.innerHTML = list.map(productCardHTML).join('');
    emptyState.style.display = list.length ? 'none' : 'block';
    bindProductGridEvents(grid);
    requestAnimationFrame(() => {
      grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    });
    renderFilters();
  }

  function pluralize(n) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'товар';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'товара';
    return 'товаров';
  }

  searchInput?.addEventListener('input', () => { state.search = searchInput.value; renderGrid(); });
  sortSelect?.addEventListener('change', () => { state.sort = sortSelect.value; renderGrid(); });
  resetBtn?.addEventListener('click', () => {
    state.categories.clear(); state.materials.clear(); state.search = ''; state.sort = 'default';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    renderGrid();
  });

  // mobile filter drawer
  const sidebar = document.getElementById('catalog-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  document.getElementById('mobile-filter-btn')?.addEventListener('click', () => {
    sidebar.setAttribute('data-open', 'true');
    sidebarBackdrop.setAttribute('data-open', 'true');
  });
  function closeSidebar() {
    sidebar.setAttribute('data-open', 'false');
    sidebarBackdrop.setAttribute('data-open', 'false');
  }
  sidebarBackdrop?.addEventListener('click', closeSidebar);
  document.getElementById('sidebar-close')?.addEventListener('click', closeSidebar);

  renderFilters();
  renderGrid();
})();
