import React from "react";

const ColorPalette = ({ theme }) => {
  const getSquareSize = () => {
    const width = Math.max(window.screen.width, window.innerWidth);
    return width < 500 ? "0.5em" : "1em";
  };

  return (
    <div id="palette">
      {theme.map((color, index) => {
        if (index % 3 === 0) {
          return (
            <div
              key={index}
              style={{
                display: "inline-block",
                height: getSquareSize(),
                width: getSquareSize(),
                border: "1px solid #aaa",
                backgroundColor: `rgb(${theme[index]},${theme[index + 1]},${
                  theme[index + 2]
                })`,
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default ColorPalette;
