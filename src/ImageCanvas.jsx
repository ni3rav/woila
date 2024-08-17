import React, { useRef, useEffect } from "react";

const ImageCanvas = ({ image, theme, onImageChange, setIsLoading }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (image && theme.length > 0) {
      convertImage();
    }
  }, [image, theme]);

  const handleImage = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        onImageChange(file);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const convertImage = () => {
    setIsLoading(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        let minimum = 0;
        let lens = [];

        for (let j = 0; j < theme.length; j += 3) {
          lens.push(
            Math.sqrt(
              Math.pow(pixels[i] - theme[j], 2) +
                Math.pow(pixels[i + 1] - theme[j + 1], 2) +
                Math.pow(pixels[i + 2] - theme[j + 2], 2)
            )
          );
        }

        minimum = lens.indexOf(Math.min(...lens));

        for (let k = 0; k < 3; k++) {
          pixels[i + k] = theme[minimum * 3 + k];
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setIsLoading(false);
    }, 0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImage(e.dataTransfer.files[0]);
  };

  const handlePaste = (e) => {
    handleImage(e.clipboardData.files[0]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      className="flex flex-col flex-wrap justify-center items-center gap-2"
    >
      <input
        type="file"
        onChange={(e) => handleImage(e.target.files[0])}
        accept="image/*"
        className="file-input file-input-bordered file-input-accent w-full max-w-xs"
      />
      <canvas ref={canvasRef} className="md:max-w-[960px] md:max-h-[540px] max-w-[320px] max-h[270px]" />
      <button
        onClick={() => {
          const link = document.createElement("a");
          link.download = "wallpaper-theme-converter.png";
          link.href = canvasRef.current.toDataURL("image/png");
          link.click();
        }}
        className="btn btn-active btn-primary"
      >
        Download
      </button>
    </div>
  );
};

export default ImageCanvas;
