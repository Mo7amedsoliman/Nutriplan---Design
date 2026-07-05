import { getInitialMeals, searchMeals, getMealDetails } from "./api/mealdb.js";
import { displaymeals, displayMealDetails } from "./ui/components.js";

class NutriPlanApp {
  constructor() {
    this.loadingScreen = document.querySelector(".loading");
    this.searchInput = document.getElementById("search-input");
    this.gridContainer = document.getElementById("recipes-grid");
    this.areasContainer =
      document.getElementById("areas-filter-container") ||
      document.querySelector("#search-filters-section .flex");
    this.categoriesGrid = document.getElementById("categories-grid");

    this.homeSection = document.getElementById("home-section");
    this.searchFiltersSection = document.getElementById(
      "search-filters-section",
    );
    this.mealCategoriesSection = document.getElementById(
      "meal-categories-section",
    );
    this.mealDetailsSection = document.getElementById("meal-details");
    this.allRecipesSection = document.getElementById("all-recipes-section"); // 2. إدارة حال التطبيق (State)

    this.activeArea = "all";
    this.activeCategory = "all";
    this.debounceTimeout = null; // 3. تشغيل التطبيق والـ Router فورا

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.handleRouting();

    if (this.loadingScreen) this.loadingScreen.style.display = "flex";
    const data = await getInitialMeals();
    if (this.loadingScreen) this.loadingScreen.style.display = "none";

    if (data && data.results) {
      displaymeals(data.results);
    }

    this.renderAppFilters();
  }

  setupEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) =>
        this.debounceSearch(() => this.handleSearch(e), 500),
      );
    }

    if (this.gridContainer) {
      this.gridContainer.addEventListener("click", (e) =>
        this.navigateToDetails(e),
      );
    }

    if (this.mealDetailsSection) {
      this.mealDetailsSection.addEventListener("click", (e) =>
        this.handleBackToMeals(e),
      );
    }

    document.addEventListener("click", (e) => this.handleGlobalLogClick(e)); // الاستماع لتغيير الرابط الخلفي في المتصفح (Browser Back/Forward Buttons)

    window.addEventListener("popstate", () => this.handleRouting());
  }

  debounceSearch(callback, delay) {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(callback, delay);
  }

  async handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    if (this.loadingScreen) this.loadingScreen.style.display = "flex";

    let data =
      query === "" ? await getInitialMeals() : await searchMeals(query);

    if (this.loadingScreen) this.loadingScreen.style.display = "none";
    this.resetAreaFilterStyles();

    displaymeals(
      data && data.results && data.results.length > 0 ? data.results : [],
    );
  }

  resetAreaFilterStyles() {
    this.activeArea = "all";
    if (this.areasContainer) {
      this.areasContainer
        .querySelectorAll(".area-filter-btn")
        .forEach((btn) => {
          btn.className =
            btn.dataset.area === "all"
              ? "area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap transition-all"
              : "area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
        });
    }
  }

  async renderAppFilters() {
    try {
      if (this.areasContainer) {
        const res = await fetch(
          "https://nutriplan-api.vercel.app/api/meals/areas",
        );
        const areaData = await res.json();

        if (areaData && areaData.results) {
          let areasHTML = `<button class="area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap transition-all" data-area="all">All Cuisines</button>`;
          areaData.results.forEach((item) => {
            areasHTML += `<button class="area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="${item.name}">${item.name}</button>`;
          });
          this.areasContainer.innerHTML = areasHTML;

          this.areasContainer.addEventListener("click", async (e) =>
            this.handleAreaFilterClick(e),
          );
        }
      }
    } catch (err) {
      console.error("Error rendering areas:", err);
    }

    this.renderCategoriesGrid();
  }

  async handleAreaFilterClick(e) {
    const btn = e.target.closest(".area-filter-btn");
    if (!btn) return;

    this.areasContainer.querySelectorAll(".area-filter-btn").forEach((b) => {
      b.className =
        "area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
    });
    btn.className =
      "area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap transition-all";

    this.activeArea = btn.dataset.area;
    if (this.searchInput) this.searchInput.value = "";

    if (this.loadingScreen) this.loadingScreen.style.display = "flex";
    let resultData =
      this.activeArea === "all"
        ? await getInitialMeals()
        : await (
            await fetch(
              `https://nutriplan-api.vercel.app/api/meals/filter?a=${this.activeArea}`,
            )
          ).json();

    if (this.loadingScreen) this.loadingScreen.style.display = "none";
    displaymeals(resultData?.results || []);
  }

  renderCategoriesGrid() {
    const sampleCategories = [
      {
        name: "Beef",
        icon: "fa-drumstick-bite",
        color: "from-red-50 to-rose-50",
        border: "border-red-100",
        badge: "from-red-400 to-rose-500",
      },
      {
        name: "Chicken",
        icon: "fa-hotdog",
        color: "from-amber-50 to-orange-50",
        border: "border-amber-100",
        badge: "from-amber-400 to-orange-500",
      },
      {
        name: "Dessert",
        icon: "fa-cake-candles",
        color: "from-pink-50 to-rose-50",
        border: "border-pink-100",
        badge: "from-pink-400 to-rose-500",
      },
      {
        name: "Lamb",
        icon: "fa-cloud",
        color: "from-orange-50 to-amber-50",
        border: "border-orange-100",
        badge: "from-orange-400 to-amber-500",
      },
      {
        name: "Miscellaneous",
        icon: "fa-bowl-rice",
        color: "from-slate-50 to-gray-50",
        border: "border-slate-200",
        badge: "from-slate-400 to-gray-500",
      },
      {
        name: "Pasta",
        icon: "fa-plate-wheat",
        color: "from-yellow-50 to-amber-50",
        border: "border-yellow-100",
        badge: "from-yellow-400 to-amber-500",
      },
      {
        name: "Pork",
        icon: "fa-bacon",
        color: "from-red-50 to-orange-50",
        border: "border-red-100",
        badge: "from-red-400 to-orange-400",
      },
      {
        name: "Seafood",
        icon: "fa-fish",
        color: "from-blue-50 to-cyan-50",
        border: "border-blue-100",
        badge: "from-blue-400 to-cyan-500",
      },
      {
        name: "Side",
        icon: "fa-utensils",
        color: "from-emerald-50 to-teal-50",
        border: "border-emerald-100",
        badge: "from-emerald-400 to-teal-500",
      },
      {
        name: "Starter",
        icon: "fa-bowl-food",
        color: "from-cyan-50 to-blue-50",
        border: "border-cyan-100",
        badge: "from-cyan-400 to-blue-500",
      },
      {
        name: "Vegan",
        icon: "fa-leaf",
        color: "from-green-50 to-emerald-50",
        border: "border-green-100",
        badge: "from-green-400 to-emerald-500",
      },
      {
        name: "Vegetarian",
        icon: "fa-seedling",
        color: "from-lime-50 to-green-50",
        border: "border-lime-100",
        badge: "from-lime-400 to-green-500",
      },
    ];
    if (!this.categoriesGrid) return;

    this.categoriesGrid.innerHTML = sampleCategories
      .map(
        (cat) => `
  <div class="category-card bg-gradient-to-br ${cat.color} rounded-xl p-4 border ${cat.border} hover:shadow-md cursor-pointer transition-all group" data-category="${cat.name}">
    <div class="flex items-center gap-3">
      <div class="text-white w-10 h-10 bg-gradient-to-br ${cat.badge} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
        <i class="fa-solid ${cat.icon}"></i>
      </div>
      <div>
        <h3 class="text-sm font-bold text-gray-900">${cat.name}</h3>
      </div>
    </div>
  </div>
`,
      )
      .join("");

    this.categoriesGrid.addEventListener("click", async (e) => {
      const card = e.target.closest(".category-card");
      if (!card) return;

      this.activeCategory = card.dataset.category;
      if (this.searchInput) this.searchInput.value = "";
      this.resetAreaFilterStyles();

      if (this.loadingScreen) this.loadingScreen.style.display = "flex";
      const catRes = await fetch(
        `https://nutriplan-api.vercel.app/api/meals/filter?c=${this.activeCategory}`,
      );
      const resultData = await catRes.json();
      if (this.loadingScreen) this.loadingScreen.style.display = "none";

      displaymeals(resultData?.results || []);
    });
  }

  async navigateToDetails(e) {
    const card = e.target.closest(".recipe-card");
    if (!card) return;

    const mealId = card.dataset.mealId;
    if (this.loadingScreen) this.loadingScreen.style.display = "flex";
    const data = await getMealDetails(mealId);
    if (this.loadingScreen) this.loadingScreen.style.display = "none";

    if (data && data.result) {
      displayMealDetails(data.result);

      history.pushState({ page: "details", id: mealId }, "", `?meal=${mealId}`);
      this.toggleSectionsVisibility("details");
    }
  }

  handleBackToMeals(e) {
    const backBtn = e.target.closest("#back-to-meals-btn");
    if (!backBtn) return;

    history.pushState({ page: "home" }, "", window.location.pathname);
    this.toggleSectionsVisibility("home");
  }

  toggleSectionsVisibility(view) {
    if (view === "details") {
      if (this.homeSection) this.homeSection.style.display = "none";
      if (this.searchFiltersSection)
        this.searchFiltersSection.style.display = "none";
      if (this.mealCategoriesSection)
        this.mealCategoriesSection.style.display = "none";
      if (this.allRecipesSection)
        this.allRecipesSection.classList.add("hidden");
      if (this.mealDetailsSection)
        this.mealDetailsSection.style.display = "block";
    } else {
      if (this.mealDetailsSection)
        this.mealDetailsSection.style.display = "none";
      if (this.homeSection) this.homeSection.style.display = "block";
      if (this.searchFiltersSection)
        this.searchFiltersSection.style.display = "block";
      if (this.mealCategoriesSection)
        this.mealCategoriesSection.style.display = "block";
      if (this.allRecipesSection)
        this.allRecipesSection.classList.remove("hidden");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async handleRouting() {
    const params = new URLSearchParams(window.location.search);
    const mealId = params.get("meal");
    if (mealId) {
      if (this.loadingScreen) this.loadingScreen.style.display = "flex";
      const data = await getMealDetails(mealId);
      if (this.loadingScreen) this.loadingScreen.style.display = "none";
      if (data && data.result) {
        displayMealDetails(data.result);
        this.toggleSectionsVisibility("details");
      }
    } else {
      this.toggleSectionsVisibility("home");
    }
  }

  async handleGlobalLogClick(e) {
    const logBtn = e.target.closest("#log-this-meal-hero-btn");
    if (!logBtn) return;

    const ingredients = Array.from(
      document.querySelectorAll(".ingredient-item"),
    ).map((el) => el.innerText);
    const mealName = document.querySelector("#meal-details h1")?.innerText;

    Swal.fire({
      title: "Analyzing nutrition...",
      didOpen: () => Swal.showLoading(),
    });

    const nutritionData = await getNutritionAnalysis(mealName, ingredients);

    Swal.close();

    if (nutritionData && nutritionData.calories) {
      const finalMealData = {
        name: mealName,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
      };
      this.saveMealToLog(finalMealData);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.AppInstance = new NutriPlanApp();
});
