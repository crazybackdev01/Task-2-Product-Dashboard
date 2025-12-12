/*
Products ke liye 2 variable likhne ka logic yeh hai ki apan ko baar baar API se data fetch naa karne padhe error handling ke time aur jab user clearSearch ya clearCategories wale button dabaaye toh fastly Inital Original number of products bina kisi filter ke render hojaaye. 
Agar asa nahi karte toh har baar jab bhi user clearCategories ya clearSearch dabaataa toh apan ko doobara API se data fetch karke currentProducts variable daalna padhta aur phir products UI doobara render hota jo ki bohot expensive hojata aur bad user experience hota. 
allProducts aur displayedProducts rakhne ka yeh bhi fayda he ki jab user koi product search karega ya category filter karega toh sortByLowToHigh etc. wale saare functions sirf unhi rendered or searched or filtered products par apply hoga
*/
let allProducts = [];
let displayedProducts = [];
let categories = [];
// let selectedCategory = null;

const productGrid = document.getElementById("productGrid");
const messageDiv = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const sortPriceLowHigh = document.getElementById("sortPriceLowHigh");
const sortPriceHighLow = document.getElementById("sortPriceHighLow");
const sortRatingHighLow = document.getElementById("sortRatingHighLow");
const categoryFilters = document.getElementById("categoryFilters");
const clearCategoryBtn = document.getElementById("clearCategoryBtn");

// Ek ek karke separate end me function call karne se zyada appropriate way below wala tarika hota hai kuki yeh zyadaa readable hota hai and ensure karta hai ki HTML document ke load hone par hi saare products aur categories load hojaaye page par and along with saare elements par event listener attach hojaaye

document.addEventListener("DOMContentLoaded", async () => {
  await displayProductsOnPage();
  await displayCategoriesOnPage();
  setupEventListeners();
});

// Step:1 Products ko load karna hai and then unko product card me display karna hai jisme  Main Image, Title, Price(Price after discount), Thumbnail image, Product Rating, And "Show Description" ho

// Step:2 Product card me show description and hide desc. ka button rakhna hai

// Step:3 SortByLowPriceToHighPrice and vice versa ka and Sort By Rating(High to Low) wala feature bananaa hai using javascript's .sort() method.

async function displayProductsOnPage() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=15");
    const data = await response.json();
    if (!data) {
      throw new Error("Products not fetched successfully");
    }
    allProducts = data.products;
    /*
    Ab apan DOM ki state bas displayedProducts variable se change karenge kuki apan ke paas saare products ab allProducts variable me store hogaye hai
    */
    displayedProducts = [...allProducts];
    renderProducts(displayedProducts);
  } catch (error) {
    console.error("Error loading products:", error);
    showMessage("Failed to load products. Please try again later.");
  }
}

/*
BASE URL response = {
"products": [
{...product1},
{...product2}
],
"total": 194,
"skip": 0,
"limit": 2
}

product1 = {
"id": 1,
"title": "Essence Mascara Lash Princess",
"description": "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
"category": "beauty",
"price": 9.99,
"discountPercentage": 10.48,
"rating": 2.56,
"stock": 99,
"tags": [],
"brand": "Essence",
"sku": "BEA-ESS-ESS-001",
"weight": 4,
"dimensions": {},
"warrantyInformation": "1 week warranty",
"shippingInformation": "Ships in 3-5 business days",
"availabilityStatus": "In Stock",
"reviews": [],
"returnPolicy": "No return policy",
"minimumOrderQuantity": 48,
"meta": {},
"images": [],
"thumbnail": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp"
},
*/

