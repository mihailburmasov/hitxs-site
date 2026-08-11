/* ==========================================================
   HitXS — общий JS: шапка, мобильное меню, модалки, формы,
   плавное появление блоков, cookie-баннер, FAQ.
   ========================================================== */

const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // TODO: заменить на свой ID Formspree

/* ---------- Utils ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

/* ---------- Header scroll state ---------- */
const header = $('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile nav ---------- */
const mobileNav = $('#mobile-nav');
const burgerBtn = $('#burger-btn');
const mobileNavClose = $('#mobile-nav-close');

function openMobileNav() {
  if (!mobileNav) return;
  mobileNav.setAttribute('data-open', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.setAttribute('data-open', 'false');
  document.body.style.overflow = '';
}
burgerBtn?.addEventListener('click', openMobileNav);
mobileNavClose?.addEventListener('click', closeMobileNav);
$('.mobile-nav-backdrop')?.addEventListener('click', closeMobileNav);
$$('.mobile-nav-panel a').forEach((a) => a.addEventListener('click', closeMobileNav));

/* ---------- Active nav link ---------- */
const currentPage = document.body.dataset.page;
if (currentPage) {
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === currentPage) a.classList.add('is-active');
  });
}

/* ---------- Reveal on scroll ---------- */
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el, i) => {
    el.style.setProperty('--i', i % 8);
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- FAQ accordion ---------- */
$$('.faq-item').forEach((item) => {
  const q = $('.faq-q', item);
  q?.addEventListener('click', () => {
    const isOpen = item.getAttribute('data-open') === 'true';
    if (!item.closest('[data-faq-exclusive="false"]')) {
      $$('.faq-item', item.parentElement).forEach((other) => {
        if (other !== item) other.setAttribute('data-open', 'false');
      });
    }
    item.setAttribute('data-open', isOpen ? 'false' : 'true');
  });
});

/* ---------- Cookie banner ---------- */
const cookieBar = $('#cookie-bar');
if (cookieBar) {
  if (!localStorage.getItem('hitxs_cookie_ok')) {
    setTimeout(() => cookieBar.setAttribute('data-visible', 'true'), 900);
  }
  $('#cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('hitxs_cookie_ok', '1');
    cookieBar.setAttribute('data-visible', 'false');
  });
}

/* ==========================================================
   Модалки: быстрый просмотр товара + форма заказа
   ========================================================== */

const orderModal = $('#order-modal');
const orderForm = $('#order-form');
const orderPreview = $('#order-product-preview');
const orderProductField = $('#order-product-field');

function lockScroll() { document.body.style.overflow = 'hidden'; }
function unlockScroll() { document.body.style.overflow = ''; }

function openModal(modal) {
  if (!modal) return;
  modal.setAttribute('data-open', 'true');
  lockScroll();
}
function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('data-open', 'false');
  if (!$('.modal-overlay[data-open="true"]') && !mobileNav?.matches('[data-open="true"]')) unlockScroll();
}

$$('[data-modal-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
});
$$('.modal-backdrop').forEach((bd) => {
  bd.addEventListener('click', () => closeModal(bd.closest('.modal-overlay')));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $$('.modal-overlay[data-open="true"]').forEach(closeModal);
});

function openOrderModal(product) {
  if (!orderModal) return;
  if (product && orderPreview) {
    orderPreview.hidden = false;
    orderPreview.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div>
        <b>${product.name}</b>
        <span>${formatPrice(product.price)}</span>
      </div>`;
    if (orderProductField) orderProductField.value = `${product.name} — ${formatPrice(product.price)}`;
  } else if (orderPreview) {
    orderPreview.hidden = true;
    orderPreview.innerHTML = '';
    if (orderProductField) orderProductField.value = '';
  }
  openModal(orderModal);
  setTimeout(() => $('#order-name')?.focus(), 350);
}
window.openOrderModal = openOrderModal;

$$('[data-open-order]').forEach((btn) => {
  btn.addEventListener('click', () => openOrderModal(null));
});

/* ---------- Quick view modal (каталог) ---------- */
const quickView = $('#quickview-modal');
function openQuickView(product) {
  if (!quickView || !product) return;
  $('#qv-image', quickView).src = product.image;
  $('#qv-image', quickView).alt = product.name;
  $('#qv-cat', quickView).textContent = product.categoryName || '';
  $('#qv-name', quickView).textContent = product.name;
  $('#qv-price', quickView).textContent = formatPrice(product.price);
  $('#qv-desc', quickView).textContent = product.description;
  const metaWrap = $('#qv-meta', quickView);
  metaWrap.innerHTML = (product.material || []).map((m) => `<span class="chip">${m}</span>`).join('');
  const orderBtn = $('#qv-order-btn', quickView);
  orderBtn.onclick = () => {
    closeModal(quickView);
    setTimeout(() => openOrderModal(product), 250);
  };
  openModal(quickView);
}
window.openQuickView = openQuickView;

/* ==========================================================
   Отправка форм через Formspree
   ========================================================== */

function initForm(form) {
  if (!form) return;
  const statusBox = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // honeypot
    const hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) return;

    // consent required
    const consent = form.querySelector('input[name="agree"]');
    if (consent && !consent.checked) {
      consent.closest('.consent')?.classList.add('invalid');
      consent.focus();
      return;
    }

    const requiredFields = Array.from(form.querySelectorAll('[required]'));
    let valid = true;
    requiredFields.forEach((f) => {
      const fieldWrap = f.closest('.field');
      if (!f.value.trim()) {
        valid = false;
        fieldWrap?.classList.add('invalid');
      } else {
        fieldWrap?.classList.remove('invalid');
      }
    });
    if (!valid) return;

    submitBtn && (submitBtn.disabled = true);
    if (statusBox) {
      statusBox.className = 'form-status';
      statusBox.textContent = '';
    }

    try {
      const endpointConfigured = FORM_ENDPOINT.indexOf('YOUR_FORM_ID') === -1;
      if (!endpointConfigured) {
        throw new Error('demo');
      }
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (res.ok) {
        showStatus(statusBox, 'ok', 'Заявка отправлена! Мы перезвоним вам в ближайшее время.');
        form.reset();
        if (orderPreview) { orderPreview.hidden = true; orderPreview.innerHTML = ''; }
        setTimeout(() => {
          const modal = form.closest('.modal-overlay');
          if (modal) closeModal(modal);
        }, 1800);
      } else {
        throw new Error('bad response');
      }
    } catch (err) {
      if (err.message === 'demo') {
        showStatus(statusBox, 'ok', 'Заявка принята (демо-режим). Подключите форму к Formspree — см. FORM_ENDPOINT в assets/js/main.js.');
        form.reset();
      } else {
        showStatus(statusBox, 'err', 'Не получилось отправить форму. Позвоните нам напрямую: +7 (953) 400-62-48.');
      }
    } finally {
      submitBtn && (submitBtn.disabled = false);
    }
  });

  form.querySelectorAll('input, textarea').forEach((f) => {
    f.addEventListener('input', () => f.closest('.field')?.classList.remove('invalid'));
  });
  const consentInput = form.querySelector('input[name="agree"]');
  consentInput?.addEventListener('change', () => consentInput.closest('.consent')?.classList.remove('invalid'));
}

function showStatus(box, type, text) {
  if (!box) return;
  box.classList.add('is-visible', type);
  box.textContent = text;
}

$$('form[data-lead-form]').forEach(initForm);
