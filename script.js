// ===== DATA MENU =====
const menuItems = [
    { id: 1, name: 'Espresso', desc: 'Kopi hitam pekat khas Italia', price: 25000, img: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop', category: 'minuman' },
    { id: 2, name: 'Cappuccino', desc: 'Espresso dengan busa susu lembut', price: 35000, img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', category: 'minuman' },
    { id: 3, name: 'Latte', desc: 'Kopi susu yang creamy', price: 38000, img: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop', category: 'minuman' },
    { id: 4, name: 'Mocha', desc: 'Campuran coklat dan kopi', price: 40000, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', category: 'minuman' },
    { id: 5, name: 'Croissant', desc: 'Pastry renyah berlapis mentega', price: 22000, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=300&fit=crop', category: 'makanan' },
    { id: 6, name: 'Cheesecake', desc: 'Kue keju lembut dengan topping buah', price: 45000, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', category: 'makanan' },
    { id: 7, name: 'Brownies', desc: 'Brownies coklat lumer', price: 30000, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', category: 'makanan' },
    { id: 8, name: 'Teh Hijau', desc: 'Teh hijau asli Jepang', price: 20000, img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop', category: 'minuman' }
];

// Mystery drink base
const MYSTERY_DRINK = { id: 99, name: 'Mystery Drink', desc: 'Kejutan spesial dari barista', price: 40000, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop' };
const DISCOUNT_SEGMENTS = [
    { label: 'Diskon 10%', discount: 0.1 },
    { label: 'Diskon 20%', discount: 0.2 },
    { label: 'Diskon 30%', discount: 0.3 },
    { label: 'Diskon 50%', discount: 0.5 },
    { label: 'GRATIS!', discount: 1.0 },
    { label: 'Diskon 15%', discount: 0.15 },
    { label: 'Diskon 25%', discount: 0.25 },
    { label: 'Diskon 5%', discount: 0.05 }
];

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let spinUsed = sessionStorage.getItem('spinUsed') === 'true';

// ===== DOM ELEMENTS =====
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const cartBadge = document.getElementById('cartBadge');
const menuGrid = document.getElementById('menuGrid');
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalDiv = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const mysteryBtn = document.getElementById('mysteryBtn');
const spinModal = document.getElementById('spinModal');
const closeSpin = document.getElementById('closeSpin');
const spinBtn = document.getElementById('spinBtn');
const spinResult = document.getElementById('spinResult');
const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');

// ===== NAVIGATION =====
function navigateTo(pageName) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`${pageName}-page`).classList.add('active');
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    if (pageName === 'menu') renderMenu();
    if (pageName === 'cart') renderCart();
    if (pageName === 'orders') renderOrders();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateTo(page);
    });
});

// Hamburger menu
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});

// ===== RENDER MENU =====
function renderMenu() {
    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-card">
            <img src="${item.img}" alt="${item.name}">
            <div class="menu-info">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
                <div>
                    <div class="menu-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    <button class="btn-add" data-id="${item.id}">+ Tambahkan</button>
                </div>
            </div>
        </div>
    `).join('');

    // Event listener untuk tombol tambah
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            addToCart(id);
        });
    });

    // Mystery button state
    mysteryBtn.disabled = spinUsed;
    if (spinUsed) mysteryBtn.textContent = '🎁 Kejutan sudah digunakan (refresh untuk ulang)';
    else mysteryBtn.textContent = '🎁 Pesan Kejutan (Mystery Drink)';
}

// ===== CART FUNCTIONS =====
function addToCart(itemId, customPrice = null, customName = null) {
    const menuItem = menuItems.find(i => i.id === itemId) || MYSTERY_DRINK;
    const price = customPrice !== null ? customPrice : menuItem.price;
    const name = customName || menuItem.name;

    const existing = cart.find(item => item.id === itemId && item.name === name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: itemId, name, price, quantity: 1, img: menuItem.img });
    }
    saveCart();
    updateCartBadge();
    alert(`${name} ditambahkan ke keranjang`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartBadge();
}

function changeQuantity(index, delta) {
    if (cart[index].quantity + delta <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity += delta;
        saveCart();
        renderCart();
    }
    updateCartBadge();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalQty;
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Keranjang kosong.</p>';
        cartTotalDiv.innerHTML = '';
        checkoutBtn.disabled = true;
        return;
    }

    cartItemsDiv.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <img src="${item.img}" alt="${item.name}">
                <div>
                    <strong>${item.name}</strong><br>
                    Rp ${item.price.toLocaleString('id-ID')}
                </div>
            </div>
            <div class="quantity-control">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeFromCart(${index})" style="background:#D9534F;">🗑</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalDiv.innerHTML = `Total: <strong>Rp ${total.toLocaleString('id-ID')}</strong>`;
    checkoutBtn.disabled = false;
}

// ===== CHECKOUT =====
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    navigateTo('checkout');
});

// Toggle dine-in / takeaway fields
document.getElementById('orderType').addEventListener('change', (e) => {
    document.getElementById('dineInField').style.display = e.target.value === 'dine-in' ? 'block' : 'none';
    document.getElementById('takeawayField').style.display = e.target.value === 'takeaway' ? 'block' : 'none';
});

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const customerName = document.getElementById('custName').value;
    const orderType = document.getElementById('orderType').value;
    const tableNumber = document.getElementById('tableNumber').value;
    const address = document.getElementById('address').value;
    const notes = document.getElementById('notes').value;

    const order = {
        id: Date.now(),
        date: new Date().toLocaleString('id-ID'),
        customer: customerName,
        type: orderType,
        table: orderType === 'dine-in' ? tableNumber : null,
        address: orderType === 'takeaway' ? address : null,
        notes,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Kosongkan keranjang
    cart = [];
    saveCart();
    updateCartBadge();

    // Tampilkan konfirmasi
    document.getElementById('confirmationDetails').innerHTML = `
        <p><strong>Pesanan #${order.id}</strong></p>
        <p>Nama: ${order.customer}</p>
        <p>Total: Rp ${order.total.toLocaleString('id-ID')}</p>
        <p>Detail: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
        ${order.table ? `<p>Meja: ${order.table}</p>` : ''}
        ${order.address ? `<p>Alamat: ${order.address}</p>` : ''}
    `;
    navigateTo('confirmation');
});

document.getElementById('backToMenuBtn').addEventListener('click', () => {
    navigateTo('menu');
});

// ===== RIWAYAT PESANAN =====
function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>Belum ada riwayat pesanan.</p>';
        return;
    }
    ordersList.innerHTML = orders.slice().reverse().map(order => `
        <div class="info-card" style="margin-bottom:1rem;">
            <h3>Pesanan #${order.id}</h3>
            <p>${order.date}</p>
            <p>Pelanggan: ${order.customer}</p>
            <p>Item: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
            <p>Total: Rp ${order.total.toLocaleString('id-ID')}</p>
            ${order.table ? `<p>Meja: ${order.table}</p>` : ''}
            ${order.address ? `<p>Alamat: ${order.address}</p>` : ''}
        </div>
    `).join('');
}

// ===== SPIN WHEEL (GIMMICK) =====
function drawWheel(rotation = 0) {
    const segments = DISCOUNT_SEGMENTS.length;
    const angleStep = (2 * Math.PI) / segments;
    const radius = 140;
    ctx.clearRect(0, 0, 300, 300);
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(rotation);

    for (let i = 0; i < segments; i++) {
        const startAngle = i * angleStep;
        const endAngle = startAngle + angleStep;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#D4AF37';
        ctx.fill();
        ctx.strokeStyle = '#4E3B31';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Teks
        ctx.save();
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = '#4E3B31';
        ctx.font = 'bold 12px Segoe UI';
        ctx.fillText(DISCOUNT_SEGMENTS[i].label, radius - 10, 5);
        ctx.restore();
    }
    ctx.restore();
}

function spinWheelAnimation() {
    spinBtn.disabled = true;
    const spinDuration = 4000;
    const startTime = performance.now();
    const initialRotation = Math.random() * 2 * Math.PI;
    const totalRotation = initialRotation + (Math.floor(Math.random() * 5) + 5) * 2 * Math.PI; // 5-9 putaran penuh

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        const currentRotation = initialRotation + totalRotation * eased;
        drawWheel(currentRotation);
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Tentukan segmen yang menang
            const normalizedAngle = (currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const segmentIndex = Math.floor(normalizedAngle / (2 * Math.PI / DISCOUNT_SEGMENTS.length)) % DISCOUNT_SEGMENTS.length;
            const winner = DISCOUNT_SEGMENTS[segmentIndex];
            const finalPrice = MYSTERY_DRINK.price * (1 - winner.discount);
            spinResult.innerHTML = `🎉 Anda mendapatkan ${winner.label}!<br>Harga: Rp ${Math.round(finalPrice).toLocaleString('id-ID')}`;
            // Tambahkan ke keranjang
            addToCart(MYSTERY_DRINK.id, Math.round(finalPrice), `Mystery Drink (${winner.label})`);
            // Tandai sudah digunakan
            spinUsed = true;
            sessionStorage.setItem('spinUsed', 'true');
            mysteryBtn.disabled = true;
            mysteryBtn.textContent = '🎁 Kejutan sudah digunakan (refresh untuk ulang)';
            spinBtn.disabled = false;
        }
    }
    requestAnimationFrame(animate);
}

mysteryBtn.addEventListener('click', () => {
    if (spinUsed) return;
    spinModal.classList.add('active');
    drawWheel(0);
    spinResult.innerHTML = '';
    spinBtn.disabled = false;
});

closeSpin.addEventListener('click', () => {
    spinModal.classList.remove('active');
});

spinBtn.addEventListener('click', spinWheelAnimation);

// Tutup modal jika klik di luar
window.addEventListener('click', (e) => {
    if (e.target === spinModal) spinModal.classList.remove('active');
});

// ===== INISIALISASI =====
updateCartBadge();
navigateTo('home'); // halaman awal

// Update checkout form dinamis saat halaman checkout dibuka
document.getElementById('orderType').dispatchEvent(new Event('change'));
