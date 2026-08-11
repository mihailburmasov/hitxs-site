/* ==========================================================
   Корзина и избранное — хранение в localStorage.
   Онлайн-оплаты нет: корзина просто формирует список товаров
   для заявки, которую отправляет менеджеру форма заказа.
   ========================================================== */

const CART_KEY = 'hitxs_cart_v1';
const FAV_KEY = 'hitxs_fav_v1';

function readJSON(key, fallback) {
  try {
    const val = JSON.parse(localStorage.getItem(key));
    return val || fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
}

/* ---------- Cart store ---------- */
function getCart() { return readJSON(CART_KEY, {}); }
function saveCart(cart) {
  writeJSON(CART_KEY, cart);
  updateBadges();
  renderCartDrawer();
}
function addToCart(id, qty = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
}
function setCartQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
}
function removeFromCart(id) { setCartQty(id, 0); }
function clearCart() { saveCart({}); }
function cartItems() {
  const cart = getCart();
  return Object.entries(cart)
    .map(([id, qty]) => {
      const p = PRODUCTS.find((x) => x.id === Number(id));
      return p ? { ...p, qty } : null;
    })
    .filter(Boolean);
}
function cartCount() {
  return Object.values(getCart()).reduce((a, b) => a + b, 0);
}
function cartTotal() {
  return cartItems().reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ---------- Favorites store ---------- */
function getFavorites() { return readJSON(FAV_KEY, []); }
function saveFavorites(list) {
  writeJSON(FAV_KEY, list);
  updateBadges();
  renderFavDrawer();
  document.querySelectorAll('.product-fav-btn').forEach((btn) => {
    btn.classList.toggle('is-active', list.includes(Number(btn.dataset.fav)));
  });
}
function isFavorite(id) { return getFavorites().includes(Number(id)); }
function toggleFavorite(id) {
  id = Number(id);
  const list = getFavorites();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  saveFavorites(next);
}
function favItems() {
  return getFavorites().map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
}

/* ---------- Badges ---------- */
function updateBadges() {
  const cc = cartCount();
  const fc = getFavorites().length;
  document.querySelectorAll('.cart-badge').forEach((b) => { b.textContent = cc; b.hidden = cc === 0; });
  document.querySelectorAll('.fav-badge').forEach((b) => { b.textContent = fc; b.hidden = fc === 0; });
}

/* ---------- Drawer rendering ---------- */
function renderCartDrawer() {
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  if (!body) return;
  const items = cartItems();
  if (!items.length) {
    body.innerHTML = '<div class="drawer-empty"><p>Корзина пуста.</p><a href="catalog.html" class="btn btn-outline btn-sm">Перейти в каталог</a></div>';
    if (foot) foot.style.display = 'none';
    return;
  }
  if (foot) foot.style.display = '';
  body.innerHTML = items.map((i) => `
    <div class="cart-line">
      <img src="${i.image}" alt="${i.name}">
      <div class="cart-line-info">
        <b>${i.name}</b>
        <span>${Number(i.price).toLocaleString('ru-RU')} ₽ × ${i.qty}</span>
        <div class="qty-stepper">
          <button type="button" data-qty-minus="${i.id}" aria-label="Уменьшить количество">−</button>
          <span>${i.qty}</span>
          <button type="button" data-qty-plus="${i.id}" aria-label="Увеличить количество">+</button>
        </div>
      </div>
      <button class="cart-line-remove" type="button" data-remove="${i.id}" aria-label="Удалить из корзины">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>`).join('');

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = cartTotal().toLocaleString('ru-RU') + ' ₽';

  body.querySelectorAll('[data-qty-minus]').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.dataset.qtyMinus);
    setCartQty(id, (getCart()[id] || 1) - 1);
  }));
  body.querySelectorAll('[data-qty-plus]').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.dataset.qtyPlus);
    setCartQty(id, (getCart()[id] || 0) + 1);
  }));
  body.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
    removeFromCart(Number(b.dataset.remove));
  }));
}

function renderFavDrawer() {
  const body = document.getElementById('fav-body');
  if (!body) return;
  const items = favItems();
  if (!items.length) {
    body.innerHTML = '<div class="drawer-empty"><p>В избранном пока пусто.</p><a href="catalog.html" class="btn btn-outline btn-sm">Перейти в каталог</a></div>';
    return;
  }
  body.innerHTML = items.map((p) => `
    <div class="cart-line">
      <img src="${p.image}" alt="${p.name}">
      <div class="cart-line-info">
        <b>${p.name}</b>
        <span>${Number(p.price).toLocaleString('ru-RU')} ₽</span>
      </div>
      <div class="fav-line-actions">
        <button class="icon-btn-sm" type="button" data-fav-cart="${p.id}" aria-label="В корзину">${ICON_CART}</button>
        <button class="cart-line-remove" type="button" data-fav-remove="${p.id}" aria-label="Убрать из избранного">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>`).join('');

  body.querySelectorAll('[data-fav-cart]').forEach((b) => b.addEventListener('click', () => {
    addToCart(Number(b.dataset.favCart), 1);
    b.classList.add('is-added');
    setTimeout(() => b.classList.remove('is-added'), 900);
  }));
  body.querySelectorAll('[data-fav-remove]').forEach((b) => b.addEventListener('click', () => {
    toggleFavorite(Number(b.dataset.favRemove));
  }));
}

/* ---------- Open drawers ---------- */
document.querySelectorAll('.js-open-cart').forEach((btn) => {
  btn.addEventListener('click', () => {
    window.closeMobileNavIfOpen?.();
    window.openModalEl?.(document.getElementById('cart-drawer'));
  });
});
document.querySelectorAll('.js-open-fav').forEach((btn) => {
  btn.addEventListener('click', () => {
    window.closeMobileNavIfOpen?.();
    window.openModalEl?.(document.getElementById('fav-drawer'));
  });
});

document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  renderCartDrawer();
  renderFavDrawer();
});
if (document.readyState !== 'loading') {
  updateBadges();
  renderCartDrawer();
  renderFavDrawer();
}
