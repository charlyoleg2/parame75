Parame75
========


Presentation
------------

*Parame75* is the top-monorepo for the design-library *desi75*, which contains a collection of 3D shapes.

This monorepo contains the following *javascript* package:

1. desi75: a *parametrix* design library
2. desi75-cli: the cli of desi75
3. desi75-ui: the web-ui of desi75
4. desi75-uis: the web-server of desi75-ui

This repo is a typical designer-repository using [parametrix](https://charlyoleg2.github.io/parametrix/).
The design-library and its associated UI and CLI are published as *npm-packages*.
The UI is also available on the github-page.


Links
-----

- [desi75-ui](https://charlyoleg2.github.io/parame75/) : public instance of the UI
- [sources](https://github.com/charlyoleg2/parame75) : git-repository
- [pkg](https://www.npmjs.com/package/desi75) : desi75 as npm-package
- [pkg-cli](https://www.npmjs.com/package/desi75-cli) : desi75-cli as npm-package
- [pkg-uis](https://www.npmjs.com/package/desi75-uis) : desi75-uis as npm-package


Usage for Makers
----------------

Parametrize and generate your 3D-files with the online-app:

[https://charlyoleg2.github.io/parame75/](https://charlyoleg2.github.io/parame75/)

Or use the UI locally:

```bash
npx desi75-uis
```

Or use the command-line-interface (CLI):

```bash
npx desi75-cli
```

Getting started for Dev
-----------------------

```bash
git clone https://github.com/charlyoleg2/parame75
cd parame75
npm i
npm run ci
npm run preview
```

Other useful commands:
```bash
npm run clean
npm run ls-workspaces
npm -w desi75 run check
npm -w desi75 run build
npm -w desi75-ui run dev
```

Prerequisite
------------

- [node](https://nodejs.org) version 22.0.0 or higher
- [npm](https://docs.npmjs.com/cli/v11/commands/npm) version 11.0.0 or higher


Publish a new release
---------------------

```bash
npm run versions
git commit -am 'increment sub versions'
npm version patch
git push
git push origin v0.5.6
```
