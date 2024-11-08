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

import * as fs from 'fs';
import * as path from 'path';
import * as dree from 'dree';

// Ensure the typescript types are in the build folder as cjs and esm variants
const walkOptions = {
  depth: 100
}
const tree = dree.scan('./lib/src', walkOptions);

function treeWalk(child) {
  if (!child.path.endsWith('.d.ts')) {
    return;
  }
  // Copy the types for cjs under the build/cjs folder
  const cjsPath = child.path.replace('lib/src', 'build/cjs');

  // If it is a directory, create the directory
  if (child.type === 'directory') {
    fs.mkdirSync(cjsPath, { recursive: true });
  } else {
    // Ensure target directory exists
    fs.mkdirSync(path.dirname(cjsPath), { recursive: true });
    fs.copyFileSync(child.path, cjsPath.replace('.d.ts', '.d.cts'));
  }

  // Copy the types for esm under the build/esm folder
  const esmPath = child.path.replace('lib/src', 'build/esm');

  // If it is a directory, create the directory
  if (child.type === 'directory') {
    fs.mkdirSync(esmPath, { recursive: true });
  } else {
    // Ensure target directory exists
    fs.mkdirSync(path.dirname(esmPath), { recursive: true });
    fs.copyFileSync(child.path, esmPath);
  }
}

// Copy the types to the build folder while preserving the folder structure.
// It also copies each .d.ts to a file with .d.cts extension to be used in the cjs build.
// Be aware that children is recursive. A child can have children.
function treeWalker(node) {
  treeWalk(node);
  if (node.children) {
    node.children.forEach(treeWalker);
  }
}

treeWalker(tree);

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
