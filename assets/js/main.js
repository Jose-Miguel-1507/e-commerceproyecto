// main.js
document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('nav').classList.toggle('active');
    });

    // Carrucel

document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    
    const slideWidth = slides[0].getBoundingClientRect().width + 20; // +20 por el gap
    
    let currentIndex = 0;
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
    
    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    });
    
    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
    });
    
    // Opcional: Autoplay
    let autoplay = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    }, 5000);
    
    // Pausar autoplay al interactuar
    track.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.addEventListener('mouseleave', () => {
        autoplay = setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }, 5000);
    });
});


class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.initElements();
        this.initEvents();
        this.renderCart();
    }
    
    initElements() {
        this.elements = {
            cartOverlay: document.getElementById('cartOverlay'),
            cartTrigger: document.querySelector('.cart-trigger'),
            cartClose: document.querySelector('.cart-close'),
            continueShopping: document.querySelector('.continue-shopping'),
            cartItemsContainer: document.querySelector('.cart-items-container'),
            cartBadge: document.querySelector('.cart-badge'),
            subtotalAmount: document.querySelector('.subtotal-amount'),
            checkoutBtn: document.querySelector('.checkout-btn'),
            emptyCartMessage: document.querySelector('.empty-cart-message')
        };
    }
    
    initEvents() {
        // Abrir/cerrar carrito
        this.elements.cartTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCart(true);
        });
        
        this.elements.cartClose.addEventListener('click', () => this.toggleCart(false));
        this.elements.continueShopping.addEventListener('click', () => this.toggleCart(false));
        
        // Cerrar al hacer click fuera del carrito
        this.elements.cartOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.cartOverlay) {
                this.toggleCart(false);
            }
        });
        
        // Delegación de eventos para los items del carrito
        this.elements.cartItemsContainer.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.cart-item');
            if (!itemElement) return;
            
            const index = itemElement.dataset.index;
            
            if (e.target.closest('.decrease-quantity')) {
                this.updateQuantity(index, -1);
            } else if (e.target.closest('.increase-quantity')) {
                this.updateQuantity(index, 1);
            } else if (e.target.closest('.remove-item')) {
                this.removeItem(index);
            }
        });
    }
    
    toggleCart(show) {
        if (show) {
            document.body.style.overflow = 'hidden';
            this.elements.cartOverlay.classList.add('active');
        } else {
            document.body.style.overflow = '';
            this.elements.cartOverlay.classList.remove('active');
        }
    }
    
    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({...product, quantity: 1});
        }
        
        this.saveCart();
        this.renderCart();
        this.showAddedFeedback(product.name);
    }
    
    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity < 1) {
            this.cart.splice(index, 1);
        }
        
        this.saveCart();
        this.renderCart();
    }
    
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.renderCart();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    renderCart() {
        // Actualizar badge
        const itemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        this.elements.cartBadge.textContent = itemCount;
        
        // Mostrar/ocultar mensaje de carrito vacío
        if (this.cart.length === 0) {
            document.querySelector('.cart-drawer').classList.add('cart-empty');
            this.elements.checkoutBtn.disabled = true;
            return;
        }
        
        document.querySelector('.cart-drawer').classList.remove('cart-empty');
        this.elements.checkoutBtn.disabled = false;
        
        // Renderizar items
        this.elements.cartItemsContainer.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-price">$${item.price.toLocaleString()}</span>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn decrease-quantity">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity">+</button>
                        </div>
                        <button class="remove-item">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Actualizar subtotal
        this.elements.subtotalAmount.textContent = `$${this.calculateSubtotal().toLocaleString()}`;
    }
    
    showAddedFeedback(productName) {
        const feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName} añadido al carrito</span>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
                setTimeout(() => feedback.remove(), 300);
            }, 2000);
        }, 10);
    }
}

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const cart = new ShoppingCart();
    
    // Evento para añadir productos (debes adaptarlo a tus productos)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productElement = e.target.closest('.product');
            if (productElement) {
                const product = {
                    id: productElement.dataset.id,
                    name: productElement.querySelector('.product-name').textContent,
                    price: parseFloat(productElement.querySelector('.product-price').textContent.replace('$', '')),
                    image: productElement.querySelector('.product-image').src
                };
                cart.addItem(product);
            }
        }
    });
});


// BY Jose landero //

// Aquí puedes agregar funcionalidades futuras 


