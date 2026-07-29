// ══════════════════════════════════════════════════════════════
// SK STUDIO PUNE — Premium UI Script v4.0
// ══════════════════════════════════════════════════════════════

'use strict';

/* ─── 1. GLOBAL STATE ─────────────────────────────────────── */
let cart              = JSON.parse(localStorage.getItem('skCart')    || '[]');
let wishlist          = JSON.parse(localStorage.getItem('skWish')    || '[]');
let searchHistory     = JSON.parse(localStorage.getItem('skSearch')  || '[]');
let currentProduct    = null;
let currentQuantity   = 1;
let currentCalDate    = new Date();
let selectedDate      = null;
let selectedSlot      = '';
let discountPct       = 0;
let bookingCouponCode = '';
let lightboxImages    = [];
let lightboxIndex     = 0;
let galleryAllImages  = [];
let galleryShown      = 0;
let testimonialIndex  = 0;
let pwaInstallEvent   = null;
let slideshowTimer    = null;
let currentSlide      = 0;

const GALLERY_PAGE_SIZE = 16;

// All studio images from the images folder
const STUDIO_IMAGES = [
  { src:'/images/sk_studio_pune_1728268338_3473289022808913241_63216979904.jpg',  cat:'wedding'   },
  { src:'/images/sk_studio_pune_1728268338_3473289022808913243_63216979904.jpg',  cat:'maternity' },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386128_63216979904.jpg',  cat:'baby'      },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386129_63216979904.jpg',  cat:'portrait'  },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386130_63216979904.jpg',  cat:'wedding'   },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386131_63216979904.jpg',  cat:'baby'      },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386132_63216979904.jpg',  cat:'maternity' },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386133_63216979904.jpg',  cat:'portrait'  },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386134_63216979904.jpg',  cat:'wedding'   },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386135_63216979904.jpg',  cat:'baby'      },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386136_63216979904.jpg',  cat:'maternity' },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386137_63216979904.jpg',  cat:'portrait'  },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386138_63216979904.jpg',  cat:'wedding'   },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386139_63216979904.jpg',  cat:'baby'      },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386140_63216979904.jpg',  cat:'maternity' },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386141_63216979904.jpg',  cat:'portrait'  },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386142_63216979904.jpg',  cat:'wedding'   },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386143_63216979904.jpg',  cat:'baby'      },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386144_63216979904.jpg',  cat:'maternity' },
  { src:'/images/sk_studio_pune_1739976396_3571503332455386145_63216979904.jpg',  cat:'portrait'  },
];

// Booking packages (can be customised)
const BOOKING_PACKAGES = [
  { id:'baby-basic',      name:'Baby Shoot — Essential',    price:2499,  duration:'2 hrs', deliverables:'20 edited photos' },
  { id:'baby-premium',    name:'Baby Shoot — Premium',      price:3999,  duration:'3 hrs', deliverables:'40 edited photos + album' },
  { id:'mat-classic',     name:'Maternity — Classic',       price:2999,  duration:'2 hrs', deliverables:'30 edited photos' },
  { id:'mat-luxury',      name:'Maternity — Luxury',        price:4999,  duration:'4 hrs', deliverables:'60 edited photos + album + reels' },
  { id:'wedding-full',    name:'Wedding Full Day',          price:19999, duration:'8 hrs', deliverables:'300+ edited photos + video' },
  { id:'pre-wedding',     name:'Pre-Wedding Shoot',         price:9999,  duration:'6 hrs', deliverables:'100 edited photos + reels' },
  { id:'newborn',         name:'Newborn — Deluxe',          price:4499,  duration:'3 hrs', deliverables:'50 edited photos + album' },
  { id:'portrait',        name:'Portrait Session',          price:1499,  duration:'1 hr',  deliverables:'10 edited photos' },
];

const VALID_COUPONS = { 'STUDIO20': 20, 'SKPUNE10': 10, 'FIRST15': 15 };

