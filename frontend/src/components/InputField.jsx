// components/InputField.jsx
import React from "react";

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  const isTextArea = type === "textarea";

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
      </label>

      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows="5"
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition transform focus:scale-[1.02] shadow-md"
        ></textarea>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition transform focus:scale-[1.02] shadow-md"
        />
      )}
    </div>
  );
};

export default InputField;
