/* ============================================
   TECHNOVA - TIENDA DE TECNOLOGÍA
   js/index.js
   ============================================ */

/* ============================================
   1. ESTADO GLOBAL
   ============================================ */
const state = {
  cart: [],          // Array de { id, name, price, qty }
  itemIdCounter: 0   // Para IDs únicos de items
};

/* ============================================
   2. NAVBAR: SCROLL + HAMBURGER + ACTIVE LINKS
   ============================================ */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

// Agregar clase scrolled al hacer scroll
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNavLink();
});

// Hamburger toggle (mobile)
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Cerrar menú mobile al hacer clic en un link
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Resaltar sección activa según scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let currentSection = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      currentSection = section.getAttribute('id');
    }
  });
  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
  });
}

/* ============================================
   3. HERO PARTICLES
   ============================================ */
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const colors = ['#0066ff', '#7c3aed', '#a855f7', '#3d8bff'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 4 + 2;
    const x    = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur   = Math.random() * 10 + 8;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      left: ${x}%;
      bottom: ${Math.random() * 20}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 3}px ${color};
    `;
    container.appendChild(particle);
  }
}

createParticles();

/* ============================================
   4. COUNTDOWN TIMER (Ofertas)
   ============================================ */
function initCountdown() {
  // Setear 23:59:59 desde ahora (simulación)
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 5);
  endTime.setMinutes(endTime.getMinutes() + 47);
  endTime.setSeconds(endTime.getSeconds() + 33);

  const tHours = document.getElementById('tHours');
  const tMins  = document.getElementById('tMins');
  const tSecs  = document.getElementById('tSecs');

  if (!tHours) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateTimer() {
    const now  = new Date();
    const diff = Math.max(0, endTime - now);

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    tHours.textContent = pad(h);
    tMins.textContent  = pad(m);
    tSecs.textContent  = pad(s);

    if (diff <= 0) clearInterval(timerInterval);
  }

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}

initCountdown();

/* ============================================
   5. FILTRO DE PRODUCTOS
   ============================================ */
const filterBtns  = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card[data-category]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Actualizar botón activo
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    productCards.forEach((card, i) => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);

      // Re-animar las tarjetas visibles con delay escalonado
      if (match) {
        card.style.animationDelay = `${i * 0.05}s`;
        card.classList.remove('reveal');
        void card.offsetWidth; // reflow
      }
    });
  });
});

/* ============================================
   6. CARRITO DE COMPRAS
   ============================================ */
const cartBtn     = document.getElementById('cartBtn');
const cartBadge   = document.getElementById('cartBadge');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');
const cartItems   = document.getElementById('cartItems');
const cartFooter  = document.getElementById('cartFooter');
const cartTotal   = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Abrir carrito
cartBtn.addEventListener('click', () => {
  cartOverlay.classList.add('open');
  renderCart();
});

// Cerrar carrito
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', e => {
  if (e.target === cartOverlay) closeCart();
});

// Cerrar con ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCart();
});

function closeCart() {
  cartOverlay.classList.remove('open');
}

/**
 * Agrega un producto al carrito.
 * @param {string} name  - Nombre del producto
 * @param {number} price - Precio numérico
 * @param {HTMLElement} [btn] - Botón que disparó la acción (para feedback visual)
 */
function addToCart(name, price, btn) {
  const existing = state.cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: ++state.itemIdCounter,
      name,
      price: Number(price),
      qty: 1
    });
  }

  updateCartBadge();
  showToast(`✅ ${name} agregado al carrito`);

  // Feedback visual en el botón
  if (btn) {
    btn.classList.add('added');
    const original = btn.innerHTML;
    btn.innerHTML = '<span>✓ Agregado</span>';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = original;
    }, 1800);
  }
}

/**
 * Función expuesta globalmente para uso en atributos onclick (ofertas)
 */
window.addToCartDirect = function(name, price) {
  addToCart(name, price, null);
};

/**
 * Vincula todos los botones "Agregar al carrito"
 */
function bindCartButtons() {
  document.querySelectorAll('.btn-cart[data-name]').forEach(btn => {
    // Evitar duplicar listeners
    btn.replaceWith(btn.cloneNode(true));
  });

  document.querySelectorAll('.btn-cart[data-name]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.name, btn.dataset.price, btn);
    });
  });
}

bindCartButtons();

/**
 * Actualiza el contador del badge en el navbar
 */
function updateCartBadge() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = totalQty;
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 400);
}

/**
 * Renderiza el contenido del carrito modal
 */
function renderCart() {
  cartItems.innerHTML = '';

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty">🛒 Tu carrito está vacío</div>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';

  state.cart.forEach(item => {
    const el = document.createElement('div');
    el.classList.add('cart-item');
    el.dataset.id = item.id;
    el.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
      </div>
    `;
    cartItems.appendChild(el);
  });

  // Controles de cantidad
  cartItems.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = Number(btn.dataset.id);
      const action = btn.dataset.action;
      const item   = state.cart.find(i => i.id === id);
      if (!item) return;

      if (action === 'inc') {
        item.qty += 1;
      } else {
        item.qty -= 1;
        if (item.qty <= 0) {
          state.cart = state.cart.filter(i => i.id !== id);
        }
      }

      updateCartBadge();
      renderCart();
    });
  });

  // Total
  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = `$${total.toLocaleString()}`;
}