/* ─── 2. DOM READY ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initHeroSlideshow();
  initScrollEffects();
  buildCalendar();
  buildPackageSelector();
  buildGallery('all');
  initStatsCounter();
  // initTestimonialSlider(); // Now handled by Swiper (see section 25)
  syncCart();
  initAuth();
  initPWA();
  initDarkMode();
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  // Apply any product overrides from server injection
  if (window.__APPLY_VISUAL_CHANGES__) window.__APPLY_VISUAL_CHANGES__();

  // Load dynamic public gallery images from server if available
  fetch('/api/public-gallery-images')
    .then(res => res.json())
    .then(data => {
      if (data.success && Array.isArray(data.images) && data.images.length > 0) {
        STUDIO_IMAGES.length = 0;
        STUDIO_IMAGES.push(...data.images);
        buildGallery('all');
      }
    })
    .catch(err => console.warn('Could not fetch dynamic gallery images, using static fallback.', err));
});

/* ─── 3. NAVBAR ────────────────────────────────────────────── */
function initNavbar() {
  const header = document.getElementById('siteHeader');
  const navbar = header ? header.querySelector('.navbar') : null;
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 80;
    navbar.classList.toggle('scrolled', scrolled);
  }, { passive: true });

  // Clone desktop nav to mobile menu
  const mobileList = document.getElementById('mobileNavList');
  const desktopNav  = document.getElementById('navMenu');
  if (mobileList && desktopNav) {
    mobileList.innerHTML = desktopNav.innerHTML;
  }
}

/* ─── 4. MOBILE MENU ─────────────────────────────────────── */
function initMobileMenu() {
  const btn     = document.getElementById('hamburgerBtn');
  const menu    = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    overlay.classList.toggle('active', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

function closeMobileMenu() {
  const menu    = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  const btn     = document.getElementById('hamburgerBtn');
  if (!menu) return;
  menu.classList.remove('active');
  overlay.classList.remove('active');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ─── 5. HERO SLIDESHOW ───────────────────────────────────── */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.indicator');
  if (slides.length === 0) return;

  const interval = (window.__SLIDESHOW_INTERVAL__ || 3500);

  function goToSlide(idx) {
    slides[currentSlide].classList.remove('active');
    if (indicators[currentSlide]) indicators[currentSlide].classList.remove('active');
    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (indicators[currentSlide]) indicators[currentSlide].classList.add('active');
  }

  // Clicking indicators
  indicators.forEach((ind, i) => ind.addEventListener('click', () => {
    clearInterval(slideshowTimer);
    goToSlide(i);
    slideshowTimer = setInterval(() => goToSlide(currentSlide + 1), interval);
  }));

  // Auto-advance
  slideshowTimer = setInterval(() => goToSlide(currentSlide + 1), interval);

  // Keyboard nav when hero in view
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { clearInterval(slideshowTimer); goToSlide(currentSlide - 1); slideshowTimer = setInterval(() => goToSlide(currentSlide + 1), interval); }
    if (e.key === 'ArrowRight') { clearInterval(slideshowTimer); goToSlide(currentSlide + 1); slideshowTimer = setInterval(() => goToSlide(currentSlide + 1), interval); }
  });
}

/* ─── 6. SCROLL EFFECTS ───────────────────────────────────── */
function initScrollEffects() {
  // Intersection observer for reveal animations
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Parallax on scroll
  const parallaxBg = document.getElementById('parallaxBg');
  if (parallaxBg) {
    window.addEventListener('scroll', () => {
      const section = document.querySelector('.parallax-banner');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const scrolled = -rect.top * 0.4;
      parallaxBg.style.transform = `translateY(${scrolled}px)`;
    }, { passive: true });
  }
}

/* ─── 7. STATS COUNTER ────────────────────────────────────── */
function initStatsCounter() {
  const items = document.querySelectorAll('.stat-item');
  if (items.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const numEl  = el.querySelector('.stat-number');
      if (!numEl) return;
      animateCount(numEl, 0, target, 1800);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  items.forEach(el => io.observe(el));
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = to.toLocaleString();
  }
  requestAnimationFrame(step);
}

