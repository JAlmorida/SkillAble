import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import React, { useState } from "react";

const categories = [
  { id: "business & entrepreneurship", label: "Business & Entrepreneurship" },
  { id: "agriculture & farming", label: "Agriculture & Farming" },
  { id: "data science & analysis", label: "Data science & analysis" },
  {
    id: "communication & media studies",
    label: "Communication & Media Studies",
  },
  { id: "culinary arts & food science", label: "Culinary arts & Food Science" },
  {
    id: "cyber security & data protection",
    label: "Cyber Security & data protection",
  },
  {
    id: "digital marketing & social media",
    label: "Digital Marketing & social media",
  },
  {
    id: "electrical & electronic engineering",
    label: "Electrical & Electronic Engineering",
  },
];

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByLevel, setSortByLevel] = useState("");

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId];

        handleFilterChange(newCategories, sortByLevel);
        return newCategories;
    });
  };
  const selectByLevelHandler = (selectedValue) =>{
    setSortByLevel(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  }

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
              <SelectLabel >Sort by Level</SelectLabel>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold">CATEGORIES</h1>
        {categories.map((category) => (
          <div className="flex items-center space-x-2 my-2">
            <Checkbox
              id={category.id}
              onCheckedChange={() => handleCategoryChange(category.id)}
            />
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {category.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
