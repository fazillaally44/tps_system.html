const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzL8ojTb-jzpUWB-kzU1MwdePkGCJNnXz_9YC1w7eoSE2QGgyThKzdDMiVNHRI9INh7BA/exec";

// Cart structure: { itemName: { price, qty } }
const cart = {};

// Temporary quantities on cards (before adding to cart)
const tempQty = {};

/* ===========================
   PAGE BACKGROUND ON HOVER
   =========================== */
function setPageBackground(imageUrl) {
  const overlay = document.getElementById("bg-overlay");

  // Fade out first
  overlay.style.opacity = "0";

  // Wait for fade out to finish, then swap image and fade in
  setTimeout(function () {
    overlay.style.backgroundImage = "url('" + imageUrl + "')";
    overlay.style.opacity = "0.15";
  }, 350); // matches the fade out duration
}

function clearPageBackground() {
  const overlay = document.getElementById("bg-overlay");
  overlay.style.opacity = "0";
}

/* ===========================
   UPDATE CARD DISPLAY
   =========================== */
function updateCardQtyDisplay(item) {
  const span = document.getElementById("qty-" + item);
  if (!span) return;
  span.textContent = tempQty[item] || 0;
}

/* ===========================
   CARD +/- BUTTONS
   (Only updates temp display, NOT cart)
   =========================== */
function changeQty(item, price, delta) {
  document.getElementById("status").textContent = "";

  if (!tempQty[item]) {
    tempQty[item] = 0;
  }

  tempQty[item] = tempQty[item] + delta;

  if (tempQty[item] < 0) {
    tempQty[item] = 0;
  }

  updateCardQtyDisplay(item);
}

/* ===========================
   ADD TO CART BUTTON
   (Moves temp qty into cart, then resets card to 0)
   =========================== */
function addToCart(item, price) {
  document.getElementById("status").textContent = "";

  const qty = tempQty[item] || 0;

  if (qty === 0) {
    alert("Please select a quantity first.");
    return;
  }

  if (!cart[item]) {
    cart[item] = { price: price, qty: 0 };
  }
  cart[item].qty = cart[item].qty + qty;

  tempQty[item] = 0;
  updateCardQtyDisplay(item);

  renderCart();
}

/* ===========================
   CHECKOUT +/- BUTTONS
   (Directly adjusts cart)
   =========================== */
function adjustCartQty(item, price, delta) {
  document.getElementById("status").textContent = "";

  if (!cart[item]) return;

  cart[item].qty = cart[item].qty + delta;

  if (cart[item].qty <= 0) {
    delete cart[item];
  }

  renderCart();
}

/* ===========================
   RENDER CHECKOUT TABLE
   =========================== */
function renderCart() {
  const tbody = document.getElementById("cart-body");
  tbody.innerHTML = "";
  let grandTotal = 0;

  // Map item names to their image URLs
  const itemImages = {
    Coffee:
      "https://colombiancoffee.us/cdn/shop/articles/tips-to-recognize-good-quality-coffee-424970.png",
    Tea: "https://www.kimbertonwholefoods.com/wp-content/uploads/2020/02/tea-2.jpg",
    Pancakes:
      "https://hips.hearstapps.com/hmg-prod/images/best-homemade-pancakes-index-640775a2dbad8.jpg",
    Muffin:
      "https://www.simplyrecipes.com/thmb/JeV8ucxWAKIsxEYe1GtsgSGLRO0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Aunt-Cindy-Blueberry-Muffins-LEAD-1-e2684805dd6e4c98b11df87d659c7ea7.jpg",
    Sandwich:
      "https://www.allrecipes.com/thmb/H_gwkwI6-5YPvZhXxYyf2TS5vbs=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/AR-238891-Grilled-Cheese-Sandwich-beauty-4x3-362f705972e64a948b7ec547f7b2a831.jpg",
    Eggs: "https://southernbite.com/wp-content/uploads/2021/05/Perfect-Scrambled-Eggs-2.jpg",
  };

  Object.keys(cart).forEach(function (item) {
    const price = cart[item].price;
    const qty = cart[item].qty;
    const lineTotal = price * qty;
    grandTotal += lineTotal;

    const imgUrl = itemImages[item] || "";

    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td><img src='" +
      imgUrl +
      "' style='width:35px; height:35px; object-fit:cover; border-radius:6px; vertical-align:middle; margin-right:6px;'/>" +
      item +
      "</td>" +
      "<td>" +
      price +
      "</td>" +
      "<td>" +
      qty +
      "</td>" +
      "<td>" +
      lineTotal.toFixed(2) +
      "</td>" +
      "<td>" +
      '<button class="cart-adjust-btn" onclick="adjustCartQty(\'' +
      item +
      "', " +
      price +
      ', -1)">−</button> ' +
      '<button class="cart-adjust-btn" onclick="adjustCartQty(\'' +
      item +
      "', " +
      price +
      ', 1)">+</button>' +
      "</td>";
    tbody.appendChild(tr);
  });

  document.getElementById("grand-total").textContent = grandTotal.toFixed(2);
}

/* ===========================
   SUBMIT ORDER
   =========================== */
function submitOrder() {
  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const orderItems = Object.keys(cart).map(function (itemName) {
    return {
      itemName: itemName,
      price: cart[itemName].price,
      quantity: cart[itemName].qty,
      total: cart[itemName].price * cart[itemName].qty,
    };
  });

  const payload = {
    items: orderItems,
    grandTotal: parseFloat(document.getElementById("grand-total").textContent),
  };

  document.getElementById("status").textContent = "Submitting order...";

  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
  })
    .then(function () {
      document.getElementById("status").textContent =
        "Order submitted successfully!";

      for (var key in cart) {
        if (cart.hasOwnProperty(key)) delete cart[key];
      }
      renderCart();

      document.querySelectorAll("[id^='qty-']").forEach(function (span) {
        span.textContent = "0";
      });
    })
    .catch(function () {
      document.getElementById("status").textContent = "Error submitting order.";
    });
}