/* ─── 8. GALLERY ──────────────────────────────────────────── */
function buildGallery(filter) {
  galleryAllImages = filter === 'all'
    ? [...STUDIO_IMAGES]
    : STUDIO_IMAGES.filter(img => img.cat === filter);

  lightboxImages = galleryAllImages.map(img => img.src);
  galleryShown = 0;

  const grid = document.getElementById('masonryGrid');
  if (!grid) return;
  grid.innerHTML = '';
  appendGalleryItems();
}

function appendGalleryItems() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;

  const batch = galleryAllImages.slice(galleryShown, galleryShown + GALLERY_PAGE_SIZE);
  batch.forEach((img, batchIdx) => {
    const absIdx = galleryShown + batchIdx;
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.dataset.cat = img.cat;
    item.innerHTML = `
      <img src="${img.src}" alt="${img.cat} photography by SK Studio" loading="lazy"
           onerror="this.parentElement.style.display='none'"
           onclick="openLightbox(${absIdx})" />
      <div class="masonry-hover-overlay" onclick="openLightbox(${absIdx})">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </div>`;
    grid.appendChild(item);
  });

  galleryShown += batch.length;

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = galleryShown < galleryAllImages.length ? 'inline-flex' : 'none';
  }
}

function filterGallery(cat, btn) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  buildGallery(cat);
}

function loadMoreGallery() {
  appendGalleryItems();
}

/* ─── 9. LIGHTBOX ────────────────────────────────────────── */
function openLightbox(idx) {
  lightboxIndex = idx;
  const overlay = document.getElementById('lightboxOverlay');
  const img     = document.getElementById('lightboxImg');
  const counter = document.getElementById('lightboxCounter');
  if (!overlay) return;
  img.src = lightboxImages[idx] || '';
  if (counter) counter.textContent = `${idx + 1} / ${lightboxImages.length}`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function lightboxPrev(e) {
  e.stopPropagation();
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  openLightbox(lightboxIndex);
}

function lightboxNext(e) {
  e.stopPropagation();
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  openLightbox(lightboxIndex);
}

document.addEventListener('keydown', e => {
  const overlay = document.getElementById('lightboxOverlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lightboxPrev({ stopPropagation:() => {} });
  if (e.key === 'ArrowRight') lightboxNext({ stopPropagation:() => {} });
});

/* ─── 10. TESTIMONIALS SLIDER ────────────────────────────── */
function initTestimonialSlider() {
  if (document.querySelector('.testimonials-swiper')) return; // Handled by Swiper
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  // Auto-advance
  setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % cards.length;
    goToTestimonial(testimonialIndex);
  }, 4500);
}

