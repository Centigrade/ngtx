import { build, BuildOptions } from 'esbuild';
import { $ } from 'execa';
import { copyFile, outputFile } from 'fs-extra';
import packageJson from '../package.json';

class Program {
  static readonly tsConfig = 'tsconfig.json';

  static async main() {
    await this.buildLibrary();

    this.createPackageJson();
    this.copyAdditionalFiles();
  }

  private static async buildLibrary() {
    const baseConfig: BuildOptions = {
      tsconfig: Program.tsConfig,
      bundle: true,
      minify: false,
      external: ['@angular/*', 'ng-mocks'],
    };

    console.log('Building esm version ...');
    await build({
      ...baseConfig,
      entryPoints: ['library/index.ts'],
      outfile: 'dist/bundle.esm.js',
      format: 'esm',
      platform: 'browser',
    });
    console.log('Building cjs version ...');
    await build({
      ...baseConfig,
      entryPoints: ['library/index.ts'],
      outfile: 'dist/bundle.cjs.js',
      format: 'cjs',
      platform: 'node',
    });

    // generate index.d.ts
    console.log('Generating types ...');
    await $`npx tsc -p ${Program.tsConfig} --declaration --emitDeclarationOnly`;
  }

  private static async createPackageJson() {
    const { name, author, version, license, description } = packageJson;

    const pkgJson = {
      // meta info
      name,
      version,
      author,
      description,
      license,
      private: false,
      // runtime info
      main: './bundle.cjs.js',
      module: './bundle.esm.js',
      types: './index.d.ts',
      exports: {
        '.': {
          types: './index.d.ts',
          import: './bundle.esm.js',
          require: './bundle.cjs.js',
        },
      },
    };

    console.log('Creating package.json ...');
    await outputFile('./dist/package.json', JSON.stringify(pkgJson, null, 2));
  }

  private static async copyAdditionalFiles() {
    console.log('Copying files ...');
    await copyFile('./README.md', './dist/README.md');
    await copyFile('./LICENSE', './dist/LICENSE');
  }
}

Program.main()
  .catch((err) => console.error('\n❗️ An error occurred:', err))
  .then(() => console.log('\n✅ Build succeeded.'));
