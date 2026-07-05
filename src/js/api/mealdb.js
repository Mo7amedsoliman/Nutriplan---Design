class MealAPI {
  constructor() {
    this.baseUrl = "https://nutriplan-api.vercel.app/api/";
    this.endpoints = {
      SEARCH: `${this.baseUrl}meals/search`,
      FILTER: `${this.baseUrl}meals/filter`,
      MEAL_DETAILS: `${this.baseUrl}meals/`,
      CATEGORIES: `${this.baseUrl}meals/categories`,
      AREAS: `${this.baseUrl}meals/areas`,
      RANDOM: `${this.baseUrl}meals/random`,
      PRODUCT_SCAN: `${this.baseUrl}products/`,
      NUTRITION_ANALYZE: `${this.baseUrl}nutrition/analyze`,
    };
  }

  async #fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP Error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`API Fetch Error [${url}]:`, error);
      return null;
    }
  }

  async getInitialMeals() {
    return await this.#fetchData(this.endpoints.SEARCH);
  }
  async searchMeals(query) {
    return await this.#fetchData(`${this.endpoints.SEARCH}?q=${query}`);
  }
  async getMealDetails(id) {
    return await this.#fetchData(`${this.endpoints.MEAL_DETAILS}${id}`);
  }

  async filterMeals({ area, category }) {
    if (area)
      return await this.#fetchData(`${this.endpoints.FILTER}?a=${area}`);
    if (category)
      return await this.#fetchData(`${this.endpoints.FILTER}?c=${category}`);
    return null;
  }

  async scanProduct(barcodeOrName) {
    return await this.#fetchData(
      `${this.endpoints.PRODUCT_SCAN}${barcodeOrName}`,
    );
  }

  async getNutritionAnalysis(
    recipeName,
    ingredientsArray,
    apiKey = "YOUR_API_KEY",
  ) {
    return await this.#fetchData(this.endpoints.NUTRITION_ANALYZE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        title: recipeName,
        ingredients: ingredientsArray,
      }),
    });
  }
}

export const mealAPI = new MealAPI();

export const getInitialMeals = () => mealAPI.getInitialMeals();
export const searchMeals = (query) => mealAPI.searchMeals(query);
export const getMealDetails = (id) => mealAPI.getMealDetails(id);
export const getNutritionAnalysis = (name, ingredients) =>
  mealAPI.getNutritionAnalysis(name, ingredients);

export async function searchProductsByName(name) {
  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/products/search?s=${name}`,
    );
    const data = await response.json();

    return data.products || data.meals || [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function lookupProductByBarcode(barcode) {
  try {
    const response = await fetch(
      `https://nutriplan-api.vercel.app/api/products/barcode/${barcode}`,
    );
    const data = await response.json();

    if (data.product) return [data.product];
    return data.products || data.meals || (data.strMeal ? [data] : []);
  } catch (error) {
    console.error("Error barcode lookup:", error);
    return [];
  }
}