function goToTestimonial(idx) {
  testimonialIndex = idx;
  const track = document.getElementById('testimonialsTrack');
  const card  = track ? track.querySelectorAll('.testimonial-card')[idx] : null;
  if (card) card.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'start' });

  document.querySelectorAll('.t-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

/* ─── 11. PRODUCT MODAL ──────────────────────────────────── */
function openProductModal(product) {
  currentProduct  = product;
  currentQuantity = 1;

  const modal = document.getElementById('productModal');
  if (!modal) return;

  const fields = {
    modalImage:         { attr:'src', val:product.image || '' },
    modalTitle:         { text:product.name || 'Product Name' },
    modalPrice:         { text:product.price || '₹0' },
    modalOriginalPrice: { text:product.originalPrice || '' },
    modalDescription:   { text:product.description || 'Beautiful handcrafted prop perfect for photography sessions.' },
    quantityValue:      { text:'1' },
  };

  Object.entries(fields).forEach(([id, cfg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (cfg.attr) el[cfg.attr] = cfg.val;
    else el.textContent = cfg.text;
  });

  const discEl = document.getElementById('modalDiscount');
  if (discEl) {
    if (product.discount) {
      discEl.textContent = product.discount;
      discEl.style.display = 'inline-block';
    } else {
      discEl.style.display = 'none';
    }
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

function increaseQuantity() {
  currentQuantity = Math.min(currentQuantity + 1, 99);
  const el = document.getElementById('quantityValue');
  if (el) el.textContent = currentQuantity;
}

function decreaseQuantity() {
  currentQuantity = Math.max(currentQuantity - 1, 1);
  const el = document.getElementById('quantityValue');
  if (el) el.textContent = currentQuantity;
}

function addToCart() {
  if (!currentProduct) return;
  const item = { ...currentProduct, quantity: currentQuantity, addedAt: Date.now() };
  const idx  = cart.findIndex(c => c.id === item.id);
  if (idx > -1) cart[idx].quantity += currentQuantity;
  else cart.push(item);
  localStorage.setItem('skCart', JSON.stringify(cart));
  syncCart();
  closeProductModal();
  showToast(`✓ Added ${item.name || 'item'} to cart`);
}

function addToWishlist() {
  if (!currentProduct) return;
  const exists = wishlist.find(w => w.id === currentProduct.id);
  if (!exists) {
    wishlist.push(currentProduct);
    localStorage.setItem('skWish', JSON.stringify(wishlist));
    showToast(`♥ Added to wishlist`);
  } else {
    showToast('Already in wishlist');
  }
}

function syncCart() {
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

/* ─── 12. SEARCH DRAWER ───────────────────────────────────── */
function openSearchDrawer() {
  const drawer  = document.getElementById('searchDrawer');
  const overlay = document.getElementById('searchOverlay');
  if (!drawer) return;
  drawer.classList.add('active');
  if (overlay) overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const inp = document.getElementById('searchInput'); if (inp) inp.focus(); }, 300);
  renderSearchHistory();
}

function closeSearchDrawer() {
  const drawer  = document.getElementById('searchDrawer');
  const overlay = document.getElementById('searchOverlay');
  if (drawer) drawer.classList.remove('active');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function handleSearchInput() {
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const results = document.getElementById('searchResultsList');
  if (!results) return;
  if (!q) { results.innerHTML = '<p class="search-hint">Start typing to find props or setups...</p>'; return; }

  // Search from categories in nav
  const navLinks = Array.from(document.querySelectorAll('#navMenu a'));
  const matched  = navLinks.filter(a => a.textContent.toLowerCase().includes(q));

  if (matched.length === 0) {
    results.innerHTML = `<p class="search-hint">No results found for "<em>${q}</em>"</p>`;
  } else {
    results.innerHTML = matched.map(a =>
      `<a href="${a.href}" onclick="closeSearchDrawer()" style="display:block;padding:10px 8px;border-bottom:1px solid var(--border-color);font-size:0.86rem;color:var(--text-primary);transition:color 0.15s">${a.textContent}</a>`
    ).join('');
  }
}

function triggerPresetSearch(q) {
  const inp = document.getElementById('searchInput');
  if (inp) { inp.value = q; handleSearchInput(); }
  addSearchHistory(q);
}

function addSearchHistory(q) {
  if (!searchHistory.includes(q)) {
    searchHistory.unshift(q);
    searchHistory = searchHistory.slice(0, 6);
    localStorage.setItem('skSearch', JSON.stringify(searchHistory));
    renderSearchHistory();
  }
}

function renderSearchHistory() {
  const section = document.getElementById('searchHistorySection');
  const chips   = document.getElementById('searchHistoryChips');
  if (!section || !chips) return;
  if (searchHistory.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  chips.innerHTML = searchHistory.map(h =>
    `<span class="search-chip" onclick="triggerPresetSearch('${h}')">${h}</span>`
  ).join('');
}

/* ─── 13. BOOKING MODAL ───────────────────────────────────── */
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

function buildPackageSelector() {
  const sel = document.getElementById('bookingPackage');
  if (!sel) return;
  BOOKING_PACKAGES.forEach(pkg => {
    const opt  = document.createElement('option');
    opt.value  = pkg.id;
    opt.textContent = `${pkg.name} — ₹${pkg.price.toLocaleString()} (${pkg.duration})`;
    opt.dataset.price = pkg.price;
    sel.appendChild(opt);
  });
}

function calculateBookingTotal() {
  const sel = document.getElementById('bookingPackage');
  const el  = document.getElementById('bookingTotalText');
  if (!sel || !el) return;
  const opt = sel.options[sel.selectedIndex];
  if (!opt || !opt.dataset.price) { el.textContent = 'Select a package'; return; }
  let price = parseInt(opt.dataset.price, 10);
  if (discountPct > 0) price = Math.round(price * (1 - discountPct / 100));
  el.textContent = `₹${price.toLocaleString()}`;
}

function applyBookingCoupon() {
  const code    = (document.getElementById('bookingCoupon')?.value || '').trim().toUpperCase();
  const fbEl    = document.getElementById('couponFeedback');
  if (!code) return;
  const pct = VALID_COUPONS[code];
  if (pct) {
    discountPct       = pct;
    bookingCouponCode = code;
    if (fbEl) { fbEl.textContent = `✓ Coupon applied! ${pct}% off`; fbEl.style.color = 'var(--success-green)'; }
    calculateBookingTotal();
  } else {
    discountPct = 0;
    if (fbEl) { fbEl.textContent = '✗ Invalid coupon code'; fbEl.style.color = 'var(--discount-red)'; }
  }
}

function selectPaymentMethod(method) {
  const online = document.getElementById('onlinePaymentSection');
  if (!online) return;
  online.style.display = method === 'online' ? 'block' : 'none';
  const submitBtn = document.getElementById('bookingSubmitBtn');
  if (submitBtn) {
    submitBtn.textContent = method === 'online'
      ? 'Pay & Confirm Booking'
      : 'Confirm & Book via WhatsApp';
  }
}

function switchPaymentTab(tab) {
  const cardFields = document.getElementById('cardPaymentFields');
  const upiFields  = document.getElementById('upiPaymentFields');
  const tabCard    = document.getElementById('tabCard');
  const tabUPI     = document.getElementById('tabUPI');
  if (!cardFields || !upiFields) return;
  cardFields.style.display = tab === 'card' ? 'flex' : 'none';
  upiFields.style.display  = tab === 'upi'  ? 'block' : 'none';
  tabCard.classList.toggle('active', tab === 'card');
  tabUPI.classList.toggle('active', tab === 'upi');
}

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function formatCardExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0,2) + '/' + v.substring(2);
  input.value = v;
}

function submitBooking() {
  const name   = document.getElementById('bookingName')?.value.trim();
  const phone  = document.getElementById('bookingPhone')?.value.trim();
  const pkg    = document.getElementById('bookingPackage')?.value;
  if (!name || !phone || !pkg) { showToast('Please fill all required fields.', 'error'); return; }
  if (!selectedDate)           { showToast('Please select a date.',             'error'); return; }
  if (!selectedSlot)           { showToast('Please select a time slot.',        'error'); return; }

  const radios  = document.querySelectorAll('input[name="paymentMethod"]');
  const method  = [...radios].find(r => r.checked)?.value || 'whatsapp';

  if (method === 'whatsapp') {
    // Send WhatsApp message
    const pkgOpt  = document.getElementById('bookingPackage').options;
    const pkgName = pkgOpt[pkgOpt.selectedIndex]?.textContent || pkg;
    const dateStr = selectedDate.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const msg = encodeURIComponent(
      `*NEW BOOKING — SK STUDIO PUNE*\n\n` +
      `Name: ${name}\nPhone: ${phone}\nPackage: ${pkgName}\nDate: ${dateStr}\nTime: ${selectedSlot}` +
      `${bookingCouponCode ? `\nCoupon: ${bookingCouponCode}` : ''}\n\nPlease confirm my booking. Thank you!`
    );
    closeBookingModal();
    showToast('Redirecting to WhatsApp to confirm your booking…');
    setTimeout(() => { window.open(`https://wa.me/919307112119?text=${msg}`, '_blank'); }, 600);
  } else {
    // Simulate payment processing
    const overlay = document.getElementById('checkoutOverlay');
    if (overlay) overlay.style.display = 'flex';
    closeBookingModal();
    const steps = ['Initialising secure payment gateway…','Verifying your details…','Processing payment…','Booking confirmed!'];
    let s = 0;
    const iv = setInterval(() => {
      const el = document.getElementById('checkoutStatusText');
      if (el && steps[s]) el.textContent = steps[s++];
      if (s >= steps.length) {
        clearInterval(iv);
        setTimeout(() => { if (overlay) overlay.style.display = 'none'; showToast('🎉 Booking confirmed! Check your email.'); }, 1000);
      }
    }, 1200);
  }
}

/* ─── 14. CALENDAR WIDGET ─────────────────────────────────── */
function buildCalendar() {
  const grid  = document.getElementById('calendarDaysGrid');
  const title = document.getElementById('calendarMonthYear');
  if (!grid) return;

  const today = new Date();
  today.setHours(0,0,0,0);

  const y = currentCalDate.getFullYear();
  const m = currentCalDate.getMonth();

  if (title) title.textContent = currentCalDate.toLocaleString('en-IN', { month:'long', year:'numeric' });

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  grid.innerHTML = '';

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = d;

    const isToday    = date.getTime() === today.getTime();
    const isPast     = date < today;
    const isSunday   = date.getDay() === 0;
    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

    if (isToday) dayEl.classList.add('today');
    if (isSelected) dayEl.classList.add('selected');
    if (isPast || isSunday) dayEl.classList.add('disabled');
    else dayEl.addEventListener('click', () => selectCalendarDate(date));

    grid.appendChild(dayEl);
  }
}

function selectCalendarDate(date) {
  selectedDate = date;
  buildCalendar();
  const display = document.getElementById('selectedDateDisplay');
  if (display) display.textContent = date.toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
}

function prevCalendarMonth() {
  currentCalDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1);
  buildCalendar();
}
function nextCalendarMonth() {
  currentCalDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1);
  buildCalendar();
}

