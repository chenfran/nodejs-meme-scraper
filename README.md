# Node.js Meme Scraper

Create a cli (Command Line Interface) application that scrapes the **current version** of this website:

https://memegen-link-examples-upleveled.netlify.app/

...and saves the first 10 images into a folder called "memes" within the directory of the new project. The image files should be named with a number with a leading zero, eg. `01.jpg`, `02.jpg`, etc.

Avoid using an "image scraper" or "image downloader" library that does multiple steps at once for you (eg. do not use [`image-downloader`](https://www.npmjs.com/package/image-downloader) or [`nodejs-file-downloader`](https://www.npmjs.com/package/nodejs-file-downloader) or similar) - break the task down into smaller steps and select libraries as necessary for each step.

Make sure that the meme images are "ignored" in Git - they should not show up in your repository.

The program should be able to run multiple times without throwing an error.

When you believe you are done, set up a test:

1. Create a directory called `.github` (there is a dot at the start)
2. Create a directory called `workflows` inside `.github`
3. Create a file called `test.yml` inside `workflows` containing the following code

```yaml
name: Test Project
on: push

jobs:
  test:
    name: Test Project
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 'latest'
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'pnpm'
      - name: Install project dependencies
        run: pnpm install
      - name: Create test file
        # Create a test file that will run index.js from the project
        # with Node.js and check whether
        # - No ./memes directory exists before the program runs
        # - The ./memes directory exists after the program runs
        # - The first 10 images have been downloaded to ./memes
        # - The 10 images have matching SHA-256 hashes
        # - The program can run multiple times without errors
        run: |
          cat > test.js <<'END_SCRIPT'
            import { exec } from 'node:child_process';
            import { hash } from 'node:crypto';
            import { existsSync } from 'node:fs';
            import { readdir, readFile } from 'node:fs/promises';
            import { promisify } from 'node:util';

            const execAsync = promisify(exec);

            if (existsSync('./memes')) {
              console.log(
                '❌ `node index.js` pre-run 1: The directory `memes` already exists',
              );
              process.exit(1);
            }

            await execAsync('node index.js');

            const expectedFileHashes = {
              '01.jpg': '0246df78222f92f3ee34ee5ec31a6cd0e8ba57030ae16a2a2c3d662da3effaae',
              '02.jpg': '425002ba4bfc3cf2ef3ce92659f19e6f861122e33f517c9358219ed8f57f2fe1',
              '03.jpg': '62b317ec165535344162f15a6ff7b0662806dc09eef3b5d3e7021b611da32520',
              '04.jpg': '7e10ec46d0fefb76fe222bb878601da8c52245580e711151cb8ddbc1e992aa3b',
              '05.jpg': 'b1d802552e8a3909fe1d62f66350faf82c36eac9d088d50026116d933ab2f013',
              '06.jpg': 'c5041eebf997d249df6d7e5c4b2c18600bbe4cae68e2ca09415f624c53228407',
              '07.jpg': 'ad80e673866382e4b260c45d5924467e6a31971dc3ffb4a21a3d64e7825cb7cd',
              '08.jpg': '47dd2de3c1633e624c582010fd4ee9cca60a7e612835b4d89f98ca199da397d5',
              '09.jpg': '22eb3f1e7d34cf02941b1465f1503408909d438de66ea7db7f6eedfb6721419d',
              '10.jpg': '1bdd6a22b1aab4a31f0a5029fcdbfce28973707c57708f151593897485a3a67e',
            };

            // Read all files in directory and print the SHA-256 hash of each file
            const files = await readdir('./memes');

            const filesAsString = files.join(',');
            const expectedFilesAsString = Object.keys(expectedFileHashes).join(',');

            if (filesAsString !== expectedFilesAsString) {
              console.log(
                `❌ \`node index.js\` run 1: Files in directory \`memes\` (${filesAsString}) do not match expected files (${expectedFilesAsString})`,
              );
              process.exit(1);
            }

            console.log('✔️ `node index.js` run 1: All expected files exist');

            let anyFileHashesFailedMatch;

            for (const file of files) {
              const fileHash = hash('sha256', await readFile(`./memes/${file}`));

              if (fileHash !== expectedFileHashes[file]) {
                console.log(
                  `❌ \`node index.js\` run 1: Hash for \`memes/${file}\` ${fileHash} does not match expected hash ${expectedFileHashes[file]}`,
                );
                anyFileHashesFailedMatch = true;
              }
            }

            if (anyFileHashesFailedMatch) {
              process.exit(1);
            }

            console.log('✔️ `node index.js` run 1: All files match expected hashes');

            try {
              await execAsync('node index.js');
            } catch (error) {
              console.log(
                `❌ \`node index.js\` run 2: Error thrown during second run ("${error.message}")`,
              );
              process.exit(0);
            }

            console.log('✔️ `node index.js` run 2: No error thrown during second run');

            console.log('✔️ All tests passed!');
          END_SCRIPT
      - name: Run test file
        run: node test.js
```

## TODOs from Karl Lecture

- [x] Create the repo on GitHub
- [x] Create a directory called "memes" in the root
- [x] Add memes directory to the .gitignore file
- [x] Connect to memegen-link-examples-upleveled.netlify.app
  - [x] Fetch the HTML
- [x] Extract the <img> elements from the HTML
  - [x] Extract the src strings from the <img> (the image URLs as array of strings)
  - [x] Limit extracted image URLs to the first 10 (maybe with a loop)
- [x] Download the images (maybe in a loop?)
  - [x] Connect to each image URL
  - [x] Fetch the image data for each image URL
  - [x] Create a new file in the "memes" directory for each image URL
    - [x] Name the new files according to the pattern
  - [x] Store the image data for each image URL in the new files in the "memes" folder
- [x] Make sure to avoid libraries that are not allowed
- [x] Run the program multiple times to make sure it runs without throwing an error

### Brainstorming TODOs from me

- [x] Give nodejs the information to connect to the website
  - [x] Figure out the URL of the website
  - [x] Figure out how nodejs can connect to the website
- [x] Give nodejs the information to download the first images of the website
  - [x] Figure out how nodejs can download images from a website
  - [x] Figure out how to tell nodejs it should only download the first 10 images (maybe in a loop?)
- [x] Give nodejs the information where and how to save the images
  - [x] Figure out how nodejs can save an image
    - [x] Figure out how nodejs can create a file and save the image to the file
    - [x] Figure out what data type an image is
  - [x] Give nodejs the information to save the image in the directory called "memes"
  - [x] Give nodejs the information to save the image in a file called "01.jpg", "02.jpg", etc.
    - [x] Figure out the pattern for the image label

Stretch goals:

- [ ] Make the application create your own custom meme (eg. `node index.js hello karl bender` would download an image with the top text of "hello", the bottom text of "karl", with the meme image of Bender)
- [ ] Add a nice progress indicator (either messages or a progress bar)

## Acceptance Criteria

- [x] Preflight runs through without errors in your project
  - [x] Link in your GitHub repo's About section: Replit demo
- [ ] [Drone bot](https://learn.upleveled.io/pern-extensive-immersive/modules/cheatsheet-tasks/#upleveled-drone) has been tagged and responded with a passing message
- [x] Correct GitHub commit message format (see [Writing Commit Messages](https://learn.upleveled.io/pern-extensive-immersive/modules/cheatsheet-git-github/#writing-commit-messages))
