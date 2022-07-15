const fs = require('fs');

const PATHS = {
  mjs: './mjs',
  cjs: './cjs',
};

class PackageJsonPreparer {
  prepare(input, output) {
    const packageJson = JSON.parse(fs.readFileSync(input, 'utf8'));

    delete packageJson['scripts'];
    delete packageJson['devDependencies'];

    packageJson.main = PATHS.cjs + '/index.js';
    packageJson.module = PATHS.mjs + '/index.js';
    packageJson.exports = {
      '.': {
        import: `${PATHS.mjs}/index.js`,
        require: `${PATHS.cjs}/index.js`,
      },
    };

    this.writeFile(output, packageJson);
    this.writeFile('./dist/' + PATHS.mjs + '/package.json', { type: 'module' });
    this.writeFile('./dist/' + PATHS.cjs + '/package.json', {
      type: 'commonjs',
    });
  }

  writeFile(path, obj) {
    fs.writeFileSync(path, JSON.stringify(obj, null, 2), {
      encoding: 'utf8',
    });
  }
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  throw new Error('Input and Output path need to be passed as arguments');
}

const preparePackageJson = new PackageJsonPreparer();
preparePackageJson.prepare(inputPath, outputPath);
