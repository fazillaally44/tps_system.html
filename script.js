const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzL8ojTb-jzpUWB-kzU1MwdePkGCJNnXz_9YC1w7eoSE2QGgyThKzdDMiVNHRI9INh7BA/exec";

function updatePrice() {
  const select = document.getElementById("itemSelect");
  const price = select.options[select.selectedIndex]?.dataset.price || "";
  document.getElementById("unitPrice").value = price;
  updateTotal();
}

function updateTotal() {
  const price = parseFloat(document.getElementById("unitPrice").value || 0);
  const qty = parseInt(document.getElementById("quantity").value || 1);
  document.getElementById("total").value = (price * qty).toFixed(2);
}

function submitTransaction() {
  const itemSelect = document.getElementById("itemSelect");
  const itemCode = itemSelect.value;
  const itemName = itemSelect.options[itemSelect.selectedIndex]?.text || "";
  const unitPrice = document.getElementById("unitPrice").value;
  const qty = document.getElementById("quantity").value;
  const total = document.getElementById("total").value;
  const statusDiv = document.getElementById("status");

  if (!itemCode || !unitPrice || !qty || !total) {
    statusDiv.textContent = "Please select an item and quantity.";
    statusDiv.style.color = "red";
    return;
  }

  const payload = {
    itemCode,
    itemName,
    unitPrice,
    qty,
    total
  };

  statusDiv.textContent = "Submitting...";
  statusDiv.style.color = "black";

  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  })
  .then(() => {
    statusDiv.textContent = "Transaction submitted!";
    statusDiv.style.color = "green";
    // Reset quantity and totals
    document.getElementById("quantity").value = 1;
    updateTotal();
  })
  .catch(err => {
    console.error(err);
    statusDiv.textContent = "Error submitting transaction.";
    statusDiv.style.color = "red";
  });
}
