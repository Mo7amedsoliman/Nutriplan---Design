/**
 * @file appState.js
 * @description إدارة حالة التطبيق (State Management) وحفظ بيانات الـ Food Log في الـ LocalStorage.
 * @author Mohamed Mustafa
 * @version 1.0.0
 */

class AppState {
  constructor() {
    this.dailyGoals = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65,
    };

    // تحميل البيانات المحفوظة أو تعيين مصفوفة فارغة
    this.loggedItems = this.#loadFromStorage() || [];
  }

  /**
   * دالة خاصة لقراءة البيانات من الـ Local Storage
   * @private
   * @returns {Array} مصفوفة العناصر المحفوظة
   */
  #loadFromStorage() {
    try {
      const data = localStorage.getItem("nutriplan_food_log");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  /**
   * دالة خاصة لحفظ الحالة الحالية داخل الـ Local Storage
   * @private
   */
  #saveToStorage() {
    try {
      localStorage.setItem(
        "nutriplan_food_log",
        JSON.stringify(this.loggedItems),
      );
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }

  /**
   * إضافة وجبة أو منتج إلى سجل الطعام اليومي
   * @param {Object} item - الوجبة المراد إضافتها تحتوي على (name, calories, protein, carbs, fat)
   */
  addFoodItem(item) {
    const newItem = {
      id: Date.now().toString(), // معرف فريد
      name: item.name || "Unknown Food",
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fat) || 0,
      timestamp: new Date().toISOString(),
    };

    this.loggedItems.push(newItem);
    this.#saveToStorage();
    return newItem;
  }

  /**
   * حذف وجبة معينة من السجل بواسطة المعرف الفريد
   * @param {string} id - معرف الوجبة
   */
  deleteFoodItem(id) {
    this.loggedItems = this.loggedItems.filter((item) => item.id !== id);
    this.#saveToStorage();
  }

  clearLog() {
    this.loggedItems = [];
    this.#saveToStorage();
  }

  /**
   * حساب إجمالي العناصر الغذائية المستهلكة اليوم
   * @returns {Object} يحتوي على مجموع السعرات، البروتين، الكربوهيدرات، والدهون
   */
  getTodayTotals() {
    return this.loggedItems.reduce(
      (totals, item) => {
        totals.calories += item.calories;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }

  /**
   * الحصول على النسبة المئوية للمستهلك مقارنة بالهدف اليومي
   * @returns {Object} نسب مئوية لكل عنصر مغذي
   */
  getProgressPercentages() {
    const totals = this.getTodayTotals();
    return {
      calories: Math.min(
        (totals.calories / this.dailyGoals.calories) * 100,
        100,
      ),
      protein: Math.min((totals.protein / this.dailyGoals.protein) * 100, 100),
      carbs: Math.min((totals.carbs / this.dailyGoals.carbs) * 100, 100),
      fat: Math.min((totals.fat / this.dailyGoals.fat) * 100, 100),
    };
  }

  /**
   * الحصول على قائمة جميع الوجبات المسجلة
   * @returns {Array}
   */
  getLoggedItems() {
    return this.loggedItems;
  }
}

export const appState = new AppState();
