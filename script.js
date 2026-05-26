/* ============================================================
   ON-RAI Gaming — script.js (FIXED & TESTED VERSION)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Helpers ── */
  const $   = (id) => document.getElementById(id);
  const key = 'onraiCart';

  const getCart  = () => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
  const saveCart = (c) => { localStorage.setItem(key, JSON.stringify(c)); updateCount(); };

  const updateCount = () => {
    const el = $('cart-count');
    if (el) el.textContent = getCart().reduce((s, i) => s + i.qty, 0);
  };

  const showMsg = (el, text, ok) => {
    if (!el) return;
    el.textContent = text;
    el.style.color   = ok ? 'green' : '#c00';
    el.style.display = 'block';
  };

  const toast = (text) => {
    const el = $('toast');
    
    if (el) {
      el.textContent    = text;
      el.style.display  = 'block';
      setTimeout(() => el.style.display = 'none', 1800);
    } else {
      alert(text); 
    }
  };

  /* ── Cart Logic ── */
  const addToCart = (name, price) => {
    const c = getCart();
    const item = c.find(x => x.name === name);
    if (item) item.qty++; else c.push({ name, price, qty: 1 });
    saveCart(c);
    toast(name + ' added to cart!');
  };

  const renderCart = () => {
    const tbody = document.querySelector('#cartTable tbody');
 
    if (!tbody) return; 

    const c    = getCart();
    const sub  = c.reduce((s, i) => s + i.price * i.qty, 0);
    const tax  = sub * 0.1;
    const ship = sub > 0 ? 25 : 0;
    const total = sub + tax + ship;

    tbody.innerHTML = !c.length 
      ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#999;">Your cart is empty</td></tr>'
      : c.map((item, idx) => `
          <tr>
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><input type="number" min="1" value="${item.qty}" data-idx="${idx}"
                 style="width:70px;padding:0.5rem;font-size:1rem;font-weight:bold;
                        text-align:center;border:2px solid var(--accent,#00d4ff);background:#fff"></td>
            <td>$${(item.price * item.qty).toFixed(2)}</td>
            <td><button class="btn rm-btn" data-idx="${idx}">Remove</button></td>
          </tr>`).join('');

    /* Totals */
    const ids  = ['subTotal','taxTotal','shippingTotal','cartTotal'];
    const vals = [sub, tax, ship, total];
    ids.forEach((id, i) => { const el = $(id); if (el) el.textContent = '$' + vals[i].toFixed(2); });

    /* Qty change */
    tbody.querySelectorAll('input[data-idx]').forEach(inp => {
      inp.onchange = () => {
        const c = getCart();
        c[inp.dataset.idx].qty = Math.max(1, +inp.value || 1);
        saveCart(c);
        renderCart();
      };
    });

    /* Remove */
    tbody.querySelectorAll('.rm-btn').forEach(btn => {
      btn.onclick = () => {
        const c = getCart();
        c.splice(btn.dataset.idx, 1);
        saveCart(c);
        renderCart();
      };
    });

    /* Checkout */
    const checkBtn = $('checkoutBtn');
    if (checkBtn) checkBtn.onclick = () => {
      if (!getCart().length) return showMsg($('checkoutMessage'), 'Cart is empty!', false);
      showMsg($('checkoutMessage'), `✅ Order placed! Total: $${total.toFixed(2)}`, true);
      localStorage.removeItem(key);
      updateCount();
      renderCart();
    };

    /* Clear */
    const clearBtn = $('clearCart');
    if (clearBtn) clearBtn.onclick = () => {
      localStorage.removeItem(key);
      updateCount();
      renderCart();
      toast('Cart cleared');
    };
  };

  /* ── Bind Add to Cart Buttons ── */
  const setupAddToCartButtons = () => {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));

        if (name && !isNaN(price)) {
          addToCart(name, price);
        }
      });
    });
  };

  /* ── Login / Logout ── */
  const setupLogin = () => {
    const btn   = $('loginBtn');
    const modal = $('loginModal');
    const form  = $('loginForm');
    if (!btn || !modal || !form) return;

    const authUser = localStorage.getItem('authUser');

    if (authUser) {
      btn.textContent = `Logout (${authUser})`;
      btn.onclick = () => {
        localStorage.removeItem('authUser');
        toast('Logged out');
        setTimeout(() => window.location.reload(), 800);
      };
      return;
    }

    btn.onclick = () => modal.style.display = 'flex';

    const cancelBtn = $('loginCancel');
    if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';

    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    form.onsubmit = (e) => {
      e.preventDefault();
      const user = $('login-user').value.trim();
      const pass = $('login-pass').value.trim();
      if (!user || !pass) return showMsg($('loginMessage'), 'Please fill all fields', false);
      localStorage.setItem('authUser', user);
      modal.style.display = 'none';
      toast(`Welcome, ${user}!`);
      setTimeout(() => window.location.href = 'index.html', 800);
    };
  };

  /* ── Side Menu ── */
  const setupMenu = () => {
    const openBtn  = $('menuBtn');
    const side     = $('sidemenu');
    const closeBtn = $('closeMenu');
    if (!openBtn || !side || !closeBtn) return;
    openBtn.onclick  = () => side.style.left = '0';
    closeBtn.onclick = () => side.style.left = '-260px';
  };

  /* ── Slideshow ── */
  const setupSlideshow = () => {
    const slides   = document.querySelectorAll('.slide');
    const nextBtn  = document.querySelector('.next');
    const prevBtn  = document.querySelector('.prev');
    if (!slides.length || !nextBtn || !prevBtn) return;

    let idx = 0;
    const show = (i) => slides.forEach((s, x) => s.classList.toggle('active', x === i));

    nextBtn.onclick = () => { idx = (idx + 1) % slides.length; show(idx); };
    prevBtn.onclick = () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); };
    show(0);
    setInterval(() => { idx = (idx + 1) % slides.length; show(idx); }, 4000);
  };

  /* ── Contact Form ── */
  const setupContact = () => {
    const form = $('contactForm');
    if (!form) return;
    form.onsubmit = (e) => {
      e.preventDefault();
      const name    = $('name').value.trim();
      const email   = $('email').value.trim();
      const message = $('message').value.trim();
      if (!name || !email || !message) return showMsg($('contactMessage'), 'Please fill all fields', false);
      if (!email.includes('@'))        return showMsg($('contactMessage'), 'Invalid email address', false);
      showMsg($('contactMessage'), '✅ Message sent! We\'ll reply within 2 hours.', true);
      form.reset();
    };
  };

  /* ── Build Configurator ── */
  const setupBuild = () => {
    const form   = $('buildForm');
    const cpu    = $('cpu');
    const gpu    = $('gpu');
    const ram    = $('ram');
    const addBtn = $('addBuildBtn');
    if (!form || !cpu || !gpu || !ram || !addBtn) return;

    const calcPrice = () => {
      const total = [cpu, gpu, ram].reduce((s, el) => s + Number(el.value || 0), 0);
      const el = $('buildPrice');
      if (el) el.textContent = '$' + total.toFixed(2);
      return total;
    };

    [cpu, gpu, ram].forEach(el => el.addEventListener('change', calcPrice));

    addBtn.onclick = () => {
      const total = calcPrice();
      if (!total) return showMsg($('buildMessage'), 'Please select at least one component', false);
      const parts = [cpu, gpu, ram]
        .filter(el => Number(el.value) > 0)
        .map(el => el.options[el.selectedIndex].text)
        .join(' | ');
      addToCart(`Custom PC: ${parts}`, total);
      showMsg($('buildMessage'), '✅ Custom build added to cart!', true);
    };
  };

  /* ── الترتيب الجديد والآمن للتشغيل ── */
  updateCount();
  setupAddToCartButtons();
  setupLogin();
  setupMenu();
  setupSlideshow();
  setupContact();
  setupBuild();
  renderCart(); 

});