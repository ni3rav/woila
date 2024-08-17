import React, { useState, useEffect } from "react";
import ImageCanvas from "./ImageCanvas";
import ColorPalette from "./ColorPalette";
import ThemeSelector from "./ThemeSelector";

const App = () => {
  const [theme, setTheme] = useState([]);
  const [image, setImage] = useState(null);
  const [listOfThemes, setListOfThemes] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("./assets/themes.json")
      .then((res) => res.json())
      .then((data) => {
        setListOfThemes(data);
        const defaultTheme = Object.values(data)[0];
        setTheme(defaultTheme);
      });
  }, []);

  const handleImageChange = (file) => {
    setImage(file);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="h-screen w-screen flex flex-col flex-wrap justify-center items-center gap-4">
      <div className="flex justify-center align-center w-full font-semibold md:text-9xl text-7xl">
        woila🎨
      </div>
      <ImageCanvas
        image={image}
        theme={theme}
        onImageChange={handleImageChange}
        setIsLoading={setIsLoading}
      />
      <ColorPalette theme={theme} />
      <ThemeSelector themes={listOfThemes} onThemeChange={handleThemeChange} />
      {isLoading && <div id="loading-screen">Loading...</div>}

      <div className="flex justify-center align-center w-4/5 mt-8 text-xl">
        made with 😻 by&nbsp;
        <a href="https://twitter.com/ni3rav" className="font-bold underline">
          ni3rav
        </a>
      </div>
      <div className="flex justify-center align-center w-4/5 text-xl -mt-4">
        checkout the&nbsp;
        <a
          href="https://github.com/ni3rav/woila"
          className="font-bold underline"
        >
          sauce
        </a>
        &nbsp;at github
      </div>
    </div>
  );
};

export default App;
