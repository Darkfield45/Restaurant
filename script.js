// ================================================================
// PANIER ET GESTION DES COMMANDES
// ================================================================

// Etat courant du panier et montant total calcule
const cart = [];
let cartTotal = 0;

// References vers les elements HTML utilises par le panier
const cartToggle = document.querySelector('.cart-toggle');
const cartItems = document.getElementById('cartItems');
const cartTotalElem = document.getElementById('cartTotal');
const checkoutForm = document.getElementById('checkoutForm');
const cartCount = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Brancher un evenement sur chaque bouton d'ajout du menu
addToCartButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        addToCart(name, price);
    });
});

function addToCart(name, price) {
    // Regrouper les articles identiques au lieu de creer plusieurs lignes
    const existing = cart.find(item => item.name === name);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    
    updateCart();
}

function updateCart() {
    // Recalculer le total puis reconstruire l'affichage du panier
    cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
    
    // Afficher/masquer le panier vide
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Le panier est vide</p>';
        checkoutForm.style.display = 'none';
        cartCount.style.display = 'none';
    } else {
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const itemElem = document.createElement('div');
            itemElem.className = 'cart-item';
            itemElem.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <div class="cart-item-qty">
                    <button onclick="decreaseQty(${index})">−</button>
                    <span>${item.qty}</span>
                    <button onclick="increaseQty(${index})">+</button>
                </div>
                <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">✕</button>
            `;
            cartItems.appendChild(itemElem);
        });
        checkoutForm.style.display = 'flex';
        cartCount.textContent = cart.length;
        cartCount.style.display = 'flex';
    }
    
    cartTotalElem.textContent = formatPrice(cartTotal);
}

// Afficher les montants en francs CFA sans decimales inutiles
function formatPrice(amount) {
    return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}

function increaseQty(index) {
    // Augmenter la quantite de la ligne selectionnee
    cart[index].qty += 1;
    updateCart();
}

function decreaseQty(index) {
    // Retirer la ligne lorsque sa quantite atteint zero
    if (cart[index].qty > 1) {
        cart[index].qty -= 1;
    } else {
        removeFromCart(index);
    }
    updateCart();
}

function removeFromCart(index) {
    // Supprimer completement un article du tableau du panier
    cart.splice(index, 1);
    updateCart();
}

// Preparer et envoyer la commande au restaurant via WhatsApp
checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = this.querySelector('input[name="name"]').value || this.children[0].querySelector('input').value;
    const phone = this.querySelector('input[name="phone"]').value || this.children[1].querySelector('input').value;
    const address = this.querySelector('input[name="address"]').value || this.children[2].querySelector('input').value;
    const notes = this.querySelector('textarea[name="notes"]').value || this.children[3].querySelector('textarea').value;
    
    // Construire le message formate pour WhatsApp
    let message = `*Nouvelle Commande - Le Jardin Étoilé*%0A%0A`;
    message += `*Client:* ${name}%0A`;
    message += `*Téléphone:* ${phone}%0A`;
    message += `*Adresse:* ${address}%0A%0A`;
    message += `*Commande:%0A`;
    
    cart.forEach(item => {
        message += `${item.qty}x ${item.name} - ${formatPrice(item.price * item.qty)}%0A`;
    });
    
    message += `%0A*Total:* ${formatPrice(cartTotal)}%0A%0A`;
    
    if (notes) {
        message += `*Notes:* ${notes}%0A%0A`;
    }
    
    message += `Merci!`;
    
    // Numéro de WhatsApp du restaurant (à modifier)
    const whatsappNumber = '+22812345678'; // A remplacer par le vrai numero togolais
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappLink, '_blank');
    
    // Vider le panier et reinitialiser le formulaire apres l'envoi
    setTimeout(() => {
        cart.length = 0;
        updateCart();
        alert('Commande envoyée! Merci de votre achat.');
        this.reset();
    }, 500);
});

// Ouvrir ou fermer le panier sur les petits ecrans
cartToggle.addEventListener('click', function() {
    const sidebar = document.querySelector('.cart-sidebar');
    sidebar.classList.toggle('active');

    // Amener le panier a l'ecran lorsqu'il est ouvert
    if (sidebar.classList.contains('active')) {
        sidebar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Ajouter les styles specifiques au menu commande et au panier
const style = document.createElement('style');
style.textContent = `
    .order-container {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 2rem;
        padding: 2rem 0;
    }

    .menu-items {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .menu-category {
        background: rgba(255, 255, 255, 0.5);
        border-radius: 24px;
        border: 1px solid rgba(31, 26, 23, 0.09);
        padding: 1.8rem;
    }

    .menu-category h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        color: #1f1a17;
    }

    .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
    }

    .menu-item {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(31, 26, 23, 0.09);
        border-radius: 16px;
        padding: 1rem;
        transition: all 0.2s ease;
    }

    .menu-item:hover {
        box-shadow: 0 8px 20px rgba(31, 26, 23, 0.12);
        transform: translateY(-2px);
    }

    .item-header {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
    }

    .item-header strong {
        display: block;
        margin-bottom: 0.2rem;
    }

    .item-header small {
        color: #5f4d43;
        font-size: 0.85rem;
    }

    .price {
        color: #a45b2d;
        white-space: nowrap;
    }

    .add-to-cart {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        width: 100%;
        padding: 0.6rem;
        border: none;
        border-radius: 999px;
        background: #a45b2d;
        color: white;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    }

    .add-to-cart:hover {
        background: #7d4220;
        transform: scale(1.02);
    }

    .cart-sidebar {
        position: sticky;
        top: 120px;
        height: fit-content;
        background: rgba(255, 253, 251, 0.9);
        border: 1px solid rgba(31, 26, 23, 0.09);
        border-radius: 24px;
        padding: 1.5rem;
        box-shadow: 0 14px 30px rgba(31, 26, 23, 0.08);
    }

    /* Masquer le panier jusqu'au clic sur le sac sur les petits ecrans */
    @media (max-width: 1200px) {
        .cart-sidebar {
            display: none;
        }

        .cart-sidebar.active {
            display: block;
        }
    }

    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid rgba(31, 26, 23, 0.09);
    }

    .cart-header h3 {
        font-size: 1.2rem;
    }

    .cart-items {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 1rem;
    }

    .empty-cart {
        text-align: center;
        color: #5f4d43;
        padding: 2rem 0;
    }

    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.8rem 0;
        border-bottom: 1px solid rgba(31, 26, 23, 0.04);
        font-size: 0.95rem;
    }

    .cart-item-name {
        flex: 1;
        font-weight: 600;
    }

    .cart-item-qty {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin: 0 0.8rem;
    }

    .cart-item-qty button {
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 4px;
        background: #a45b2d;
        color: white;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 800;
    }

    .cart-item-price {
        font-weight: 800;
        min-width: 45px;
        text-align: right;
    }

    .cart-item-remove {
        background: none;
        border: none;
        color: #d9534f;
        cursor: pointer;
        font-weight: 800;
        margin-left: 0.4rem;
        font-size: 1.1rem;
    }

    .cart-footer {
        padding-top: 1rem;
        border-top: 2px solid rgba(31, 26, 23, 0.09);
    }

    .cart-total {
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        font-weight: 800;
        margin-bottom: 1rem;
    }

    .checkout-form {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .form-group input,
    .form-group textarea {
        padding: 0.7rem;
        border: 1px solid rgba(31, 26, 23, 0.09);
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.9rem;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #a45b2d;
        box-shadow: 0 0 0 3px rgba(164, 91, 45, 0.1);
    }

    .cart-count {
        position: relative;
        width: 20px;
        height: 20px;
        background: #d9534f;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 800;
    }

    @media (max-width: 1200px) {
        .order-container {
            grid-template-columns: 1fr;
        }

        .cart-sidebar {
            position: static;
            top: auto;
        }
    }

    @media (max-width: 768px) {
        .items-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 560px) {
        .items-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

// ================================================================
// GESTION DES RESERVATIONS
// ================================================================
const reservationForm = document.getElementById('reservationForm');

if (reservationForm) {
    // Le formulaire n'existe que dans la version reservation du site
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = this.querySelector('input[name="date"]').value;
        const time = this.querySelector('input[name="time"]').value;
        const guests = this.querySelector('input[name="guests"]').value;
        const name = this.querySelector('input[name="name"]').value;
        const phone = this.querySelector('input[name="phone"]').value;
        const location = this.querySelector('input[name="location"]:checked').value;
        const window = this.querySelector('input[name="window"]:checked').value;
        const notes = this.querySelector('textarea[name="notes"]').value;
        
        // Construire le message de reservation pour WhatsApp
        let message = `*Nouvelle Réservation - Le Jardin Étoilé*%0A%0A`;
        message += `*Client:* ${name}%0A`;
        message += `*Téléphone:* ${phone}%0A`;
        message += `*Date:* ${date}%0A`;
        message += `*Heure:* ${time}%0A`;
        message += `*Nombre de personnes:* ${guests}%0A`;
        message += `*Emplacement:* ${location}%0A`;
        message += `*Vue:* ${window}%0A`;
        
        if (notes) {
            message += `*Notes:* ${notes}%0A`;
        }
        
        message += `%0AMerci!`;
        
        // Numéro de WhatsApp du restaurant
        const whatsappNumber = '+22812345678'; // A remplacer par le vrai numero togolais
        const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        
        // Ouvrir la conversation WhatsApp dans un nouvel onglet
        window.open(whatsappLink, '_blank');
        
        // Effacer les champs apres l'envoi
        setTimeout(() => {
            this.reset();
            alert('Réservation envoyée! Merci de votre confiance.');
        }, 500);
    });
}
