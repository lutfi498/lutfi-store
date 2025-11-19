document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMEN DOM ---
    const loginLink = document.getElementById('login-link');
    const cartLink = document.getElementById('cart-link');
    const loginModal = document.getElementById('login-modal');
    const cartModal = document.getElementById('cart-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const productGrid = document.getElementById('product-grid');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // ELEMEN ADMIN
    const adminPanel = document.getElementById('admin-panel');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const addProductForm = document.getElementById('add-product-form');
    
    // --- FITUR BARU: ELEMEN UNTUK UPLOAD GAMBAR ---
    const productImageFileInput = document.getElementById('product-image-file');
    const imagePreview = document.getElementById('image-preview');

    // --- STATE APLIKASI ---
    let currentUser = null;
    let cart = [];
    let products = [];

    // --- FITUR BARU: NOMOR WHATSAPP ADMIN ---
    const ADMIN_WHATSAPP = '6288985628174';

    // --- INISIALISASI ---
    function initializeApp() {
        loadProductsFromStorage();
        renderProducts();
    }

    // --- MANAJEMEN PRODUK (DENGAN LOCAL STORAGE) ---
    function loadProductsFromStorage() {
        const storedProducts = localStorage.getItem('lutfiStoreProducts');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        } else {
            products = [
                { id: 1, name: 'Kaos Polos Hitam', price: 75000, imageUrl: 'https://via.placeholder.com/250x250.png?text=Kaos+Hitam' },
                { id: 2, name: 'Celana Jeans Biru', price: 150000, imageUrl: 'https://via.placeholder.com/250x250.png?text=Celana+Jeans' },
                { id: 3, name: 'Sepatu Sneakers', price: 300000, imageUrl: 'https://via.placeholder.com/250x250.png?text=Sepatu' },
            ];
            saveProductsToStorage();
        }
    }

    function saveProductsToStorage() {
        localStorage.setItem('lutfiStoreProducts', JSON.stringify(products));
    }

    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const isAdmin = currentUser && currentUser.role === 'admin';
            const deleteButtonHtml = isAdmin 
                ? `<button class="delete-product-btn" data-id="${product.id}">Hapus</button>` 
                : '';

            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <div class="product-card-actions">
                    <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Tambah ke Keranjang</button>
                    ${deleteButtonHtml}
                </div>
            `;
            productGrid.appendChild(productCard);
        });
        
        attachAddToCartListeners();
        attachDeleteListeners();
    }
    
    function attachDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.delete-product-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                    products = products.filter(p => p.id != productId);
                    saveProductsToStorage();
                    renderProducts();
                    alert('Produk berhasil dihapus!');
                }
            });
        });
    }

    // --- FITUR LOGIN ---
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            logout();
        } else {
            loginModal.style.display = 'block';
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'lutfi' && password === 'lutfistore') {
            loginSuccess('lutfi', 'user');
        } else if (username === 'admin' && password === 'admin') {
            loginSuccess('admin', 'admin');
        } else {
            loginError.textContent = 'Username atau password salah!';
        }
    });

    function loginSuccess(username, role) {
        currentUser = { username, role };
        loginLink.textContent = `Logout, ${username}`;
        loginModal.style.display = 'none';
        loginForm.reset();
        loginError.textContent = '';
        if (role === 'admin') {
            adminPanel.style.display = 'block';
        }
        alert(`Login berhasil! Selamat datang, ${username}.`);
        renderProducts();
    }

    function logout() {
        currentUser = null;
        loginLink.textContent = 'Login';
        adminPanel.style.display = 'none';
        renderProducts();
        alert('Anda telah logout.');
    }

    // --- FITUR ADMIN TAMBAH PRODUK (DENGAN UPLOAD GAMBAR) ---
    toggleFormBtn.addEventListener('click', () => {
        addProductForm.style.display = (addProductForm.style.display === 'none' || addProductForm.style.display === '') ? 'grid' : 'none';
    });

    // --- FITUR BARU: EVENT LISTENER UNTUK PREVIEW GAMBAR ---
    productImageFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file); // Membaca file sebagai URL Data
        }
    });

    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = parseInt(document.getElementById('product-price').value);
        
        // --- FITUR BARU: AMBIL GAMBAR DARI PREVIEW ---
        const imageUrl = imagePreview.src;

        // Validasi sederhana untuk memastikan gambar sudah dipilih
        if (imageUrl === '' || imageUrl === null) {
            alert('Harap pilih gambar produk terlebih dahulu!');
            return;
        }

        const newProduct = { id: Date.now(), name, price, imageUrl };
        products.push(newProduct);
        saveProductsToStorage();
        renderProducts();
        
        // Reset form dan preview
        addProductForm.reset();
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        addProductForm.style.display = 'none';
        
        alert('Produk berhasil ditambahkan!');
    });

    // --- FITUR KERANJANG BELANJA ---
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
        renderCart();
    });

    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const price = parseInt(button.getAttribute('data-price'));
                
                const existingItem = cart.find(item => item.id === id);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({ id, name, price, quantity: 1 });
                }
                
                updateCartUI();
                alert(`${name} ditambahkan ke keranjang!`);
            });
        });
    }
    
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang Anda kosong!');
            return;
        }

        let message = "Halo Admin Lutfi Store, saya ingin memesan produk berikut:\n\n";
        let total = 0;

        cart.forEach(item => {
            message += `- ${item.name} (x${item.quantity})\n`;
            total += item.price * item.quantity;
        });

        message += `\nTotal Harga: Rp ${total.toLocaleString('id-ID')}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');

        cart = [];
        updateCartUI();
        cartModal.style.display = 'none';
        alert('Terima kasih! Silakan lanjutkan pemesanan melalui WhatsApp.');
    });

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<li>Keranjang kosong.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name} (x${item.quantity}) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`;
                cartItemsContainer.appendChild(li);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toLocaleString('id-ID');
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    }

    // --- MODAL CONTROLS ---
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            cartModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Jalankan aplikasi
    initializeApp();
});