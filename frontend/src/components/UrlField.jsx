// components/UrlField.jsx
import React from "react";

const UrlField = ({ index, heading, link, onChange }) => {
  return (
    <div className="flex gap-2 mb-2">
      <input
        type="text"
        placeholder="Heading (e.g. Apply Here)"
        value={heading}
        onChange={(e) => onChange(index, "heading", e.target.value)}
        className="w-1/3 border rounded-lg p-2"
      />
      <input
        type="url"
        placeholder="https://example.com"
        value={link}
        onChange={(e) => onChange(index, "link", e.target.value)}
        className="w-2/3 border rounded-lg p-2"
      />
    </div>
  );
};

export default UrlField;