function selectTimeSlot(btn) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSlot = btn.textContent;
  const display = document.getElementById('selectedSlotDisplay');
  if (display) display.textContent = `Time: ${selectedSlot}`;
}

/* ─── 15. CHATBOT ────────────────────────────────────────── */
function toggleChatbot() {
  const widget = document.getElementById('chatbotWidget');
  if (!widget) return;
  widget.classList.toggle('active');
}

function sendChatbotMessage() {
  const inp = document.getElementById('chatbotInput');
  const msg = (inp?.value || '').trim();
  if (!msg) return;
  if (inp) inp.value = '';
  appendChatBubble(msg, 'user');
  const reply = generateChatbotReply(msg);
  setTimeout(() => appendChatBubble(reply, 'bot'), 600);
}

function appendChatBubble(text, type) {
  const msgs = document.getElementById('chatbotMessages');
  if (!msgs) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  bubble.textContent = text;
  msgs.appendChild(bubble);
  msgs.scrollTop = msgs.scrollHeight;
}

function generateChatbotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('book') || m.includes('session'))          return 'You can book a session right here! Click the "Book a Session" button, choose your package and preferred date, and we\'ll confirm via WhatsApp. 😊';
  if (m.includes('price') || m.includes('cost'))            return 'Our packages start from ₹1,499 for a Portrait session up to ₹19,999 for a Full-Day Wedding shoot. Open the booking modal to see all packages!';
  if (m.includes('location') || m.includes('address'))      return 'We are based in Pune, India. Click 📍 View on Map in our footer for directions!';
  if (m.includes('baby') || m.includes('newborn'))          return 'We offer beautiful baby & newborn shoot packages starting at ₹2,499. Our Baby Shoot Essential includes 20 edited photos in 2 hours!';
  if (m.includes('wedding') || m.includes('pre-wedding'))   return 'Our Pre-Wedding packages start from ₹9,999 and Full Wedding Day coverage from ₹19,999. Both include professional editing and reels!';
  if (m.includes('maternity') || m.includes('pregnancy'))   return 'Celebrate your pregnancy with our Maternity Classic (₹2,999) or Luxury package (₹4,999) for a full glamour experience!';
  if (m.includes('contact') || m.includes('phone'))         return 'You can reach us at +91 93071 12119 or via WhatsApp anytime between 9 AM – 8 PM!';
  if (m.includes('coupon') || m.includes('discount'))       return 'Try coupon codes: STUDIO20 (20% off), SKPUNE10 (10% off), or FIRST15 (15% off for first timers!) 🎉';
  if (m.includes('hi') || m.includes('hello') || m.includes('hey')) return 'Hello! Welcome to SK Studio Pune! 🌸 How can I assist you today?';
  return 'Thanks for reaching out! For detailed queries, please WhatsApp us at +91 93071 12119 or use the "Book a Session" button to reserve your slot. We\'d love to capture your beautiful moments! 📸';
}

