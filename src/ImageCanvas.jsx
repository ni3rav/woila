/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useRef, useEffect } from "react";

const createWorker = () => {
  const workerCode = () => {
    const rgbToXyz = (r, g, b) => {
      r = r / 255;
      g = g / 255;
      b = b / 255;

      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

      r *= 100;
      g *= 100;
      b *= 100;

      const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
      const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
      const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

      return [x, y, z];
    };

    const xyzToLab = (x, y, z) => {
      x = x / 95.047;
      y = y / 100;
      z = z / 108.883;

      x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

      const l = 116 * y - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);

      return [l, a, b];
    };

    const rgbToLab = (r, g, b) => {
      const [x, y, z] = rgbToXyz(r, g, b);
      return xyzToLab(x, y, z);
    };

    const deltaE = (lab1, lab2) => {
      const deltaL = lab1[0] - lab2[0];
      const deltaA = lab1[1] - lab2[1];
      const deltaB = lab1[2] - lab2[2];

      return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    };

    self.onmessage = (e) => {
      const { pixels, theme, width, height } = e.data;
      const newPixels = new Uint8ClampedArray(pixels);

      const themeColors = [];
      const themeLab = [];
      for (let i = 0; i < theme.length; i += 3) {
        const rgb = {
          r: theme[i],
          g: theme[i + 1],
          b: theme[i + 2],
        };
        themeColors.push(rgb);
        themeLab.push(rgbToLab(rgb.r, rgb.g, rgb.b));
      }

      for (let i = 0; i < newPixels.length; i += 4) {
        const r = newPixels[i];
        const g = newPixels[i + 1];
        const b = newPixels[i + 2];

        const pixelLab = rgbToLab(r, g, b);

        let minDist = Infinity;
        let bestColor = themeColors[0];

        for (let j = 0; j < themeColors.length; j++) {
          const dist = deltaE(pixelLab, themeLab[j]);
          if (dist < minDist) {
            minDist = dist;
            bestColor = themeColors[j];
          }
        }

        const luminanceRatio = 0.3; 
        newPixels[i] = Math.round(
          bestColor.r * (1 - luminanceRatio) + r * luminanceRatio
        );
        newPixels[i + 1] = Math.round(
          bestColor.g * (1 - luminanceRatio) + g * luminanceRatio
        );
        newPixels[i + 2] = Math.round(
          bestColor.b * (1 - luminanceRatio) + b * luminanceRatio
        );
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
          link.download = "woila-converted-.png";
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
