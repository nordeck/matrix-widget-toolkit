/**
 * This file is executed in the postpack step of "npm pack" / "npm publish".
 * It reverts the temporary changes to the package.json.
 */

const PACKAGE_PATH = 'package.json';
const PACKAGE_PATH_BACKUP = 'package.json-prepack';

import * as fs from 'fs';

fs.renameSync(PACKAGE_PATH_BACKUP, PACKAGE_PATH);
