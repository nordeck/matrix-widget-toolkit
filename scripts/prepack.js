/**
 * This file is executed in the prepack step of "npm pack" / "npm publish".
 * It creates a backup of the package.json (that will be used in `postpack.js`)
 * and moves all properties from the `publishConfig` object to the root level.
 *
 * This is needed because "module" and "types" must point to `src/index.ts` during
 * development, and to `lib/esm/src/*` in the published npm package.
 */

const PACKAGE_PATH = 'package.json';
const PACKAGE_PATH_BACKUP = 'package.json-prepack';

const fs = require('fs');

const packageContent = JSON.parse(fs.readFileSync(PACKAGE_PATH));

if (typeof packageContent.publishConfig === 'object') {
  for (var [key, value] of Object.entries(packageContent.publishConfig)) {
    if (key !== 'registry') {
      packageContent[key] = value;
    }
  }

  delete packageContent.publishConfig;

  fs.copyFileSync(PACKAGE_PATH, PACKAGE_PATH_BACKUP);
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageContent, null, 2));
}
