# Building and Testing ngtx

This document describes how to set up your development environment to build and test ngtx.

- [Prerequisite Software](#prerequisite-software)
- [Getting the Sources](#getting-the-sources)
- [Installing NPM Modules](#installing-npm-modules)
- [Building](#building)
- [Running Tests Locally](#running-tests-locally)
- [Formatting your Source Code](#formatting-your-source-code)
- [Linting/verifying your Source Code](#lintingverifying-your-source-code)
- [Publishing Snapshot Builds](#publishing-snapshot-builds)
- [Bazel Support](#bazel-support)

See the [contribution guidelines](https://github.com/Centigrade/ngtx/blob/master/CONTRIBUTING.md)
if you'd like to contribute to ngtx.

## Prerequisite Software

Before you can build and test ngtx, you must install and configure the
following products on your development machine:

- [Git](https://git-scm.com/) -
  [GitHub's Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.

- [Node.js](https://nodejs.org), which is used to run a development web server,
  run tests, and generate distributable files.

## Getting the Sources

Fork and clone the ngtx repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](https://help.github.com/forking) the [main ngtx
   repository](https://github.com/Centigrade/ngtx).
3. Clone your fork of the ngtx repository and define an `upstream` remote pointing back to
   the ngtx repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/ngtx.git

# Go to the ngtx directory:
cd ngtx

# Add the main ngtx repository as an upstream remote to your repository:
git remote add upstream https://github.com/Centigrade/ngtx.git
```

## Installing NPM Modules

Next, install the JavaScript modules needed to build and test ngtx:

```shell
# Install ngtx project dependencies (package.json)
npm install
```

## Building

To build ngtx run:

```shell
npm run build
```

- Results are put in the `dist` folder.

## Running Tests Locally

To run tests for ngtx run:

```shell
npm run test
```

- Coverage information are put in the `coverage` folder.

## Formatting your source code

ngtx uses [prettier](https://prettier.io) to format the source code.
If the source code is not properly formatted, the CI will fail and the PR cannot be merged.

You can automatically format your code by running:

- `npm run format`: Automatically formats every file in project.

A better way is to set up your IDE to format the changed file on each file save.

### VS Code

1. Install [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for VS Code.
2. It will automatically pick up the settings from `.vscode/settings.json`.
   If you haven't already, create a `settings.json` file by following the instructions [here](../.vscode/README.md).

## Linting / Verifying your Source Code

You can check that your code is properly formatted and adheres to coding style by running:

```shell
$ npm run lint
```
