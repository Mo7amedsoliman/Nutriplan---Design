export class FoodLogState {
  constructor() {
    this.storageKey = "dailyFoodLog";
    this.targets = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65,
    };
    this.loggedMeals = this.loadFromStorage();
  }

  loadFromStorage() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.loggedMeals));
  }

  logMeal(mealObj) {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const sanitizedMeal = {
      name: mealObj.name || "Custom Meal",
      thumbnail: mealObj.thumbnail || "https://via.placeholder.com/80",
      calories: Number(mealObj.calories) || 485,
      protein: Number(mealObj.protein) || 42,
      carbs: Number(mealObj.carbs) || 52,
      fat: Number(mealObj.fat) || 8,
      time: currentTime,
    };

    this.loggedMeals.push(sanitizedMeal);
    this.saveToStorage();
    return this.loggedMeals;
  }

  deleteMeal(index) {
    this.loggedMeals.splice(index, 1);
    this.saveToStorage();
    return this.loggedMeals;
  }

  clearAllLogs() {
    this.loggedMeals = [];
    localStorage.removeItem(this.storageKey);
  }

  getTotals() {
    return this.loggedMeals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories || 0);
        acc.protein += Number(meal.protein || 0);
        acc.carbs += Number(meal.carbs || 0);
        acc.fat += Number(meal.fat || 0);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }
}

const logState = new FoodLogState();

