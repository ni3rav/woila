# Woila

Woila is a web application that allows you to apply various popular color themes to your images. Upload an image, select a theme, and see your image transformed!

## How the Image Processing Works

The core image manipulation happens in a dedicated Web Worker to ensure the user interface remains responsive.

1.  **Image Upload & Preparation**:

    - When a user uploads an image, it is drawn onto an HTML5 Canvas.
    - The original pixel data of this image is stored. This allows the application to revert to the original image if the user changes themes, ensuring that each theme is applied to a fresh copy of the original.

2.  **Theme Application via Web Worker**:

    - When a theme is selected, the original image's pixel data and the chosen theme's color palette (an array of hex color codes) are sent to the Web Worker.

3.  **Color Conversion Algorithm (Inside the Web Worker)**:

    - **Theme Color Preparation**: The worker first parses the theme's hex color codes into RGB (Red, Green, Blue) values. These RGB values are then converted into the CIELAB color space. CIELAB is chosen because it's designed to be perceptually uniform, meaning that the numerical difference between two CIELAB colors more closely matches how humans perceive their visual difference.
    - **Pixel-by-Pixel Processing**: The worker iterates through each pixel of the uploaded image.
      - **Current Pixel Color**: The RGB color of the current pixel is read and also converted to the CIELAB color space.
      - **Finding the Closest Theme Color**: To find the most suitable color from the selected theme for the current pixel, the algorithm calculates the perceptual difference between the pixel's CIELAB color and each color in the theme's CIELAB palette. This difference is calculated using the Delta E 76 formula, which is essentially the Euclidean distance between two colors in the CIELAB space.
      - The theme color that results in the smallest Delta E value (i.e., the perceptually closest color) is selected as the `bestColor` for that pixel.
      - **Luminance Preservation**: To retain some of the original image's shading and detail, the final color applied to the pixel is not just the `bestColor` directly. Instead, it's a blend of the `bestColor` and the original pixel's color. A `luminanceRatio` controls this blend. For example, if `r_orig`, `g_orig`, `b_orig` are the original pixel's RGB values and `r_best`, `g_best`, `b_best` are the `bestColor`'s RGB values, the new color might be calculated as:
        ```javascript
        new_r = Math.round(
          r_best * (1 - luminanceRatio) + r_orig * luminanceRatio
        );
        // Similar for g and b
        ```
      - **Floyd-Steinberg Dithering**: To minimize color banding (visible steps between colors where a smooth gradient should be) and create the illusion of a richer color palette, Floyd-Steinberg dithering is applied.
        - The quantization error (the difference between the pixel's color after luminance preservation and the `bestColor` actually chosen) is calculated.
        - This error is then distributed to adjacent pixels that have not yet been processed. The error is spread according to the Floyd-Steinberg matrix:
          ```
                X   7/16  (current pixel's error distributed to the pixel to its right)
          3/16 5/16 1/16  (errors distributed to pixels in the next row)
          ```
        - An `errorBuffer` accumulates these distributed errors. When processing subsequent pixels, this accumulated error is added to the pixel's color before it's compared with the theme palette.

4.  **Displaying the Themed Image**:
    - Once the Web Worker has processed all pixels, it sends the modified pixel data back to the main application.
    - This new pixel data is then used to update the image displayed on the canvas, showing the image with the selected theme applied.

## Limitations

- The effectiveness of the color theming can vary depending on the complexity and color range of the original image.
- Very detailed images or images with subtle gradients might not always produce ideal results with a limited theme palette, though dithering helps significantly.

> [!NOTE]
> The previous algorithm used a simple 3D Euclidean distance in RGB space. The current algorithm using CIELAB and Delta E provides much more perceptually accurate color matching, and Floyd-Steinberg dithering further improves the visual quality by reducing banding and creating smoother transitions.
