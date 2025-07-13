import React from "react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 px-4 py-20 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Find the best courses for your growth
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Discover, learn, and upskill with our curated selection of courses.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;