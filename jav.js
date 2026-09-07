const products = [
  { id: 1, name: 'iPhone XR', model: 'XR', brand: 'APPLE', image: "./Images/product2.png", price: 3000.00 },
  { id: 2, name: 'iPhone SE', model: 'SE', brand: 'APPLE', image: "./Images/product2.png", price: 3600.00 },
  { id: 3, name: 'Apple Watch', model: 'i17', brand: 'APPLE', image: "./Images/product5.png", price: 1000.00 },
  { id: 4, name: 'Apple Laptop', model: 'IOS 17', brand: 'APPLE', image: "./Images/product4.png", price: 7300.00 },
  { id: 5, name: 'Air Phone', model: 'ios', brand: 'APPLE', image: "./Images/product6.png", price: 600.00 },
  { id: 6, name: 'PES26 Pro', model: 'Pes', brand: 'APPLE', image: "./Images/product3.png", price: 3000.00 },
];

const productContainer = document.getElementById('productContainer');
if (productContainer) {
  for (const p of products) {
    const card = document.createElement('div');
    card.classList.add("product-card");
    card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" style="width:100%; max-width:350px">
        <h3>${p.name}</h3>
        <div class="price"><h1>GH&cent; ${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1></div>

              <button class="addToCart" data-product-id="${p.id}" onclick="toggleCart(${p.id}, this)">Add to Cart</button>
    `;
    productContainer.append(card);
  }
}

const cart = [];

// SELECT ELEMENTS
const cartIcon = document.getElementById('cart-icon');
const cartItemContainer = document.querySelector('.cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const closeCart = document.getElementById('closeCart');
const cartSidebar = document.getElementById('cartSidebar');

// ADD TO CART
function toggleCart(id, button) {
  const productIndex = cart.findIndex(p => p.id === id);

  if (productIndex === -1) {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, quantity: 1 });
    button.textContent = "Remove from Cart";
  } else {
    cart.splice(productIndex, 1);
    button.textContent = "Add to Cart";
  }

  updateCartTotal();
  updateCartCount();
  displayCartItems();
  updateProductButtons();
  toggleCheckoutButton();
}

// CART COUNT
function updateCartCount() {
  cartCount.textContent = cart.length;
}

// CART TOTAL
function updateCartTotal() {
  let total = 0;              
  for (const p of cart) {
    total += Number(p.price) * p.quantity;
  }
  cartTotal.textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// DISPLAY CART ITEMS
function displayCartItems() {
  let html = "";
  if (!cartItemContainer) return;

  if (cart.length === 0) {
    cartItemContainer.innerHTML = `
        <tr>
            <td colspan="5" class="empty-cart">Your cart is empty.</td>
        </tr>
    `;
    return;
  }

  cart.forEach((p, index) => {
    html += `
        <tr>
            <td>${index + 1}</td>
            <td>${p.name}</td>
            <td>GH&cent ${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>
                <div class="qty-control">
                    <button class="decreaseButton" onclick="decreaseQty(${index})">-</button>
                    ${p.quantity}
                    <button class="increaseButton" onclick="increaseQty(${index})">+</button>
                </div>
            </td>
            <td>
                <button class="removeButton" onclick="removeItem(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
        `;
  });
  cartItemContainer.innerHTML = html;
}

function updateProductButtons() {
  const buttons = document.querySelectorAll('.addToCart[data-product-id]');
  buttons.forEach(button => {
    const id = Number(button.dataset.productId);
    button.textContent = cart.some(item => item.id === id) ? "Remove from Cart" : "Add to Cart";
  });
}

// OPEN/CLOSE CART SIDEBAR
if (cartIcon && cartSidebar) {
  cartIcon.addEventListener("click", function () {
    cartSidebar.classList.add("show");
  });
}
if (closeCart && cartSidebar) {
  closeCart.addEventListener("click", function () {
    cartSidebar.classList.remove("show");
  });
}

// QUANTITY CONTROL
function increaseQty(index) {
  cart[index].quantity++;
  displayCartItems();
  updateCartTotal();
  updateCartCount();
  updateProductButtons();
  toggleCheckoutButton();
}
function decreaseQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  displayCartItems();
  updateCartTotal();
  updateCartCount();
  updateProductButtons();
  toggleCheckoutButton();
}
function removeItem(index) {
  cart.splice(index, 1);
  displayCartItems();
  updateCartTotal();
  updateCartCount();
  updateProductButtons();
  toggleCheckoutButton();
}

const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');

const nameElement = document.getElementById('name');
const emailElement = document.getElementById('email');
const phoneElement = document.getElementById('phone');

if (nameElement) nameElement.addEventListener('input', toggleCheckoutButton);
if (emailElement) emailElement.addEventListener('input', toggleCheckoutButton);
if (phoneElement) phoneElement.addEventListener('input', toggleCheckoutButton);

if (nameElement) nameElement.addEventListener('blur', validateName);
if (emailElement) emailElement.addEventListener('blur', validateEmail);
if (phoneElement) phoneElement.addEventListener('blur', validatePhone);

const userForm = document.getElementById('userForm');
if (userForm) {
  userForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateName() || !validateEmail() || !validatePhone()) {
      alert("Please fix errors before proceeding.");
    } else {
      payWithPaystack();
    }
  });
}

function toggleCheckoutButton() {
  const checkoutButton = document.getElementById('checkoutBtn');
  if (!checkoutButton) return;

  const isFormValid = validateName() && validateEmail() && validatePhone();
  checkoutButton.disabled = !isFormValid || cart.length === 0;
}

// Initialize state
toggleCheckoutButton();


function payWithPaystack() {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();

  if (!(isNameValid && isEmailValid && isPhoneValid)) {
    alert("Please fix validation errors before checkout.");
    return;
  }

  const totalAmountText = cartTotal.textContent.replace(/,/g, "");
  const amountInPesewas = parseFloat(totalAmountText) * 100;

  const handler = PaystackPop.setup({
    key: 'pk_test_3bab745d743e7f4ed8a3ecef47d4915198cf1e4e',
    email: emailElement ? emailElement.value : '',
    amount: amountInPesewas,
    currency: 'GHS',
    callback: function (response) {
      showSummary(response.reference);
      cart.length = 0;
      displayCartItems();
      updateCartTotal();
      updateCartCount();
      setTimeout(clearUserForm, 500);
    },
    onClose: function () {
      alert('Payment window closed.');
    }
  });
  handler.openIframe();
}


function clearUserForm() {
  const nameField = document.getElementById("name");
  const phoneField = document.getElementById("phone");
  const emailField = document.getElementById("email");
  const addressField = document.getElementById("address");

  if (nameField) nameField.value = "";
  if (phoneField) phoneField.value = "";
  if (emailField) emailField.value = "";
  if (addressField) addressField.value = "";

  toggleCheckoutButton();
}
 function printReceipt() {
  const summaryContent = document.getElementById("purchaseSummary").innerHTML;
  const printWindow = window.open('', '', 'width=800,height=600');  
  printWindow.document.write(summaryContent);
  printWindow.document.close();
  printWindow.print();
 }


// SUMMARY RECEIPT
function showSummary(reference) {
  const customerName = nameElement ? nameElement.value : '';
  const customerPhone = phoneElement ? phoneElement.value : '';
  const customerEmail = emailElement ? emailElement.value : '';   
  const totalAmount = parseFloat(cartTotal.textContent.replace(/,/g, ""));

  let summary = `<h2>iK TeCH Solutions Group</h2>`;
  summary+=`<p>Thank you for your purchase, ${customerName}!</p>`;
  summary += `<p><strong>Phone:</strong> ${customerPhone}</p>`;
  summary += `<p><strong>Email:</strong> ${customerEmail}</p>`;
  summary += `<p><strong>Payment Ref:</strong> ${reference}</p>`;
  summary += `<ul>`;

  cart.forEach(item => {
    summary += `<li>${item.name} (x${item.quantity}) - GH₵${(item.price * item.quantity).toFixed(2)}</li>`;
  });

  summary += `</ul>`;
  summary += `<h3>Total: GH₵ ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>`;

  const purchaseSummary = document.getElementById("purchaseSummary");
  const summaryModal = document.getElementById("summaryModal");

  if (purchaseSummary) purchaseSummary.innerHTML = summary;
  if (summaryModal) summaryModal.style.display = "block";
}
clearUserForm();
// CLOSE SUMMARY
function closeSummary() {
  const summaryModal = document.getElementById("summaryModal");
  if (summaryModal) summaryModal.style.display = "none";
  cart.length = 0;
  displayCartItems();
  updateCartTotal();
  updateCartCount();
  toggleCheckoutButton();
}

function validateName() {
  if (!nameElement || !nameError) return false;

  const nameValue = nameElement.value.trim();
  if (nameValue === '') {
    nameError.textContent = "Please enter your name";
    nameElement.classList.add('invalid');
    nameElement.classList.remove('valid');
    return false;
  } else {
    nameError.textContent = "";
    nameElement.classList.add('valid');
    nameElement.classList.remove('invalid');
    return true;
  }
}

function validateEmail() {
  if (!emailElement || !emailError) return false;

  const emailValue = emailElement.value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailValue === '') {
    emailError.textContent = "Please enter your email";
    emailElement.classList.add('invalid');
    emailElement.classList.remove('valid');
    return false;
  } else if (!emailRegex.test(emailValue)) {
    emailError.textContent = "Please enter a valid email address.";
    emailElement.classList.add('invalid');
    emailElement.classList.remove('valid');
    return false;
  } else {
    emailError.textContent = "";
    emailElement.classList.add('valid');
    emailElement.classList.remove('invalid');
    return true;
  }
}

function validatePhone() {
  if (!phoneElement || !phoneError) return false;

  const phoneValue = phoneElement.value.trim();
  const phoneRegex = /^\d{10}$/;

  if (phoneValue === '') {
    phoneError.textContent = "Phone number is required";
    phoneElement.classList.add('invalid');
    phoneElement.classList.remove('valid');
    return false;
  } else if (!phoneRegex.test(phoneValue)) {
    phoneError.textContent = "Please enter a valid 10-digit phone number.";
    phoneElement.classList.add('invalid');
    phoneElement.classList.remove('valid');
    return false;
  } else {
    phoneError.textContent = "";
    phoneElement.classList.add('valid');
    phoneElement.classList.remove('invalid');
    return true;
  }
}