/* ─── 16. DARK MODE ─────────────────────────────────────── */
function initDarkMode() {
  const saved = localStorage.getItem('skTheme');
  if (saved === 'dark') applyDarkMode(true, false);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('skTheme', isDark ? 'dark' : 'light');
  applyDarkMode(isDark, true);
}

function applyDarkMode(dark, animate) {
  if (!animate) document.body.classList.toggle('dark-theme', dark);
  const moon = document.querySelector('.icon-moon');
  const sun  = document.querySelector('.icon-sun');
  if (moon) moon.style.display = dark ? 'none' : 'block';
  if (sun)  sun.style.display  = dark ? 'block' : 'none';
}

/* ─── 17. AUTH STATUS ────────────────────────────────────── */
async function initAuth() {
  try {
    const res = await fetch('/auth/status');
    if (!res.ok) return;
    const data = await res.json();
    const btn      = document.getElementById('authButton');
    const btnText  = document.getElementById('authButtonText');
    if (!btn || !btnText) return;
    if (data.loggedIn) {
      btnText.textContent = data.user?.name?.split(' ')[0] || 'Account';
      btn.href = '/account';
    }
  } catch (_) {/* silent */}
}

/* ─── 18. PWA ────────────────────────────────────────────── */
function initPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    pwaInstallEvent = e;
    setTimeout(() => {
      const banner = document.getElementById('pwaBanner');
      if (banner && !localStorage.getItem('pwaDismissed')) banner.classList.add('active');
    }, 4000);
  });
}
function installPWA() {
  if (pwaInstallEvent) {
    pwaInstallEvent.prompt();
    pwaInstallEvent.userChoice.then(r => {
      if (r.outcome === 'accepted') closePWABanner();
    });
  }
}
function closePWABanner() {
  const banner = document.getElementById('pwaBanner');
  if (banner) banner.classList.remove('active');
  localStorage.setItem('pwaDismissed', '1');
}

