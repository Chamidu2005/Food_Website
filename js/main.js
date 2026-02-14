document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let cart = JSON.parse(localStorage.getItem('tasty-cart')) || [];

    // --- Elements ---
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const toast = document.getElementById('toast');
    const navbar = document.getElementById('navbar');

    // --- Navbar Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/95', 'shadow-md', 'backdrop-blur-md');
            navbar.classList.remove('bg-white/0');
        } else {
            navbar.classList.remove('bg-white/95', 'shadow-md', 'backdrop-blur-md');
            navbar.classList.add('bg-white/0');
        }
    });

    // --- Mobile Menu ---
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Cart Functions ---
    const updateCartUI = () => {
        cartCount.innerText = cart.reduce((acc, item) => acc + item.quantity, 0);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                    <i class="fas fa-shopping-basket text-6xl mb-4 text-gray-200"></i>
                    <p class="text-sm">Your cart is empty</p>
                </div>
            `;
            cartTotalEl.innerText = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="flex items-center gap-4 py-4 border-b border-gray-100 animate-fade-in">
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-sm">${item.name}</h4>
                    <p class="text-primary font-bold text-sm">$${item.price.toFixed(2)}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs transition" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
                        <button class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs transition" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-red-500 transition" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        cartTotalEl.innerText = `$${total.toFixed(2)}`;

        localStorage.setItem('tasty-cart', JSON.stringify(cart));
    };

    window.addToCart = (id, name, price, image) => {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }
        updateCartUI();
        showToast(name);
        // Open cart to show user
        openCart();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    window.updateQuantity = (index, change) => {
        if (cart[index].quantity + change > 0) {
            cart[index].quantity += change;
        } else {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    const openCart = () => {
        cartModal.classList.remove('hidden');
        setTimeout(() => {
            cartOverlay.classList.remove('opacity-0');
            cartOverlay.classList.add('opacity-100');
            cartPanel.classList.remove('translate-x-full');
        }, 10);
    };

    const closeCart = () => {
        cartPanel.classList.add('translate-x-full');
        cartOverlay.classList.remove('opacity-100');
        cartOverlay.classList.add('opacity-0');
        setTimeout(() => {
            cartModal.classList.add('hidden');
        }, 300);
    };

    const showToast = (itemName) => {
        const toastMsg = document.getElementById('toast-message');
        toastMsg.innerText = `${itemName} has been added to your cart.`;
        toast.classList.remove('opacity-0', 'translate-y-20');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-20');
        }, 3000);
    };

    // --- Event Listeners ---
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Initial Render
    updateCartUI();

    // Attach global listeners for dynamically added buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            // Find parent to get image
            const parent = btn.closest('.group');
            const imgEl = parent ? parent.querySelector('img') : null;
            const image = imgEl ? imgEl.src : null;

            addToCart(id, name, price, image);
        }
    });

    // Animate elements on scroll using Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        observer.observe(el);
    });
});