async function displayCategoriesOnPage() {
  try {
    const response = await fetch("https://dummyjson.com/products/categories");
    const categoryData = await response.json();
    if (!categoryData) {
      throw new Error("Categories not fetched successfully");
    }
    categories = categoryData;
    displayCategoriesFilters();
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

/* Render category filters as radio buttons jiski value slug ke baraabar hogi aur label ka naam category.name honi chaaiye

category API response = [
{
"slug": "beauty",
"name": "Beauty",
"url": "https://dummyjson.com/products/category/beauty"
},
{
"slug": "fragrances",
"name": "Fragrances",
"url": "https://dummyjson.com/products/category/fragrances"
}.......]
*/
function displayCategoriesFilters() {
  categoryFilters.innerHTML = "";
  categories.forEach((category) => {
    const categoryId = category.slug;
    const optionDiv = document.createElement("div");
    optionDiv.className = "category-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.id = `cat-${categoryId}`;
    radio.name = "category";
    radio.value = category.slug;

    const label = document.createElement("label");
    label.htmlFor = `cat-${categoryId}`;
    label.textContent = category.name;

    optionDiv.appendChild(radio);
    optionDiv.appendChild(label);
    categoryFilters.appendChild(optionDiv);

    // Add event listener to radio button
    radio.addEventListener("change", (e) => {
      console.log(radio.checked);
      // if (radio.checked) {
      //   console.log(radio.checked);
      //   console.log(e.target.value);
      //   // selectedCategory = category.slug;
      //   filterByCategory(e.target.value);
      // }
      console.log(e.target.value);
      filterByCategory(e.target.value);
    });
  });
}

async function filterByCategory(category) {
  try {
    const response = await fetch(
      `https://dummyjson.com/products/category/${category}`
    );
    const data = await response.json();
    displayedProducts = data.products;
    renderProducts(displayedProducts);
  } catch (error) {
    console.error("Error filtering by category:", error);
  }
}

function renderProducts(products) {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    showMessage("No products found. Try a different search or filter.");
    return;
  }

  hideMessage();

  products.forEach((product) => {
    const productCard = createProductCard(product);
    productGrid.appendChild(productCard);
  });
}

// Create a product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.id = `product-${product.id}`;

  // Calculate discount percentage
  const discountPercentage = product.discountPercentage
    ? Math.round(product.discountPercentage)
    : 0;

  // Calculate price after discount
  const priceAfterDiscount = product.price
    ? ((product.price * (100 - discountPercentage)) / 100).toFixed(2)
    : 0;

  // Create stars for rating
  const ratingStars = createRatingStars(product.rating);

  // Card structure
  card.innerHTML = `
                <div class="product-image-section">
                    <img src="${product.thumbnail}" alt="${
    product.title
  }" class="main-image" id="main-img-${product.id}">
                </div>
                <div class="thumbnail-container" id="thumbnails-${product.id}">
                    <!-- Thumbnails will be added here dynamically -->
                </div>
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    
                    <div class="product-price">
                        <span class="discounted-price">$${priceAfterDiscount}</span>
                        ${
                          discountPercentage > 0
                            ? `
                            <span class="original-price">$${product.price.toFixed(
                              2
                            )}</span>
                            <span class="discount-badge">Save ${discountPercentage}%</span>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="product-rating">
                        <div class="rating-stars">${ratingStars}</div>
                        <div class="rating-value">${
                          product.rating ? product.rating.toFixed(1) : "N/A"
                        }</div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="desc-btn" data-product-id="${
                          product.id
                        }">Show Description</button>
                        <button class="add-cart-btn" data-product-id="${
                          product.id
                        }">Add to Cart</button>
                    </div>
                </div>
                <div class="product-description" id="desc-${
                  product.id
                }" style="display: none;">
                    ${product.description}
                    <div class="less-desc-btn" data-product-id="${
                      product.id
                    }">Less Description</div>
                </div>
            `;

  // Add thumbnails if available
  const thumbnailContainer = card.querySelector(`#thumbnails-${product.id}`);
  if (product.images && product.images.length > 0) {
    // Add main image as first thumbnail
    addThumbnail(thumbnailContainer, product.thumbnail, product.id, true);

    // Add other images as thumbnails
    product.images.forEach((image, index) => {
      if (index < 4) {
        // Limit to 4 thumbnails
        addThumbnail(thumbnailContainer, image, product.id, false);
      }
    });
  }

  // Set up event listeners for this card
  setupProductCardEvents(card, product.id);

  return card;
}

// Add thumbnail image to container
function addThumbnail(container, imageUrl, productId, isActive) {
  const thumbnail = document.createElement("img");
  thumbnail.src = imageUrl;
  thumbnail.alt = "Thumbnail";
  thumbnail.className = `thumbnail ${isActive ? "active" : ""}`;
  thumbnail.dataset.productId = productId;

  thumbnail.addEventListener("click", () => {
    // Update main image
    const mainImage = document.getElementById(`main-img-${productId}`);
    mainImage.src = imageUrl;

    // Update active thumbnail
    const allThumbnails = container.querySelectorAll(".thumbnail");
    allThumbnails.forEach((thumb) => thumb.classList.remove("active"));
    thumbnail.classList.add("active");
  });

  container.appendChild(thumbnail);
}

// Create star rating display
function createRatingStars(rating) {
  if (!rating) return "☆☆☆☆☆";

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  //½ "½"
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return (
    "★".repeat(fullStars) + (hasHalfStar ? "1/2" : "") + "☆".repeat(emptyStars)
  );
}

