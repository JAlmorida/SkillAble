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

// Letter grading system
export function getLetterGrade(percentage) {
  if (percentage >= 90) return 'S';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

// Get grade color for styling
export function getGradeColor(grade) {
  switch (grade) {
    case 'S':
      return 'text-purple-600 font-bold';
    case 'A':
      return 'text-green-600 font-bold';
    case 'B':
      return 'text-blue-600 font-bold';
    case 'C':
      return 'text-yellow-600 font-bold';
    case 'D':
      return 'text-orange-600 font-bold';
    case 'F':
      return 'text-red-600 font-bold';
    default:
      return 'text-gray-600';
  }
}