/* ─── 19. TOAST NOTIFICATIONS ─────────────────────────────── */
let toastContainer = null;
function showToast(msg, type = 'success') {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    Object.assign(toastContainer.style, {
      position:'fixed', top:'22px', right:'22px',
      zIndex:'99999', display:'flex', flexDirection:'column', gap:'10px'
    });
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  Object.assign(toast.style, {
    background: type === 'error' ? 'var(--discount-red)' : 'var(--text-primary)',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: 'var(--r-full)',
    fontSize: '0.84rem',
    fontWeight: '600',
    boxShadow: 'var(--shadow-lg)',
    transform: 'translateX(120%)',
    transition: 'transform 0.36s cubic-bezier(0.16,1,0.3,1)',
    maxWidth: '340px',
    lineHeight: '1.4',
  });
  toast.textContent = msg;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

/* ─── 20. PRODUCT CARD EVENT DELEGATION ──────────────────── */
document.addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  const product = {
    id:            card.dataset.id            || '',
    name:          card.querySelector('.product-title')?.textContent || 'Product',
    image:         card.querySelector('img')?.src || '',
    price:         card.querySelector('.sale-price, .current-price')?.textContent || '',
    originalPrice: card.querySelector('.original-price')?.textContent || '',
    discount:      card.querySelector('.discount-tag')?.textContent || '',
    description:   card.dataset.description || 'Beautiful handcrafted prop perfect for photography sessions.',
  };
  openProductModal(product);
});

