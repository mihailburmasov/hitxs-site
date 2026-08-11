/* Общие функции рендера карточек товара — используются на главной и в каталоге */

const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

function productCategoryName(p) {
  return CATEGORY_BY_SLUG[p.category]?.name || '';
}

const ICON_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>';
const ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z"/></svg>';
const ICON_CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>';
const ICON_PHOTOS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="15" height="13" rx="2"/><path d="M7 9h.01M3 15l4-4 3 3 5-5 4 4"/></svg>';

function productCardHTML(p) {
  const fav = typeof isFavorite === 'function' && isFavorite(p.id);
  const photoCount = p.images ? p.images.length : 1;
  return `
  <article class="product-card reveal" data-id="${p.id}">
    <div class="product-thumb" data-qv="${p.id}">
      <span class="product-tag">${productCategoryName(p)}</span>
      <button class="product-fav-btn ${fav ? 'is-active' : ''}" type="button" aria-label="В избранное" data-fav="${p.id}">${ICON_HEART}</button>
      <img src="${p.image}" alt="${p.name}" loading="lazy" width="480" height="480">
      ${photoCount > 1 ? `<span class="product-photos-badge">${ICON_PHOTOS}${photoCount}</span>` : ''}
      <button class="product-quick" type="button" aria-label="Быстрый просмотр" data-qv="${p.id}">${ICON_EYE}</button>
    </div>
    <div class="product-body">
      <span class="product-cat">${p.material?.[0] || ''}</span>
      <h3 class="product-name" data-qv="${p.id}">${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <div class="product-foot">
        <span class="product-price">${Number(p.price).toLocaleString('ru-RU')} <small>₽</small></span>
        <button class="product-order-btn" type="button" aria-label="В корзину" data-cart-add="${p.id}">${ICON_CART}</button>
      </div>
    </div>
  </article>`;
}

function bindProductGridEvents(root) {
  root.querySelectorAll('[data-qv]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = PRODUCTS.find((x) => x.id === Number(btn.dataset.qv));
      if (p) window.openQuickView({ ...p, categoryName: productCategoryName(p) });
    });
  });
  root.querySelectorAll('[data-cart-add]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.cartAdd);
      window.addToCart(id, 1);
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 900);
    });
  });
  root.querySelectorAll('[data-fav]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.toggleFavorite(Number(btn.dataset.fav));
    });
  });
}
