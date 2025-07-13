import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LOCAL_STORAGE_KEY = "customCategories";

export function getCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCustomCategory(category) {
  const categories = getCustomCategories();
  if (!categories.includes(category)) {
    const updated = [...categories, category];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
}
