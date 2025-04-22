/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useRef, useEffect } from "react";

const createWorker = () => {
  const workerCode = () => {
    self.onmessage = (e) => {
      const { pixels, theme, width, height } = e.data;
      const newPixels = new Uint8ClampedArray(pixels);

      const themeColors = [];
      for (let i = 0; i < theme.length; i += 3) {
        themeColors.push({
          r: theme[i],
          g: theme[i + 1],
          b: theme[i + 2],
        });
      }

      const colorDistance = (r1, g1, b1, color) => {
        const dr = 0.3 * (r1 - color.r);
        const dg = 0.59 * (g1 - color.g);
        const db = 0.11 * (b1 - color.b);
        return dr * dr + dg * dg + db * db;
      };

      for (let i = 0; i < newPixels.length; i += 4) {
        let minDist = Infinity;
        let bestColor = themeColors[0];
        const r = newPixels[i];
        const g = newPixels[i + 1];
        const b = newPixels[i + 2];

        for (const color of themeColors) {
          const dist = colorDistance(r, g, b, color);
          if (dist < minDist) {
            minDist = dist;
            bestColor = color;
          }
        }

        newPixels[i] = bestColor.r;
        newPixels[i + 1] = bestColor.g;
        newPixels[i + 2] = bestColor.b;
      }

      self.postMessage({ newPixels, width, height }, [newPixels.buffer]);
    };
  };

  const code = workerCode.toString();
  const blob = new Blob([`(${code})()`], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};

const ImageCanvas = ({ image, theme, onImageChange, setIsLoading }) => {
  const canvasRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = createWorker();
    return () => workerRef.current.terminate();
  }, []);

  useEffect(() => {
    if (image && theme?.length >= 3) {
      convertImage();
    }
  }, [image, theme]);

  const handleImage = (file) => {
    if (!file?.type?.startsWith("image/")) return;

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
    if (!theme || theme.length < 3) return;

    setIsLoading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    workerRef.current.postMessage(
      {
        pixels: imageData.data.buffer,
        theme: [...theme],
        width: canvas.width,
        height: canvas.height,
      },
      [imageData.data.buffer]
    );

    workerRef.current.onmessage = (e) => {
      const { newPixels, width, height } = e.data;
      const newImageData = new ImageData(newPixels, width, height);
      ctx.putImageData(newImageData, 0, 0);
      setIsLoading(false);
    };
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
      className="flex flex-col items-center gap-4 w-full"
    >
      <input
        type="file"
        onChange={(e) => handleImage(e.target.files[0])}
        accept="image/*"
        className="file-input file-input-bordered file-input-accent w-full max-w-xs"
      />
      <canvas
        ref={canvasRef}
        className="border rounded-lg shadow-md max-w-full h-auto"
        style={{ maxHeight: "70vh" }}
      />
      <button
        onClick={() => {
          const link = document.createElement("a");
          link.download = "palette-image.png";
          link.href = canvasRef.current.toDataURL("image/png");
          link.click();
        }}
        className="btn btn-primary gap-2"
      >
        Download Image
      </button>
    </div>
  );
};

export default ImageCanvas;
