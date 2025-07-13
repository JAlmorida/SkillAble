// ModernCheckbox.jsx
import React from "react";

export default function ModernCheckbox({ checked, onChange, label, ...props }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer appearance-none w-5 h-5 border-2 border-primary rounded-sm bg-transparent checked:bg-primary checked:border-primary transition-colors duration-200 outline-none focus:ring-2 focus:ring-primary/30 dark:checked:bg-primary dark:checked:border-primary"
        {...props}
      />
      <span className="absolute w-5 h-5 pointer-events-none">
        <svg
          className="w-5 h-5 text-primary opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M4 14l8 7L24 7"
            style={{
              strokeDasharray: 30,
              strokeDashoffset: checked ? 0 : 31,
              transition: "stroke-dashoffset 0.4s cubic-bezier(.11,.29,.18,.98)",
            }}
          />
        </svg>
      </span>
      <span className="ml-7 text-base text-gray-800 dark:text-gray-100">{label}</span>
    </label>
  );
}
