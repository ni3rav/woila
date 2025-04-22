import { useState, useEffect } from "react";
import ImageCanvas from "./ImageCanvas";
import ColorPalette from "./ColorPalette";
import ThemeSelector from "./ThemeSelector";

const App = () => {
  const [theme, setTheme] = useState([]);
  const [image, setImage] = useState(null);
  const [listOfThemes, setListOfThemes] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/assets/themes.json")
      .then((res) => res.json())
      .then((data) => {
        setListOfThemes(data);
        const defaultTheme = Object.values(data)[0];
        setTheme(defaultTheme);
      });
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-4 py-8">
      <h1 className="w-full text-center font-semibold text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8">
        woila🎨
      </h1>

      <div className="w-full max-w-4xl flex flex-col items-center gap-6 flex-1">
        <ImageCanvas
          image={image}
          theme={theme}
          onImageChange={setImage}
          setIsLoading={setIsLoading}
        />
        <ColorPalette theme={theme} />
        <ThemeSelector themes={listOfThemes} onThemeChange={setTheme} />
      </div>

      <footer className="w-full max-w-4xl mt-8 text-center">
        <div className="text-base md:text-lg lg:text-xl">
          made with 😻 by{" "}
          <a href="https://twitter.com/ni3rav" className="font-bold underline">
            ni3rav
          </a>
        </div>
        <div className="text-base md:text-lg lg:text-xl">
          checkout the{" "}
          <a
            href="https://github.com/ni3rav/woila"
            className="font-bold underline"
          >
            sauce
          </a>{" "}
          at github
        </div>
      </footer>

      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-75 flex justify-center items-center text-2xl md:text-3xl">
          Loading...
        </div>
      )}
    </div>
  );
};

export default App;
