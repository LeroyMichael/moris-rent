const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const artifactDir =
  'C:\\Users\\leroy\\.gemini\\antigravity\\brain\\c9b4742f-ba9a-401a-9b2d-93b261b0e285';

async function processImage(inputPath, outputPath) {
  console.log(`Processing ${inputPath}...`);
  try {
    const image = await Jimp.read(inputPath);

    // We will make white pixels AND gray shadow pixels fully transparent.

    image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];

        // If the pixel is white (background) or a light gray/shadow color
        // Shadows are usually grays with roughly equal R,G,B values.
        // Let's be aggressive: anything lighter than a medium-dark gray, that is relatively desaturated.

        const isBright = red > 230 && green > 230 && blue > 230;
        const isGray =
          Math.abs(red - green) < 15 &&
          Math.abs(green - blue) < 15 &&
          Math.abs(red - blue) < 15;
        const isLightGray = isGray && red > 180; // Only target light grays for shadows to avoid cutting dark products

        // We only want to remove backgrounds and the shadows attached to them.
        // Normally pure ML is better for this, but to do it locally fast we just strip bright and high-light-gray.

        if (isBright || isLightGray) {
          this.bitmap.data[idx + 3] = 0; // Alpha = 0 (transparent)
        }
      },
    );

    await image.write(outputPath);
    console.log(`Saved to ${outputPath}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

async function main() {
  const files = fs.readdirSync(artifactDir);
  // Process new V4 assets
  const pngs = files.filter(
    (f) =>
      f.startsWith('iso_') && f.endsWith('.png') && !f.includes('_transparent'),
  );

  for (const file of pngs) {
    const inputPath = path.join(artifactDir, file);
    const outputPath = inputPath.replace('.png', '_transparent.png');

    // Force overwrite to apply the new no-shadow rule
    await processImage(inputPath, outputPath);
  }
}

main().catch(console.error);