export class UIManager {
  /**
   * دالة تأكيد إضافة الوجبة باستخدام SweetAlert2
   * @param {Object} mealObj -
   */
  static askToLogMeal(mealObj) {
    const mealName = mealObj.name || "Custom Meal";

    Swal.fire({
      title: `Do you want to log "${mealName}" to your tracker?`,
      text: "This will add the meal's nutritional values to your daily totals.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        logMealIntoSystem(mealObj);

        Swal.fire({
          title: "Logged!",
          text: `"${mealName}" has been successfully logged to your tracker.`,
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      }
    });
  }

  static displaymeals(meals) {
    const grid = document.getElementById("recipes-grid");
    const countText = document.getElementById("recipes-count");

    if (countText) {
      countText.innerText = `Showing ${meals.length} recipes`;
    }

    if (!grid) return;

    grid.innerHTML = meals
      .map(
        (meal) => `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.id}">
        <div class="relative h-48 overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category}</span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.area}</span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">Delicious recipe to try!</p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category}</span>
            <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.area}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  static displayMealDetails(meal) {
    const mealDetailsSection = document.getElementById("meal-details");
    const allRecipesSection = document.getElementById("all-recipes-section");
    const searchFiltersSection = document.getElementById(
      "search-filters-section",
    );
    const mealCategoriesSection = document.getElementById(
      "meal-categories-section",
    );
    const productsSection = document.getElementById("products-section");

    if (!mealDetailsSection) return;

    if (allRecipesSection) allRecipesSection.classList.add("hidden");
    if (searchFiltersSection) searchFiltersSection.classList.add("hidden");
    if (mealCategoriesSection) mealCategoriesSection.classList.add("hidden");
    if (productsSection) productsSection.classList.add("hidden");

    mealDetailsSection.classList.remove("hidden");

    let ingredientsHTML = "";
    if (meal.ingredients && meal.ingredients.length > 0) {
      meal.ingredients.forEach((item) => {
        if (item.ingredient && item.ingredient.trim() !== "") {
          ingredientsHTML += `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
              <input type="checkbox" checked class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
              <span class="text-gray-700"><span class="font-medium text-gray-900">${item.measure || ""}</span> <span class="ingredient-name-text">${item.ingredient}</span></span>
            </div>`;
        }
      });
    }

    let instructionsHTML = "";
    if (meal.instructions && Array.isArray(meal.instructions)) {
      meal.instructions.forEach((step, index) => {
        if (step && step.trim() !== "") {
          instructionsHTML += `
            <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
              <p class="text-gray-700 leading-relaxed pt-2">${step.trim()}</p>
            </div>`;
        }
      });
    } else if (meal.instructions && typeof meal.instructions === "string") {
      const steps = meal.instructions
        .split(/\r?\n|\./)
        .filter((step) => step.trim().length > 1);
      steps.forEach((step, index) => {
        instructionsHTML += `
          <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
            <p class="text-gray-700 leading-relaxed pt-2">${step.trim()}.</p>
          </div>`;
      });
    }

    let videoEmbedHTML = "";
    if (meal.youtube) {
      const videoId = meal.youtube.split("v=")[1]?.split("&")[0];
      if (videoId) {
        videoEmbedHTML = `
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-video text-red-500"></i> Video Tutorial</h2>
            <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <iframe src="https://www.youtube.com/embed/${videoId}" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>
            </div>
          </div>`;
      }
    }

    const calories = Number(meal.calories) || 485;
    const protein = Number(meal.protein) || 42;
    const carbs = Number(meal.carbs) || 52;
    const fat = Number(meal.fat) || 8;
    const servings = Number(meal.servings) || 4;

    mealDetailsSection.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i><span>Back to Recipes</span>
        </button>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.thumbnail}" alt="${meal.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category || "General"}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area || "International"}</span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.name}</h1>
              <div class="flex items-center gap-6 text-white/90">
                <span class="flex items-center gap-2"><i class="fa-solid fa-clock"></i><span>30 min</span></span>
                <span class="flex items-center gap-2"><i class="fa-solid fa-utensils"></i><span>${servings} servings</span></span>
                <span class="flex items-center gap-2"><i class="fa-solid fa-fire"></i><span><span id="calories-summary-val">${calories}</span> cal/serving</span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-this-meal-hero-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all" data-meal-id="${meal.id}">
            <i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i> Ingredients
                <span class="text-sm font-normal text-gray-500 ml-auto">${meal.ingredients?.length || 0} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${ingredientsHTML || '<p class="text-gray-500">No ingredients available.</p>'}</div>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-shoe-prints text-emerald-600"></i> Instructions</h2>
              <div class="space-y-4">${instructionsHTML}</div>
            </div>
            ${videoEmbedHTML}
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-pie text-emerald-600"></i> Nutrition Facts</h2>
              <div>
                <p class="text-sm text-gray-500 mb-4">Per serving</p>
                <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                  <p class="text-sm text-gray-600">Calories per serving</p>
                  <p class="text-4xl font-bold text-emerald-600" id="calories-display-node">${calories}</p>
                  <p class="text-xs text-gray-500 mt-1" id="calories-total-node">Total: ${calories * servings} cal</p>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-emerald-500"></div><span>Protein</span></div>
                    <span class="font-bold text-gray-900" id="protein-display-node">${protein}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2"><div id="protein-progress-node" class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min((protein / 50) * 100, 100)}%"></div></div>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span>Carbs</span></div>
                    <span class="font-bold text-gray-900" id="carbs-display-node">${carbs}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2"><div id="carbs-progress-node" class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min((carbs / 250) * 100, 100)}%"></div></div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span>Fat</span></div>
                    <span class="font-bold text-gray-900" id="fat-display-node">${fat}g</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2"><div id="fat-progress-node" class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min((fat / 65) * 100, 100)}%"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const logBtn = document.getElementById("log-this-meal-hero-btn");
    if (logBtn) {
      logBtn.addEventListener("click", async () => {
        const selectedIngredients = [];
        document
          .querySelectorAll("#meal-details .ingredient-checkbox:checked")
          .forEach((cb) => {
            const text = cb
              .closest("div")
              .querySelector(".ingredient-name-text")
              ?.textContent.trim();
            if (text) selectedIngredients.push(text);
          });

        if (selectedIngredients.length === 0) {
          Swal.fire({
            title: "No ingredients selected!",
            text: "Please check at least one ingredient to log and analyze.",
            icon: "warning",
            confirmButtonColor: "#10b981",
          });
          return;
        }

        Swal.fire({
          title: "Analyzing Nutrition...",
          text: "Please wait while we calculate calories and macros.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const importModule = await import("./api/mealdb.js");
          const nutritionData =
            await importModule.getNutritionAnalysis(selectedIngredients);

          Swal.close();

          const finalCalories = nutritionData?.calories ?? calories;
          const finalProtein =
            Math.round(nutritionData?.totalNutrients?.PROCNT?.quantity) ||
            protein;
          const finalCarbs =
            Math.round(nutritionData?.totalNutrients?.CHOCDF?.quantity) ||
            carbs;
          const finalFat =
            Math.round(nutritionData?.totalNutrients?.FAT?.quantity) || fat;

          if (document.getElementById("calories-display-node"))
            document.getElementById("calories-display-node").textContent =
              finalCalories;
          if (document.getElementById("calories-summary-val"))
            document.getElementById("calories-summary-val").textContent =
              finalCalories;
          if (document.getElementById("calories-total-node"))
            document.getElementById("calories-total-node").textContent =
              `Total: ${finalCalories * servings} cal`;
          if (document.getElementById("protein-display-node"))
            document.getElementById("protein-display-node").textContent =
              `${finalProtein}g`;
          if (document.getElementById("carbs-display-node"))
            document.getElementById("carbs-display-node").textContent =
              `${finalCarbs}g`;
          if (document.getElementById("fat-display-node"))
            document.getElementById("fat-display-node").textContent =
              `${finalFat}g`;

          // تحديث أشرطة التقدم (Progress Bars)
          if (document.getElementById("protein-progress-node"))
            document.getElementById("protein-progress-node").style.width =
              `${Math.min((finalProtein / 50) * 100, 100)}%`;
          if (document.getElementById("carbs-progress-node"))
            document.getElementById("carbs-progress-node").style.width =
              `${Math.min((finalCarbs / 250) * 100, 100)}%`;
          if (document.getElementById("fat-progress-node"))
            document.getElementById("fat-progress-node").style.width =
              `${Math.min((finalFat / 65) * 100, 100)}%`;

          const currentMealData = {
            name: meal.name,
            thumbnail: meal.thumbnail,
            calories: finalCalories,
            protein: finalProtein,
            carbs: finalCarbs,
            fat: finalFat,
          };

          UIManager.askToLogMeal(currentMealData);
        } catch (err) {
          Swal.close();
          console.error(err);

          UIManager.askToLogMeal({
            name: meal.name,
            thumbnail: meal.thumbnail,
            calories,
            protein,
            carbs,
            fat,
          });
        }
      });
    }

    const backBtn = document.getElementById("back-to-meals-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        mealDetailsSection.classList.add("hidden");
        if (searchFiltersSection)
          searchFiltersSection.classList.remove("hidden");
        if (mealCategoriesSection)
          mealCategoriesSection.classList.remove("hidden");
        if (allRecipesSection) allRecipesSection.classList.remove("hidden");
        if (productsSection) productsSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  static renderFilterButtons(
    { categories, areas },
    onCategoryClick,
    onAreaClick,
  ) {
    const categoriesContainer = document.getElementById(
      "categories-filter-container",
    );
    const areasContainer = document.getElementById("areas-filter-container");

    if (categoriesContainer && categories) {
      let categoriesHTML = `<button class="category-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm transition-all" data-category="all">All Types</button>`;
      categories.forEach((cat) => {
        categoriesHTML += `<button class="category-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-200 transition-all" data-category="${cat.name}">${cat.name}</button>`;
      });
      categoriesContainer.innerHTML = categoriesHTML;

      categoriesContainer
        .querySelectorAll(".category-filter-btn")
        .forEach((btn) => {
          btn.addEventListener("click", function () {
            categoriesContainer
              .querySelectorAll(".category-filter-btn")
              .forEach((b) => {
                b.classList.replace("bg-emerald-600", "bg-gray-100");
                b.classList.replace("text-white", "text-gray-700");
              });
            this.classList.replace("bg-gray-100", "bg-emerald-600");
            this.classList.replace("text-gray-700", "text-white");
            if (onCategoryClick) onCategoryClick(this.dataset.category);
          });
        });
    }

    if (areasContainer && areas) {
      let areasHTML = `<button class="area-filter-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm transition-all" data-area="all">All Cuisines</button>`;
      areas.forEach((area) => {
        areasHTML += `<button class="area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-200 transition-all" data-area="${area.name}">${area.name}</button>`;
      });
      areasContainer.innerHTML = areasHTML;

      areasContainer.querySelectorAll(".area-filter-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          areasContainer.querySelectorAll(".area-filter-btn").forEach((b) => {
            b.classList.replace("bg-emerald-600", "bg-gray-100");
            b.classList.replace("text-white", "text-gray-700");
          });
          this.classList.replace("bg-gray-100", "bg-emerald-600");
          this.classList.replace("text-gray-700", "text-white");
          if (onAreaClick) onAreaClick(this.dataset.area);
        });
      });
    }
  }

  static updateFoodLogDOM() {
    const itemsContainer = document.getElementById("logged-items-list");
    const clearBtn = document.getElementById("clear-foodlog");
    const headerCounter =
      document.querySelector("#foodlog-today-section h4") ||
      document.querySelector(".logged-items-section h4");

    const totals = logState.getTotals();
    const meals = logState.loggedMeals;

    if (document.getElementById("log-calories-current"))
      document.getElementById("log-calories-current").innerText =
        totals.calories;
    if (document.getElementById("log-protein-current"))
      document.getElementById("log-protein-current").innerText = totals.protein;
    if (document.getElementById("log-carbs-current"))
      document.getElementById("log-carbs-current").innerText = totals.carbs;
    if (document.getElementById("log-fat-current"))
      document.getElementById("log-fat-current").innerText = totals.fat;

    this.updateProgressBar(
      "log-calories-current",
      logState.targets.calories,
      "bg-emerald-500",
    );
    this.updateProgressBar(
      "log-protein-current",
      logState.targets.protein,
      "bg-blue-500",
    );
    this.updateProgressBar(
      "log-carbs-current",
      logState.targets.carbs,
      "bg-amber-500",
    );
    this.updateProgressBar(
      "log-fat-current",
      logState.targets.fat,
      "bg-purple-500",
    );

    if (!itemsContainer) return;

    if (headerCounter)
      headerCounter.innerText = `Logged Items (${meals.length})`;

    if (meals.length === 0) {
      if (clearBtn) clearBtn.style.display = "none";
      itemsContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
          <p class="font-medium">No meals logged today</p>
          <p class="text-sm">Add meals from the Meals page or scan products</p>
        </div>`;
      return;
    }

    if (clearBtn) clearBtn.style.display = "inline-flex";

    itemsContainer.innerHTML = meals
      .map(
        (meal, index) => `
      <div class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all mb-3">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <img src="${meal.thumbnail}" alt="${meal.name}" class="w-16 h-16 rounded-xl object-cover shadow-sm bg-gray-200 shrink-0" />
          <div class="min-w-0">
            <h5 class="font-bold text-gray-900 text-base mb-0.5 truncate">${meal.name}</h5>
            <p class="text-xs text-gray-500 flex items-center gap-2">
              <span>1 serving</span>
              <span class="text-gray-300">•</span>
              <span class="text-emerald-600 font-medium">Recipe</span>
            </p>
            <p class="text-[11px] text-gray-400 mt-1">${meal.time}</p>
          </div>
        </div>

        <div class="flex items-center gap-6 shrink-0">
          <div class="text-right">
            <span class="text-lg font-extrabold text-emerald-600">${meal.calories}</span>
            <span class="text-[10px] text-gray-400 block -mt-1">kcal</span>
          </div>
          
          <div class="hidden sm:flex items-center gap-2 text-xs text-gray-600 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-100">
            <span class="text-gray-500">${meal.protein}g <span class="text-[10px] text-gray-400 font-normal">P</span></span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-500">${meal.carbs}g <span class="text-[10px] text-gray-400 font-normal">C</span></span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-500">${meal.fat}g <span class="text-[10px] text-gray-400 font-normal">F</span></span>
          </div>

          <button class="delete-log-item-btn text-gray-400 hover:text-red-500 p-2 transition-colors" data-index="${index}">
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  static updateProgressBar(elementId, targetValue, baseColorClass) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentValue = Number(element.innerText);
    const progressWrapper =
      element.parentElement?.nextElementSibling ||
      element.closest(".flex-col")?.querySelector(".w-full");
    if (!progressWrapper) return;

    const progressBar = progressWrapper.querySelector("div");
    if (!progressBar) return;

    const percentage = (currentValue / targetValue) * 100;
    progressBar.style.width = `${Math.min(percentage, 100)}%`;

    if (percentage > 100) {
      progressBar.className =
        "bg-rose-500 h-2 rounded-full transition-all duration-300";
    } else {
      progressBar.className = `${baseColorClass} h-2 rounded-full transition-all duration-300`;
    }
  }
}

export function displaymeals(meals) {
  UIManager.displaymeals(meals);
}
export function displayMealDetails(meal) {
  UIManager.displayMealDetails(meal);
}
export function renderFilterButtons(data, onCat, onArea) {
  UIManager.renderFilterButtons(data, onCat, onArea);
}
export function updateFoodLogDOM() {
  UIManager.updateFoodLogDOM();
}

export function logMealIntoSystem(mealObj) {
  logState.logMeal(mealObj);
  UIManager.updateFoodLogDOM();
}

document.addEventListener("DOMContentLoaded", () => {
  const itemsContainer = document.getElementById("logged-items-list");
  if (itemsContainer) {
    itemsContainer.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".delete-log-item-btn");
      if (!deleteBtn) return;

      const targetIndex = Number(deleteBtn.dataset.index);
      logState.deleteMeal(targetIndex);
      UIManager.updateFoodLogDOM();
    });
  }

  const clearBtn = document.getElementById("clear-foodlog");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to clear today's food log! This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, clear it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
      }).then((result) => {
        if (result.isConfirmed) {
          logState.clearAllLogs();
          UIManager.updateFoodLogDOM();

          Swal.fire({
            title: "Cleared!",
            text: "Your food log has been successfully cleared.",
            icon: "success",
            confirmButtonColor: "#10b981",
          });
        }
      });
    });
  }

  UIManager.updateFoodLogDOM();
});

window.updateFoodLogDOM = updateFoodLogDOM;
window.logMealIntoSystem = logMealIntoSystem;

export function renderProductCards(products, containerElement, countElement) {
  if (!containerElement) return;

  if (!products || products.length === 0) {
    if (countElement) countElement.textContent = "0 products found";
    containerElement.innerHTML = `
      <div class="text-center col-span-full py-12 text-gray-500">
        <i class="fa-solid fa-circle-exclamation text-2xl mb-2 block"></i>
        No products found. Try another search or barcode!
      </div>`;
    return;
  }

  if (countElement)
    countElement.textContent = `Showing ${products.length} products`;
  let htmlTemplate = "";

  products.forEach((prod) => {
    const name = prod.product_name || "Unknown Product";
    const image =
      prod.image_front_url ||
      prod.image_thumb_url ||
      "https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg";
    const brand = prod.brands || "Packaged Brand";
    const grade = (prod.nutriscore_grade || "A").toUpperCase();
    const quantity = prod.quantity || "250g";

    const calories = prod.nutriments?.["energy-kcal_100g"] || "350";
    const protein =
      prod.nutriments?.proteins_100g !== undefined
        ? `${prod.nutriments.proteins_100g}g`
        : "8.5g";
    const carbs =
      prod.nutriments?.carbohydrates_100g !== undefined
        ? `${prod.nutriments.carbohydrates_100g}g`
        : "45.2g";
    const fat =
      prod.nutriments?.fat_100g !== undefined
        ? `${prod.nutriments.fat_100g}g`
        : "12.3g";
    const sugar =
      prod.nutriments?.sugars_100g !== undefined
        ? `${prod.nutriments.sugars_100g}g`
        : "18.5g";

    htmlTemplate += `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${prod.code || ""}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${image}" alt="${name}" loading="lazy" />
          <div class="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${grade.substring(0, 1)}</div>
          <div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</div>
        </div>
        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${name}</h3>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-weight-scale mr-1"></i>${quantity}</span>
            <span><i class="fa-solid fa-fire mr-1"></i>${calories} kcal/100g</span>
          </div>
          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${protein}</p><p class="text-[10px] text-gray-500">Protein</p></div>
            <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${carbs}</p><p class="text-[10px] text-gray-500">Carbs</p></div>
            <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${fat}</p><p class="text-[10px] text-gray-500">Fat</p></div>
            <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${sugar}</p><p class="text-[10px] text-gray-500">Sugar</p></div>
          </div>
        </div>
      </div>`;
  });

  containerElement.innerHTML = htmlTemplate;
}
