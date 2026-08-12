/*
 * Генерирует статическую страницу для каждого товара: <repo-root>/<slug>/index.html
 * Адрес страницы = адрес товара на исходном hitxs.ru (см. HANDOFF.md).
 * Запуск: node scripts/generate-product-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { CATEGORIES, PRODUCTS } = require(path.join(ROOT, 'assets/js/products.js'));

const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

function pageHTML(p) {
  const cat = CATEGORY_BY_SLUG[p.category] || { name: '', slug: '' };
  const images = p.images && p.images.length ? p.images : [p.image];
  const price = formatPrice(p.price);
  const title = `${p.name} — ${price} купить в Казани | HitXS`;
  const description = `${p.description} Цена ${price}. Изделие ручной работы из массива дерева от мастерской HitXS, Казань. Доставка по России.`;
  const canonical = `https://hitxs.ru/${encodeURI(p.slug)}/`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: images.map((img) => `https://hitxs.ru/${img}`),
    sku: String(p.id),
    category: cat.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: String(p.price),
      availability: 'https://schema.org/InStock',
      url: canonical,
    },
  };

  const thumbsHTML = images.length > 1
    ? `<div class="pd-thumbs">${images.map((src, i) => `<img src="../${src}" data-i="${i}" class="${i === 0 ? 'is-active' : ''}" alt="Фото ${i + 1}" loading="lazy">`).join('')}</div>`
    : '';

  const chipsHTML = (p.material || []).map((m) => `<span class="chip">${esc(m)}</span>`).join('');
  const specsHTML = (p.features || []).length
    ? `<ul class="modal-specs">${p.features.map((f) => `<li><span>${esc(f.name)}</span><span>${esc(f.value)}</span></li>`).join('')}</ul>`
    : '';

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪵</text></svg>">
<link rel="stylesheet" href="../assets/css/style.css">
<meta property="og:type" content="product">
<meta property="og:title" content="${esc(p.name)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="../${images[0]}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body data-page="catalog" data-base="../">

<a href="#main" class="visually-hidden">Перейти к содержимому</a>

<!-- ===================== HEADER ===================== -->
<header class="site-header">
  <div class="container header-inner">
    <a href="../index.html" class="brand">
      <span class="brand-mark">Hx</span>
      <span class="brand-name">Hit<span>XS</span></span>
    </a>
    <nav class="main-nav" aria-label="Основная навигация">
      <a href="../index.html" data-nav="home">Главная</a>
      <a href="../catalog.html" data-nav="catalog">Каталог</a>
      <a href="../o-nas.html" data-nav="about">О нас</a>
      <a href="../dostavka-i-oplata.html" data-nav="delivery">Доставка и оплата</a>
      <a href="../kontakty.html" data-nav="contacts">Контакты</a>
    </nav>
    <div class="header-actions">
      <div class="header-phone">
        <a href="tel:+79534006248">+7 (953) 400-62-48</a>
        <span>Пн–Вс, 10:00–21:00</span>
      </div>
      <div class="header-icons">
        <button class="icon-btn js-open-fav" type="button" aria-label="Избранное">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z"/></svg>
          <span class="fav-badge" hidden>0</span>
        </button>
        <button class="icon-btn js-open-cart" type="button" aria-label="Корзина">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>
          <span class="cart-badge" hidden>0</span>
        </button>
      </div>
      <button class="btn btn-primary btn-sm" type="button" data-open-order>Оставить заявку</button>
      <button class="burger" id="burger-btn" aria-label="Открыть меню">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>

<!-- ===================== MOBILE NAV ===================== -->
<div class="mobile-nav" id="mobile-nav" data-open="false">
  <div class="mobile-nav-backdrop"></div>
  <div class="mobile-nav-panel">
    <div class="mobile-nav-top">
      <span style="font-family:var(--font-head);font-weight:700;font-size:1.2rem;">Меню</span>
      <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Закрыть меню">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="mobile-nav-icons">
      <button class="mnav-icon-btn js-open-fav" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z"/></svg>
        Избранное<span class="fav-badge" hidden>0</span>
      </button>
      <button class="mnav-icon-btn js-open-cart" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>
        Корзина<span class="cart-badge" hidden>0</span>
      </button>
    </div>
    <a class="mnav-link" href="../index.html">Главная</a>
    <a class="mnav-link" href="../catalog.html">Каталог</a>
    <a class="mnav-link" href="../o-nas.html">О нас</a>
    <a class="mnav-link" href="../dostavka-i-oplata.html">Доставка и оплата</a>
    <a class="mnav-link" href="../kak-zakazat.html">Как заказать</a>
    <a class="mnav-link" href="../garantii.html">Гарантии</a>
    <a class="mnav-link" href="../vopros-otvet.html">Вопросы и ответы</a>
    <a class="mnav-link" href="../kontakty.html">Контакты</a>
    <div class="mobile-nav-contact">
      <a href="tel:+79534006248">+7 (953) 400-62-48</a>
      <a href="tel:+79196276691">+7 (919) 627-66-91</a>
      <button class="btn btn-primary btn-block" type="button" data-open-order>Оставить заявку</button>
    </div>
  </div>
</div>

<main id="main">
  <section class="page-hero" style="padding-bottom:24px;">
    <div class="container">
      <div class="breadcrumbs">
        <a href="../index.html">Главная</a>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        <a href="../catalog.html">Каталог</a>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        <a href="../catalog.html?cat=${esc(cat.slug)}">${esc(cat.name)}</a>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        <span>${esc(p.name)}</span>
      </div>
    </div>
  </section>

  <section style="padding-top:0;">
    <div class="container">
      <div class="product-detail-panel">
        <div class="modal-body">
          <div class="pd-gallery">
            <div class="pd-main-image"><img id="pd-main-img" src="../${images[0]}" alt="${esc(p.name)}"></div>
            ${thumbsHTML}
          </div>
          <div class="modal-info">
            <span class="product-cat">${esc(cat.name)}</span>
            <h1>${esc(p.name)}</h1>
            <div class="modal-price">${price}</div>
            <p class="modal-desc">${esc(p.description)}</p>
            <div class="modal-meta">${chipsHTML}</div>
            ${specsHTML}
            <div class="qv-actions">
              <button class="icon-btn" id="pd-fav-btn" type="button" aria-label="В избранное">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z"/></svg>
              </button>
              <button class="btn btn-primary btn-block" id="pd-cart-btn" type="button">В корзину</button>
            </div>
          </div>
        </div>
      </div>

      <div class="pd-related">
        <div class="section-head reveal">
          <span class="eyebrow">${esc(cat.name)}</span>
          <h2>Похожие товары</h2>
        </div>
        <div class="product-grid" id="related-grid"></div>
      </div>
    </div>
  </section>

  <section class="section-alt">
    <div class="container">
      <div class="cta-banner reveal">
        <div>
          <h2>Не нашли нужный размер?</h2>
          <p>Сделаем по индивидуальным меркам — напишите или позвоните, подскажем сроки и стоимость.</p>
        </div>
        <div class="cta-actions">
          <a href="tel:+79534006248" class="btn btn-ghost-light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z"/></svg>
            +7 (953) 400-62-48
          </a>
          <button class="btn btn-primary" type="button" data-open-order>Оставить заявку</button>
        </div>
      </div>
    </div>
  </section>
</main>

<!-- ===================== FOOTER ===================== -->
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="../index.html" class="brand"><span class="brand-mark">Hx</span><span class="brand-name" style="color:#fff;">HitXS</span></a>
        <p>Мастерская изделий из массива дерева в Казани. Доски, посуда, аксессуары и мебель ручной работы.</p>
      </div>
      <div class="footer-col">
        <h4>Каталог</h4>
        <ul>
          <li><a href="../catalog.html?cat=razdelochnye">Разделочные доски</a></li>
          <li><a href="../catalog.html?cat=tortsevye">Торцевые доски</a></li>
          <li><a href="../catalog.html?cat=podnosy">Подносы</a></li>
          <li><a href="../catalog.html?cat=menazhnitsy">Менажницы</a></li>
          <li><a href="../catalog.html?cat=nabory">Подарочные наборы</a></li>
          <li><a href="../catalog.html">Весь каталог</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Покупателям</h4>
        <ul>
          <li><a href="../o-nas.html">О нас</a></li>
          <li><a href="../kak-zakazat.html">Как заказать</a></li>
          <li><a href="../dostavka-i-oplata.html">Доставка и оплата</a></li>
          <li><a href="../garantii.html">Гарантии</a></li>
          <li><a href="../vopros-otvet.html">Вопросы и ответы</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Контакты</h4>
        <ul>
          <li><a href="tel:+79534006248">+7 (953) 400-62-48</a></li>
          <li><a href="tel:+79196276691">+7 (919) 627-66-91</a></li>
          <li><a href="mailto:info@hitxs.ru">info@hitxs.ru</a></li>
          <li>г. Казань, ул. Родины, 33а корп. 1</li>
          <li>Пн–Вс, 10:00–21:00</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span id="year"></span> HitXS. Все права защищены.</span>
      <a href="../privacy.html">Политика конфиденциальности</a>
    </div>
  </div>
</footer>

<a class="fab-max" href="tel:+79534006248" aria-label="Связаться с нами в MAX или по телефону">
  <span class="fab-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H8l-4 4V4Z"/><circle cx="9" cy="10" r="1"/><circle cx="12" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg></span>
  <span class="fab-label">Написать в MAX</span>
</a>

<div class="cookie-bar" id="cookie-bar" data-visible="false">
  <p>Мы используем файлы cookie для корректной работы сайта и карты. Подробнее в <a href="../privacy.html">политике конфиденциальности</a>.</p>
  <div class="cookie-actions"><button class="btn btn-primary btn-sm" id="cookie-accept" type="button">Хорошо</button></div>
</div>

<!-- ORDER MODAL -->
<div class="modal-overlay" id="order-modal" data-open="false">
  <div class="modal-backdrop"></div>
  <div class="modal-panel">
    <button class="modal-close" data-modal-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="modal-info">
      <span class="eyebrow" style="margin-bottom:6px;">Заявка на заказ</span>
      <h3>Оставьте контакты — мы перезвоним</h3>
      <div class="order-product-preview" id="order-product-preview" hidden></div>
      <form id="order-form" data-lead-form novalidate>
        <input type="text" name="_gotcha" class="hp-field" tabindex="-1" autocomplete="off">
        <input type="hidden" name="_subject" value="Заявка на заказ — HitXS">
        <input type="hidden" name="product" id="order-product-field" value="">
        <div class="field">
          <label for="order-name">Имя*</label>
          <input id="order-name" type="text" name="name" required placeholder="Как к вам обращаться">
          <span class="field-error">Пожалуйста, укажите имя</span>
        </div>
        <div class="field">
          <label for="order-phone">Телефон*</label>
          <input id="order-phone" type="tel" name="phone" required placeholder="+7 (___) ___-__-__">
          <span class="field-error">Укажите номер телефона</span>
        </div>
        <div class="field">
          <label for="order-comment">Комментарий</label>
          <textarea id="order-comment" name="message" placeholder="Размер, материал, количество — что важно уточнить"></textarea>
        </div>
        <label class="consent">
          <input type="checkbox" name="agree" checked required>
          <span>Я принимаю условия <a href="../privacy.html" target="_blank">политики обработки персональных данных</a></span>
        </label>
        <button class="btn btn-primary btn-block" type="submit">Отправить заявку</button>
        <p class="form-note">Без предоплаты. Менеджер перезвонит для подтверждения заказа и доставки.</p>
        <div class="form-status"></div>
      </form>
    </div>
  </div>
</div>

<!-- QUICK VIEW MODAL -->
<div class="modal-overlay" id="quickview-modal" data-open="false">
  <div class="modal-backdrop"></div>
  <div class="modal-panel">
    <button class="modal-close" data-modal-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="modal-body">
      <div class="modal-media">
        <img id="qv-image" src="" alt="">
        <button class="qv-nav qv-prev" id="qv-prev" type="button" aria-label="Предыдущее фото" hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
        <button class="qv-nav qv-next" id="qv-next" type="button" aria-label="Следующее фото" hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
        <span class="qv-counter" id="qv-counter" hidden></span>
        <div class="qv-thumbs" id="qv-thumbs" hidden></div>
      </div>
      <div class="modal-info">
        <span class="product-cat" id="qv-cat"></span>
        <h3 id="qv-name"></h3>
        <div class="modal-price" id="qv-price"></div>
        <p class="modal-desc" id="qv-desc"></p>
        <ul class="modal-specs" id="qv-specs"></ul>
        <div class="modal-meta" id="qv-meta"></div>
        <div class="qv-actions">
          <button class="icon-btn" id="qv-fav-btn" type="button" aria-label="В избранное">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z"/></svg>
          </button>
          <button class="btn btn-primary btn-block" id="qv-order-btn" type="button">В корзину</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay drawer" id="cart-drawer" data-open="false">
  <div class="modal-backdrop"></div>
  <div class="modal-panel">
    <div class="drawer-head">
      <h3>Корзина</h3>
      <button class="modal-close" data-modal-close aria-label="Закрыть" style="position:static;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="drawer-body" id="cart-body"></div>
    <div class="drawer-foot" id="cart-foot">
      <div class="drawer-total"><span>Итого</span><b id="cart-total">0 ₽</b></div>
      <button class="btn btn-primary btn-block" id="cart-checkout-btn" type="button">Оформить заказ</button>
    </div>
  </div>
</div>

<div class="modal-overlay drawer" id="fav-drawer" data-open="false">
  <div class="modal-backdrop"></div>
  <div class="modal-panel">
    <div class="drawer-head">
      <h3>Избранное</h3>
      <button class="modal-close" data-modal-close aria-label="Закрыть" style="position:static;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="drawer-body" id="fav-body"></div>
  </div>
</div>

<script src="../assets/js/products.js"></script>
<script src="../assets/js/render.js"></script>
<script src="../assets/js/cart.js"></script>
<script src="../assets/js/main.js"></script>
<script>
  document.getElementById('year').textContent = new Date().getFullYear();

  // Галерея: клик по миниатюре меняет главное фото
  document.querySelectorAll('.pd-thumbs img').forEach((t) => {
    t.addEventListener('click', () => {
      document.getElementById('pd-main-img').src = t.src;
      document.querySelectorAll('.pd-thumbs img').forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
    });
  });

  // Избранное и корзина для этой карточки
  const pdFavBtn = document.getElementById('pd-fav-btn');
  const pdCartBtn = document.getElementById('pd-cart-btn');
  const syncPdFav = () => pdFavBtn.classList.toggle('is-active', isFavorite(${p.id}));
  syncPdFav();
  pdFavBtn.addEventListener('click', () => { toggleFavorite(${p.id}); syncPdFav(); });
  pdCartBtn.addEventListener('click', () => {
    addToCart(${p.id}, 1);
    pdCartBtn.textContent = 'Добавлено ✓';
    setTimeout(() => { pdCartBtn.textContent = 'В корзину'; }, 1200);
  });

  // Похожие товары той же категории
  const related = PRODUCTS.filter((p) => p.category === ${JSON.stringify(p.category)} && p.id !== ${p.id}).slice(0, 4);
  const relatedGrid = document.getElementById('related-grid');
  if (related.length) {
    relatedGrid.innerHTML = related.map(productCardHTML).join('');
    bindProductGridEvents(relatedGrid);
    relatedGrid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  } else {
    document.querySelector('.pd-related').style.display = 'none';
  }
</script>
</body>
</html>
`;
}

let created = 0;
for (const p of PRODUCTS) {
  const dir = path.join(ROOT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHTML(p), 'utf8');
  created++;
}
console.log(`Сгенерировано страниц: ${created}`);
