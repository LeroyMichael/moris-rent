const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

async function processImage(inputPath, outputPath) {
  console.log(`Processing ${inputPath}...`);
  try {
    const image = await Jimp.read(inputPath);

    image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];

        const isBright = red > 230 && green > 230 && blue > 230;
        if (isBright) {
          this.bitmap.data[idx + 3] = 0; // Alpha = 0
        }
      },
    );

    await image.write(outputPath);
    console.log(`Saved to ${outputPath}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

const inputPath =
  'C:\\Users\\leroy\\.gemini\\antigravity\\brain\\c9b4742f-ba9a-401a-9b2d-93b261b0e285\\desk_long_empty_1772275639403.png';
const outputPath =
  'C:\\Users\\leroy\\Documents\\_PowerUp\\desent\\moris-rent\\public\\assets\\v4\\desk_long_empty.png';

processImage(inputPath, outputPath).catch(console.error);
