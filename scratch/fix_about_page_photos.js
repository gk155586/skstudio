const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(process.cwd(), "public");

async function fixAboutPhotos() {
  const storySrc = path.join(publicDir, "img", "gallery", "baby-outdoor", "1", "SKO03266.JPG");
  const storyDest = path.join(publicDir, "images", "about-story-upright.jpg");

  const newbornSrc = path.join(publicDir, "img", "gallery", "baby-indoor", "IMG_2457.JPG.jpeg");
  const newbornDest = path.join(publicDir, "images", "about-newborn-stylist-upright.jpg");

  if (fs.existsSync(storySrc)) {
    const buf1 = fs.readFileSync(storySrc);
    // Rotate 90 degrees CW to make it upright landscape 1200x800
    const rot1 = await sharp(buf1).rotate(90).toBuffer();
    fs.writeFileSync(storyDest, rot1);
    console.log("Successfully created upright story image at /images/about-story-upright.jpg!");
  }

  if (fs.existsSync(newbornSrc)) {
    const buf2 = fs.readFileSync(newbornSrc);
    // Rotate 90 degrees CW to make it upright landscape 1200x857
    const rot2 = await sharp(buf2).rotate(90).toBuffer();
    fs.writeFileSync(newbornDest, rot2);
    console.log("Successfully created upright newborn stylist image at /images/about-newborn-stylist-upright.jpg!");
  }
}

fixAboutPhotos();
