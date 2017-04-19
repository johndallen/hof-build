'use strict';

const path = require('path');
const merge = require('lodash.merge');
const config = require('./config/defaults');

module.exports = options => {

  const settings = {};

  merge(settings, config);

  // load settings from ./hof.settings.json if it exists
  let localConfig;
  let hofSettings;
  try {
    localConfig = path.resolve(process.cwd(), './hof.settings.json');
    hofSettings = require(localConfig).build;
    hofSettings.theme = require(localConfig).theme;
  } catch (e) {
    // ignore error for missing config file
  }

  if (hofSettings) {
    console.log(`Found local config at ${localConfig}`);
    merge(settings, hofSettings);
  }

  // load override config file if defined
  if (options.config) {
    merge(settings, require(path.resolve(process.cwd(), options.config)));
  }
  if (options.production || process.env.NODE_ENV === 'production') {
    settings.production = true;
  }

  if (options['watch-node-modules']) {
    settings.watchNodeModules = true;
  }
  if (options.verbose) {
    settings.verbose = true;
  }

  const task = options._[0] || 'build';

  try {
    require.resolve(`./tasks/${task}`);
  } catch (e) {
    throw new Error(`Unknown task: ${task}`);
  }

  return require(`./tasks/${task}`)(settings);

};
