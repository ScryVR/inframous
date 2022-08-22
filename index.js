#!/usr/bin/env node
var exec = require("child_process").exec;
var fs = require("fs");

initializeProjectStructure().then(() => {
  createBoilerplateFiles().then(yarnStuff().then(updatePackageJson));
});

function initializeProjectStructure() {
  return new Promise((resolve) => {
    /* Run commands to create project structure */
    console.log("⌛ Creating project folders...");
    // Create root level folders
    Promise.all(
      ["public", "src"].map((folder) => runCommand(`mkdir ./${folder}`))
    ).then(() => {
      runCommand("mkdir ./public/assets").then(() => {
        Promise.all([
          // Create child folders for public/assets
          ...["images", "scripts", "styles"].map((folder) =>
            runCommand(`mkdir ./public/assets/${folder}`)
          ),
          // Create child folders for src
          ...["scripts", "styles"].map((folder) =>
            runCommand(`mkdir ./src/${folder}`)
          ),
        ]).then(() => {
          resolve();
        });
      });
    });
  });
}

function createBoilerplateFiles() {
  return new Promise((resolve) => {
    runCommand(`touch src/scripts/main.ts; touch src/styles/main.scss`);
    runCommand(
      `cp ${__dirname}/boilerplate/webpack.config.js ./webpack.config.js`
    );
    runCommand(`cp ${__dirname}/boilerplate/.babelrc ./.babelrc`);
    runCommand(`cp ${__dirname}/boilerplate/tsconfig.json ./tsconfig.json`);
    runCommand(`cp ${__dirname}/boilerplate/index.html ./public/index.html`);
    runCommand(
      `cp ${__dirname}/boilerplate/postcss.config.js ./postcss.config.js`
    );
    resolve();
  });
}

function yarnStuff() {
  return new Promise((resolve) => {
    console.log("⌛ Initializing project with yarn...");
    runCommand("yarn init -y", { showOutput: false }).then(() => {
      runCommand(
        "yarn add -D @babel/core babel-loader @babel/preset-env cross-env css-loader cssnano file-loader live-server@1.2.1 mini-css-extract-plugin node-sass npm-run-all postcss-loader postcss-preset-env sass-loader webpack webpack-cli typescript ts-loader",
        { showOutput: false }
      ).then(resolve);
    });
  });
}

function updatePackageJson() {
  fs.readFile("package.json", "utf8", function readFileCallback(err, data) {
    var packageJson = JSON.parse(data);
    packageJson.scripts = {
      "dev:assets": "webpack --watch",
      "dev:start":
        "live-server --open=./public/ --host=localhost --watch=./public/",
      dev: "npm-run-all -p dev:*",
      build: "cross-env NODE_ENV=production webpack",
    };
    packageJson = JSON.stringify(packageJson, null, 2);
    fs.writeFile("package.json", packageJson, "utf8", () => {
      console.log("\n🥳 Done creating project! Try running 'yarn dev'");
    });
  });
}

/* Define helpers */

async function runCommand(command, { showOutput = true } = {}) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (showOutput) {
          console.log(error);
        }
        reject(error);
      }
      if (showOutput) {
        if (stdout) {
          console.log(stdout);
        }
      }
      resolve(stdout);
    });
  });
}
