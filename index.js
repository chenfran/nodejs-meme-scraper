// # IMPORTED MODULES AND LIBRARIES:
// fs and https are build-in modules for eg downloading images and save them into a specific directory
import fs from 'node:fs';
import client from 'node:https';
// library to get html text from a https URL
import fetch from 'node-fetch';

// # ACTUAL CODE:
// create folder called "memes"
const folderName = 'memes';

try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
} catch (err) {
  console.error(err);
}

// fetch plain text or HTML
const response = await fetch(
  'https://memegen-link-examples-upleveled.netlify.app/',
);
const body = await response.text();

// function: download image (url) and save it to a specific directory (filepath)
function downloadImage(url, filepath) {
  client.get(url, (res) => {
    res.pipe(fs.createWriteStream(filepath));
  });
}

// extract all image URLs from the html text but I used it without any variables only with .match - it is just very confusing so I will put this documentation here:
// code with extra variable:  const regEx = /(?<= src=").+?jpg/g;
// code with extra variable: const finalImage = [...body.match(regEx)];

// Loop to download first ten images and rename them
for (let a = 0; a < 10; a++) {
  const number = a + 1;
  const rename = `${number.toString().padStart(2, '0')}.jpg`; // padStart() helps to pad a number with leading zeros
  console.log(body.match(/(?<= src=").+?300/g)[a]);
  downloadImage(body.match(/(?<= src=").+?300/g)[a], `memes/${rename}`);
}
