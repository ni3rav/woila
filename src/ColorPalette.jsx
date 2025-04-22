/* eslint-disable react/prop-types */

const ColorPalette = ({ theme }) => {
  if (!theme || theme.length % 3 !== 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4 bg-base-200 rounded-box">
      {Array.from({ length: theme.length / 3 }, (_, i) => {
        const [r, g, b] = theme.slice(i * 3, i * 3 + 3);
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
