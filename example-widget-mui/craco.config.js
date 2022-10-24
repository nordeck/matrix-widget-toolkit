module.exports = {
  plugins: [{ plugin: importLocalPackages() }],
};

/**
 * Craco plugin for using local packages from the same mono repository.
 */
function importLocalPackages() {
  const path = require('path');
  const { getLoader, loaderByName } = require('@craco/craco');
  const absolutePath = path.join(__dirname, '../packages');

  function overrideWebpackConfig({ webpackConfig, context }) {
    const { isFound, match } = getLoader(
      webpackConfig,
      loaderByName('babel-loader')
    );
    if (isFound) {
      const include = Array.isArray(match.loader.include)
        ? match.loader.include
        : [match.loader.include];

      match.loader.include = include.concat(absolutePath);
    }
    return webpackConfig;
  }

  return {
    overrideWebpackConfig,
  };
}
