import React from "react";

const ThemeSelector = ({ themes, onThemeChange }) => {
  const handleThemeChange = (themeName) => {
    onThemeChange(themes[themeName]);
  };

  return (
    <select
      onChange={(e) => handleThemeChange(e.target.value)}
      className="select select-ghost w-full max-w-xs"
    >
      <option disabled selected>
        Select a theme!!!!
      </option>

      {Object.keys(themes).map((themeName) => (
        <option key={themeName} value={themeName}>
          {themeName}
        </option>
      ))}
    </select>
  );
};

export default ThemeSelector;
