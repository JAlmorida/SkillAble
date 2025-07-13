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
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useGetCategoriesQuery } from "@/features/api/categoryApi"; // <-- Use RTK Query

const Filter = ({ handleFilterChange }) => {
  const { data, isLoading } = useGetCategoriesQuery();
  const categories = data?.categories || [];
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByLevel, setSortByLevel] = useState("");

  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    handleFilterChange(newCategories);
  };

  const selectByLevelHandler = (selectedValue) => {
    setSortByLevel(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  };

  return (
    <div className="w-full md:w-[20%]">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">Filter Options</h1>
        <Select onValueChange={selectByLevelHandler}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by " />
          </SelectTrigger>
          <SelectContent>
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
        <h1 className="font-semibold">CATEGORIES</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="flex items-center space-x-2 my-2">
            <input
              type="checkbox"
                id={category._id}
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
            />
              <label htmlFor={category._id}>{category.name}</label>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Filter;
