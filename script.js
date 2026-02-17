const API_BASE = "https://fakestoreapi.com";
let cartCount = 0;

// --- NAVIGATION ---
function handleLogoClick() {
  document.getElementById("nav-home").classList.add("active");
  document.getElementById("nav-products").classList.remove("active");

  document.getElementById("hero-section").classList.remove("hidden");
  document.getElementById("features-section").classList.remove("hidden");
  document.getElementById("category-container").classList.add("hidden");
  document.getElementById("section-title").textContent = "Trending Now";

  loadTrending();
  window.scrollTo(0, 0);
}

function triggerNavProducts() {
  document.getElementById("nav-home").classList.remove("active");
  document.getElementById("nav-products").classList.add("active");

  document.getElementById("hero-section").classList.add("hidden");
  document.getElementById("features-section").classList.add("hidden");
  document.getElementById("category-container").classList.remove("hidden");
  document.getElementById("section-title").textContent = "Our Products";

  loadAllProducts();
  window.scrollTo(0, 0);
}

// --- DATA LOADING ---
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/products/categories`);
    const categories = await response.json();
    const container = document.getElementById("category-container");

    // Start with 'All' button
    let html = `<button onclick="loadAllProducts()" class="category-btn active px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider" data-category="All">All</button>`;

    // Add categories dynamically from API
    categories.forEach((cat) => {
      html += `
                        <button onclick="loadByCategory('${cat.replace(/'/g, "\\'")}')" class="category-btn bg-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider" data-category="${cat}">
                            ${cat}
                        </button>
                    `;
    });
    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadTrending() {
  renderLoading();
  try {
    const response = await fetch(`${API_BASE}/products?limit=4`);
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Error loading trending products:", error);
  }
}

async function loadAllProducts() {
  renderLoading();
  setActiveCategory("All");
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Error loading all products:", error);
  }
}

async function loadByCategory(category) {
  renderLoading();
  setActiveCategory(category);
  try {
    // The API expects lowercase/exact strings like "men's clothing"
    const response = await fetch(
      `${API_BASE}/products/category/${encodeURIComponent(category)}`,
    );
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Error loading category products:", error);
  }
}

function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  if (products.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500">No products found.</div>`;
    return;
  }
  grid.innerHTML = products
    .map(
      (product) => `
                <div class="product-card bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full animate-fade-in">
                    <div class="relative h-64 bg-[#f9fafb] p-8 flex items-center justify-center">
                        <img src="${product.image}" class="max-h-full max-w-full object-contain mix-blend-multiply" alt="${product.title}">
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">${product.category}</span>
                            <div class="flex items-center text-yellow-500 text-xs">
                                <i class="fa-solid fa-star mr-1"></i>
                                <span class="text-gray-600 font-medium">${product.rating.rate} (${product.rating.count})</span>
                            </div>
                        </div>
                        <h3 class="font-bold text-gray-900 text-sm line-clamp-2 mb-2 h-10">${product.title}</h3>
                        <p class="text-lg font-bold text-gray-900 mb-6">$${product.price.toFixed(2)}</p>
                        <div class="grid grid-cols-2 gap-2 mt-auto">
                            <button onclick="showProductDetail(${product.id})" class="border border-gray-200 text-gray-600 py-2 rounded text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors flex items-center justify-center"><i class="fa-regular fa-eye mr-2"></i>Details</button>
                            <button onclick="updateCart()" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-[10px] font-bold uppercase flex items-center justify-center"><i class="fa-solid fa-cart-shopping mr-2"></i>Add</button>
                        </div>
                    </div>
                </div>
            `,
    )
    .join("");
}

async function showProductDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    const product = await response.json();
    const modal = document.getElementById("product-modal");
    const content = document.getElementById("modal-content");
    content.innerHTML = `
                    <div class="md:flex">
                        <div class="md:w-1/2 p-12 bg-gray-50 flex items-center justify-center">
                            <img src="${product.image}" class="max-h-[400px] object-contain mix-blend-multiply" alt="${product.title}">
                        </div>
                        <div class="md:w-1/2 p-10 flex flex-col">
                            <div class="flex justify-between items-start mb-6">
                                <span class="text-indigo-600 font-bold uppercase text-xs tracking-widest">${product.category}</span>
                                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-2xl"></i></button>
                            </div>
                            <h2 class="text-3xl font-bold mb-4 text-gray-900 leading-tight">${product.title}</h2>
                            <div class="flex items-center mb-6 text-yellow-500">
                                <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-regular fa-star"></i>
                                <span class="ml-2 text-gray-500 text-sm">(${product.rating.count} reviews)</span>
                            </div>
                            <p class="text-gray-600 mb-8 leading-relaxed text-sm">${product.description}</p>
                            <div class="mt-auto flex justify-between items-center pt-8 border-t border-gray-100">
                                <span class="text-3xl font-bold text-gray-900">$${product.price.toFixed(2)}</span>
                                <button onclick="updateCart(); closeModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg transition-all">Add To Cart</button>
                            </div>
                        </div>
                    </div>
                `;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error showing product details:", error);
  }
}

function renderLoading() {
  document.getElementById("product-grid").innerHTML =
    `<div class="col-span-full text-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>`;
}

function setActiveCategory(category) {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    if (btn.getAttribute("data-category") === category) {
      btn.classList.add("active");
      btn.classList.remove("bg-white");
    } else {
      btn.classList.remove("active");
      btn.classList.add("bg-white");
    }
  });
}

function updateCart() {
  cartCount++;
  const badge = document.getElementById("cart-badge");
  badge.textContent = cartCount;
  badge.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("product-modal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

window.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadTrending();
  document.getElementById("year").textContent = new Date().getFullYear();
});
