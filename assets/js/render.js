/* Общие функции рендера карточек товара — используются на главной и в каталоге */

const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

function productCategoryName(p) {
  return CATEGORY_BY_SLUG[p.category]?.name || '';
}

const ICON_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>';
const ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function productCardHTML(p) {
  return `
  <article class="product-card reveal" data-id="${p.id}">
    <div class="product-thumb">
      <span class="product-tag">${productCategoryName(p)}</span>
      <img src="${p.image}" alt="${p.name}" loading="lazy" width="480" height="480">
      <button class="product-quick" type="button" aria-label="Быстрый просмотр" data-qv="${p.id}">${ICON_EYE}</button>
    </div>
    <div class="product-body">
      <span class="product-cat">${p.material?.[0] || ''}</span>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <div class="product-foot">
        <span class="product-price">${Number(p.price).toLocaleString('ru-RU')} <small>₽</small></span>
        <button class="product-order-btn" type="button" aria-label="Заказать" data-order="${p.id}">${ICON_ARROW}</button>
      </div>
    </div>
  </article>`;
}

function bindProductGridEvents(root) {
  root.querySelectorAll('[data-qv]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PRODUCTS.find((x) => x.id === Number(btn.dataset.qv));
      if (p) window.openQuickView({ ...p, categoryName: productCategoryName(p) });
    });
  });
  root.querySelectorAll('[data-order]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = PRODUCTS.find((x) => x.id === Number(btn.dataset.order));
      if (p) window.openOrderModal(p);
    });
  });
}
