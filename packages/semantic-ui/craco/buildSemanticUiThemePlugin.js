/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const {
  getLoader,
  loaderByName,
  throwUnexpectedConfigError,
} = require('@craco/craco');
const cracoLess = require('@semantic-ui-react/craco-less');
const path = require('path');

/**
 * A webpack configuration to build Semantic UI themes.
 * This supports the selection of a dark and light theme, as well as the configuration of the primary color.
 *
 * Use it with: import('semantic-ui-less/semantic.less?theme=<dark|light>')
 */
function overrideWebpackConfig({ webpackConfig, context }) {
  const styleLoaderOptions = {
    attributes: {
      id: 'theme-css',
    },
  };

  // Apply the @semantic-ui-react/craco-less to configure a less loader that builds the semantic-ui theme
  cracoLess.overrideWebpackConfig({
    context,
    webpackConfig,
    pluginOptions: {
      styleLoaderOptions,
    },
  });

  // Get the less-loader that was added by @semantic-ui-react/craco-less
  const { isFound, match: lessLoaderMatch } = getLoader(
    webpackConfig,
    loaderByName('less-loader')
  );

  if (!isFound) {
    throwUnexpectedConfigError({
      packageName: 'testConfig',
      message: `Can't find "less-loader" in the ${context.env} webpack config!`,
    });
  }

  // Modify the loader so it prefixes the file with the two variables.
  lessLoaderMatch.loader.options.additionalData = (content, loaderContext) => {
    const { resourceQuery } = loaderContext;
    const themeMatch = /[?&]theme=([^?&]*)/.exec(resourceQuery);

    const theme = (themeMatch && themeMatch[1]) || 'default';

    console.log(`building custom theme: ${theme}`);
    return `
@themePackageRoot: '${path.join(__dirname, '..')}';
@custom_theme: ${theme};
@primary_color: ${process.env.REACT_APP_PRIMARY_COLOR || '#0dbd8b'};

${
  theme === 'default'
    ? `${content} `
    : `.${theme} {
  ${content}

  // Import stylesheets of external packages
  @import (optional, once) "@{themePackageRoot}/src/semantic-ui/@{custom_theme}/external.less";
}`
}
`;
  };

  // Find the theme.config relative to this file. It might be located in the node_modules folder
  webpackConfig.resolve.alias['../../theme.config$'] = path.join(
    __dirname,
    '../src/semantic-ui/theme.config'
  );

  return webpackConfig;
}

module.exports = { overrideWebpackConfig };
