import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetCategoriesQuery } from "@/features/api/categoryApi";

const Filter = ({ handleFilterChange }) => {
  const { data, isLoading } = useGetCategoriesQuery();
  const categories = data?.categories || [];
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByLevel, setSortByLevel] = useState("");

  const updateFilter = (categories, level) => {
    setSelectedCategories(categories);
    setSortByLevel(level);
    handleFilterChange(categories, level);
  };

  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    updateFilter(newCategories, sortByLevel);
  };

  const selectByLevelHandler = (selectedValue) => {
    updateFilter(selectedCategories, selectedValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-semibold text-lg md:text-xl text-gray-900 dark:text-white">Filter Options</h1>
        <Select onValueChange={selectByLevelHandler} value={sortByLevel}>
          <SelectTrigger className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-zinc-900">
            <SelectGroup>
              <SelectLabel>Sort by Level</SelectLabel>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold text-gray-900 dark:text-white mb-2">CATEGORIES</h1>
        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="flex items-center space-x-2 my-2">
              <input
                type="checkbox"
                id={category._id}
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
                className="accent-blue-600 w-4 h-4 rounded border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-400"
              />
              <label htmlFor={category._id} className="text-gray-800 dark:text-gray-200 cursor-pointer">
                {category.name}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Filter;
