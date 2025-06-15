/* eslint-disable react/prop-types */

const ColorPalette = ({ theme }) => {
  if (!theme || theme.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4 bg-base-200 rounded-box">
      {theme.map((hexColor, i) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        return (
          <div
            key={i}
            className="w-12 h-12 rounded-lg shadow-md border border-base-300 transition-transform hover:scale-110 cursor-copy"
            style={{ backgroundColor: `rgb(${r},${g},${b})` }}
            onClick={() => navigator.clipboard.writeText(`${r},${g},${b}`)}
            title={`RGB: ${r}, ${g}, ${b}\nClick to copy`}
          />
        );
      })}
    </div>
  );
};

export default ColorPalette;