/* ─── 21. ADMIN REAL-TIME SYNC (SSE) ──────────────────────── */
// Connect to the server's SSE endpoint for admin changes push
(function initSSE() {
  if (!window.EventSource) return;
  const es = new EventSource('/events');
  es.addEventListener('content-updated', () => {
    // Full page content was updated by admin; reload to reflect changes
    window.location.reload();
  });
  es.addEventListener('visual-change', e => {
    try {
      const data = JSON.parse(e.data);
      if (data && window.__APPLY_VISUAL_CHANGES__) {
        // Merge new changes into existing
        window.__APPLY_VISUAL_CHANGES__();
      }
    } catch (_) {}
  });
  es.onerror = () => { es.close(); };
})();

/* ─── 22. MISC ────────────────────────────────────────────── */
// Smooth anchor scrolling
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (target) { e.preventDefault(); target.scrollIntoView({ behavior:'smooth' }); }
});

// Keyboard: Escape key closes all modals
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeProductModal();
  closeBookingModal();
  closeSearchDrawer();
  closeMobileMenu();
});

/* ─── 23. LENIS SMOOTH SCROLL ─────────────────────────────── */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // Connect Lenis to GSAP ScrollTrigger if available
  if (typeof gsap !== 'undefined' && gsap.ticker) {
    lenis.on('scroll', () => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update(); });
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ─── 24. GSAP SCROLL ANIMATIONS ──────────────────────────── */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  // Animate section headers on scroll
  gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // Animate theme cards with stagger
  gsap.utils.toArray('.themes-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.theme-card');
    if (cards.length === 0) return;
    gsap.from(cards, {
      scrollTrigger: {
        trigger: grid,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 80,
      scale: 0.92,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out'
    });
  });

  // Animate product cards with stagger
  gsap.utils.toArray('.products-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.product-card');
    if (cards.length === 0) return;
    gsap.from(cards, {
      scrollTrigger: {
        trigger: grid,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 60,
      scale: 0.95,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out'
    });
  });

  // Parallax effect for parallax banner (smoother with GSAP)
  const parallaxBg = document.getElementById('parallaxBg');
  if (parallaxBg && typeof ScrollTrigger !== 'undefined') {
    gsap.to(parallaxBg, {
      scrollTrigger: {
        trigger: '.parallax-banner',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      },
      y: -120,
      ease: 'none'
    });
  }

  // Animate stats numbers with scale
  gsap.utils.toArray('.stat-item').forEach(item => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)'
    });
  });

  // Animate gallery masonry items
  gsap.utils.toArray('.masonry-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 40,
      duration: 0.6,
      delay: (i % 4) * 0.08,
      ease: 'power2.out'
    });
  });

  // Hero content entrance animation (enhanced)
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    gsap.fromTo(heroContent, 
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 }
    );
  }

  // Magnetic hover effect for buttons
  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
  });
}

/* ─── 25. SWIPER TESTIMONIALS ─────────────────────────────── */
function initSwiperTestimonials() {
  if (typeof Swiper === 'undefined') return;
  const el = document.querySelector('.testimonials-swiper');
  if (!el) return;
  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      640: { slidesPerView: 1, spaceBetween: 20 },
      768: { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 28 }
    },
    effect: 'slide',
    speed: 700
  });
}

/* ─── 26. INITIALIZE NEW FEATURES ─────────────────────────── */
// Wait for all CDN scripts to load, then initialize
window.addEventListener('load', () => {
  initLenis();
  initGSAPAnimations();
  initSwiperTestimonials();
});
