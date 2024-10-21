/**
 * Publish all non-published packages to the NPM registry.
 *
 * !!! This script is intended to only be run by the github workflow! !!!
 */

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const packages = fs.readdirSync('packages');

for (var package of packages) {
  const packagePath = path.resolve('packages', package);

  if (!fs.lstatSync(packagePath).isDirectory()) {
    continue;
  }

  const { name, version } = JSON.parse(
    fs.readFileSync(path.resolve(packagePath, 'package.json')),
  );

  if (!versionNeedsUpload(name, version)) {
    console.log(`✅ Package ${name} already up-to-date`);
    continue;
  }

  console.log(`🔄 Publish package ${name}@${version}`);

  child_process.execSync(
    'npm publish --registry https://registry.npmjs.org --access public',
    {
      cwd: packagePath,
    },
  );

  console.log(`✅ Package ${name} published`);
}

// Create the git tags so the changesets CLI will create the proper GitHub releases
console.log(child_process.execSync('yarn changeset tag').toString());

console.log('Done!');

function versionNeedsUpload(name, version) {
  try {
    const result = child_process.execSync(
      `npm view "${name}@${version}" --registry https://registry.npmjs.org --json`,
    );

    // this line throws if not exists
    JSON.parse(result.toString());

    return false;
  } catch (_) {
    return true;
  }
}
