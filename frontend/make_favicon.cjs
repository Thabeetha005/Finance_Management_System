const Jimp = require('jimp');

async function createFavicon() {
  try {
    const image = await Jimp.read('public/kalpanaa-logo-new.png');
    image.resize(64, 64, Jimp.RESIZE_BICUBIC);
    
    // Create a new black image (0x000000FF = black solid)
    const bg = new Jimp(64, 64, 0x000000FF);
    
    // Composite the resized logo on top
    bg.composite(image, 0, 0);
    
    await bg.writeAsync('public/favicon.png');
    console.log('Favicon created successfully.');
  } catch (err) {
    console.error('Error creating favicon:', err);
  }
}

createFavicon();
