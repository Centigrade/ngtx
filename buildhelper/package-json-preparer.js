const fs = require('fs');

class PackageJsonPreparer {
    prepare(input, output) {
        const packageJson = JSON.parse(fs.readFileSync(input, 'utf8'));

        delete packageJson['scripts'];
        delete packageJson['devDependencies'];

        // Add empty devDependencies
        packageJson['devDependencies'] = {};

        fs.writeFileSync(output, JSON.stringify(packageJson, null, 4), {
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