// Set up event listeners for a product card Here we are accessing the showDescBtn and all other HTML elements by scoped HTML element access method
function setupProductCardEvents(card, productId) {
  // this will select that showDesc btn which has desc-btn class and data-product-id = productId
  const showDescBtn = card.querySelector(
    `.desc-btn[data-product-id="${productId}"]`
  );
  const descDiv = card.querySelector(`#desc-${productId}`);
  console.log(descDiv);
  showDescBtn.addEventListener("click", (e) => {
    // e.stopPropagation(); // Prevent event from bubbling up

    console.log(e.target);
    console.log(e.currentTarget);
    console.log(descDiv);
    descDiv.style.display = "block";
    // showDescBtn.textContent = "Hide Description";
    showDescBtn.style.display = "none";
    // showDescBtn.classList.add("active");
  });

  // Less description button selection similar to the selection of showDescBtn
  const lessDescBtn = card.querySelector(
    `.less-desc-btn[data-product-id="${productId}"]`
  );
  lessDescBtn.addEventListener("click", () => {
    // e.stopPropagation(); // Prevent event from bubbling up

    descDiv.style.display = "none";
    showDescBtn.textContent = "Show Description";
    showDescBtn.classList.remove("active");
    showDescBtn.style.display = "block";
  });

  // Add to cart button
  const addCartBtn = card.querySelector(
    `.add-cart-btn[data-product-id="${productId}"]`
  );
  addCartBtn.addEventListener("click", (e) => {
    console.log(e.target.dataset.productId);
    alert(
      `Added "${card.querySelector(".product-title").textContent}" to cart!`
    );
  });
}

// Set up event listeners for controls section of the main section page such as search button, clear button, sorting buttons, category buttons and clear buttons.
function setupEventListeners() {
  // Search functionality
  searchBtn.addEventListener("click", executeSearchEvent);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearchEvent();
  });

  // Clear search
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    displayedProducts = [...allProducts];
    renderProducts(displayedProducts);
    hideMessage();
  });

  // Sorting functionality
  sortPriceLowHigh.addEventListener("click", () => {
    const sorted = [...displayedProducts].sort((a, b) => {
      const priceA = (a.price * (100 - (a.discountPercentage || 0))) / 100;
      const priceB = (b.price * (100 - (b.discountPercentage || 0))) / 100;
      return priceA - priceB;
    });
    renderProducts(sorted);
  });

  sortPriceHighLow.addEventListener("click", () => {
    const sorted = [...displayedProducts].sort((a, b) => {
      const priceA = (a.price * (100 - (a.discountPercentage || 0))) / 100;
      const priceB = (b.price * (100 - (b.discountPercentage || 0))) / 100;
      return priceB - priceA;
    });
    renderProducts(sorted);
  });

  sortRatingHighLow.addEventListener("click", () => {
    const sorted = [...displayedProducts].sort((a, b) => {
      return (b.rating || 0) - (a.rating || 0);
    });
    renderProducts(sorted);
  });

  // Clear category filter
  clearCategoryBtn.addEventListener("click", () => {
    // selectedCategory = null;
    displayedProducts = [...allProducts];
    renderProducts(displayedProducts);

    // Uncheck all radio buttons
    const radioButtons = document.querySelectorAll('input[name="category"]');
    radioButtons.forEach((radio) => (radio.checked = false));
  });
}

// Perform search using API
/* search wali API me already 30 ki limit lagi hui hai isliye apan ko explicitly rate limiting lagaane ki need nahi hai par apan URL par rate limit lagaa sakte hai explicitly by "URL/?query=${query}&limit=15" ko "URL/?query=${query}&limit=15" se replace karke

      maximum apne UI me 18 products aa sakte hai, yeh pata chala tha by passing "Red" as query string by coincidence. isliye apan limit 18 set karenge

    search result below JSON jesaa hogaa
        {
          "products": [],
          "total": 194,
          "skip": 0,
          "limit": 30
      }
      */
async function executeSearchEvent() {
  const query = searchInput.value.trim();

  if (!query) {
    alert("Enter something for search!");
    displayedProducts = [...allProducts];
    renderProducts(displayedProducts);
    return;
  }

  try {
    const limit = 18;
    const response = await fetch(
      `https://dummyjson.com/products/search?q=${query}&limit=${limit}`
    );
    const data = await response.json();

    if (data.products.length === 0) {
      showMessage(`No products found for "${searchTerm}"`);
    }
    displayedProducts = data.products;
    renderProducts(displayedProducts);
  } catch (error) {
    console.error("Error searching products:", error);
    showMessage("Error searching products. Please try again.");
  }
}

// Show message if products search nahi hote hai yaa fetching unsuccessful rehjati hai
function showMessage(text) {
  messageDiv.textContent = text;
  messageDiv.style.display = "block";
  productGrid.style.display = "none";
}

// Hide message kardo if sab sahi hota hai toh
function hideMessage() {
  messageDiv.style.display = "none";
  productGrid.style.display = "grid";
}
