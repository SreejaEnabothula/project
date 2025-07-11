document.addEventListener("DOMContentLoaded", function () {
  const buyButtons = document.querySelectorAll(".buy-btn");
  const cart = document.getElementById("cart");

  if (!cart) {
    console.error("No cart element found!");
    return;
  }

  buyButtons.forEach(button => {
    button.addEventListener("click", function () {
      const product = button.closest(".product");
      const image = product.querySelector("img").src;
      const name = product.querySelector(".p-name").textContent;
      const price = product.querySelector(".p-price").textContent;

      const cartItem = document.createElement("div");
      cartItem.className = "col-md-4 mb-3";

      cartItem.innerHTML = `
        <div class="card p-2">
          <img src="${image}" class="card-img-top" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${name}</h5>
            <p class="card-text">${price}</p>
          </div>
        </div>
      `;

      cart.appendChild(cartItem);
    });
  });
});