// Botón checkout (simulación)
checkoutBtn.addEventListener('click', () => {
  if (state.cart.length === 0) return;
  state.cart = [];
  updateCartBadge();
  closeCart();
  showToast('🎉 ¡Compra realizada con éxito! Gracias por tu pedido.');
});

/* ============================================
   7. TOAST NOTIFICATIONS
   ============================================ */
let toastTimeout;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================
   8. VALIDACIÓN DEL FORMULARIO DE CONTACTO
   ============================================ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

/**
 * Reglas de validación
 */
const validations = {
  nombre: {
    el: () => document.getElementById('nombre'),
    errEl: () => document.getElementById('errorNombre'),
    validate(val) {
      if (!val.trim()) return 'El nombre es obligatorio.';
      if (val.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      return '';
    }
  },
  email: {
    el: () => document.getElementById('email'),
    errEl: () => document.getElementById('errorEmail'),
    validate(val) {
      if (!val.trim()) return 'El correo electrónico es obligatorio.';
      // Validación con expresión regular RFC 5322 simplificada
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val.trim())) return 'Ingresa un correo electrónico válido.';
      return '';
    }
  },
  telefono: {
    el: () => document.getElementById('telefono'),
    errEl: () => document.getElementById('errorTelefono'),
    validate(val) {
      if (!val.trim()) return 'El teléfono es obligatorio.';
      // Solo números y longitud entre 7 y 15 dígitos
      const phoneRegex = /^\d{7,15}$/;
      if (!phoneRegex.test(val.trim())) return 'Ingresa solo números (entre 7 y 15 dígitos).';
      return '';
    }
  },
  mensaje: {
    el: () => document.getElementById('mensaje'),
    errEl: () => document.getElementById('errorMensaje'),
    validate(val) {
      if (!val.trim()) return 'El mensaje es obligatorio.';
      if (val.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
      return '';
    }
  }
};

/**
 * Muestra u oculta el error de un campo
 * @param {string} field - Clave en validations
 * @param {string} errorMsg - Mensaje de error vacío = sin error
 */
function setFieldState(field, errorMsg) {
  const input  = validations[field].el();
  const errEl  = validations[field].errEl();

  errEl.textContent = errorMsg;

  if (errorMsg) {
    input.classList.add('error');
    input.classList.remove('success');
  } else {
    input.classList.remove('error');
    input.classList.add('success');
  }
}

/**
 * Valida un solo campo en tiempo real (blur / input)
 */
function validateField(field) {
  const input  = validations[field].el();
  const error  = validations[field].validate(input.value);
  setFieldState(field, error);
  return error === '';
}

/**
 * Valida todos los campos y devuelve true si todo es válido
 */
function validateForm() {
  let isValid = true;
  Object.keys(validations).forEach(field => {
    if (!validateField(field)) isValid = false;
  });
  return isValid;
}

// Validación en tiempo real al perder el foco
Object.keys(validations).forEach(field => {
  const input = validations[field].el();
  input.addEventListener('blur', () => validateField(field));
  // Limpiar error mientras escribe
  input.addEventListener('input', () => {
    if (input.classList.contains('error')) validateField(field);
  });
});

// Solo permitir números en teléfono
document.getElementById('telefono').addEventListener('keypress', e => {
  if (!/[0-9]/.test(e.key)) e.preventDefault();
});

// Submit del formulario
contactForm.addEventListener('submit', e => {
  e.preventDefault(); // Prevenir envío nativo siempre

  const isValid = validateForm();

  if (!isValid) {
    // Enfocar primer campo con error
    const firstError = Object.keys(validations).find(field => {
      return validations[field].el().classList.contains('error');
    });
    if (firstError) validations[firstError].el().focus();
    showToast('⚠️ Revisa los errores del formulario.');
    return;
  }

  // Simulación de envío (podría ser fetch/AJAX)
  simulateFormSubmit();
});

/**
 * Simula el envío del formulario con un pequeño delay
 */
function simulateFormSubmit() {
  const submitBtn = contactForm.querySelector('[type="submit"]');
  const originalHTML = submitBtn.innerHTML;

  // Estado de carga
  submitBtn.innerHTML = '<span>Enviando...</span><span>⏳</span>';
  submitBtn.disabled = true;

  setTimeout(() => {
    // Éxito
    contactForm.reset();

    // Limpiar estados visuales
    Object.keys(validations).forEach(field => {
      const input = validations[field].el();
      input.classList.remove('success', 'error');
    });

    // Mostrar mensaje de éxito
    formSuccess.classList.add('visible');
    showToast('✅ Mensaje enviado correctamente.');

    // Restaurar botón
    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;

    // Ocultar mensaje de éxito después de 5 segundos
    setTimeout(() => formSuccess.classList.remove('visible'), 5000);
  }, 1500);
}

/* ============================================
   9. REVEAL ON SCROLL (Intersection Observer)
   ============================================ */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.product-card, .offer-card, .contact-item, .contact-form, .footer-brand, .footer-links, .footer-social'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

// Iniciar observer cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
  initScrollReveal();
}

/* ============================================
   10. SMOOTH SCROLL para links internos
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================
   11. INICIALIZACIÓN
   ============================================ */
console.log('%c⚡ TechNova cargado correctamente', 'color:#0066ff;font-weight:bold;font-size:14px;');