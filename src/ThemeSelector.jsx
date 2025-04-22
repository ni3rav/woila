/* eslint-disable react/prop-types */

const ThemeSelector = ({ themes, onThemeChange }) => {
  return (
    <div className="form-control w-full max-w-xs">
      <select
        onChange={(e) => onThemeChange(themes[e.target.value])}
        className="select select-bordered select-primary"
        defaultValue=""
      >
        <option disabled value="">
          Select a theme
        </option>
        {Object.keys(themes).map((themeName) => (
          <option key={themeName} value={themeName}>
            {themeName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
