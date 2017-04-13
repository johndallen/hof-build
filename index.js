'use strict';

const path = require('path');
const merge = require('lodash.merge');
const config = require('./config/defaults');

module.exports = options => {

  const settings = {};

  merge(settings, config);

  // load settings from ./hof.settings.json if it exists
  let localConfig;
  try {
    localConfig = path.resolve(process.cwd(), './hof.settings.json');
  } catch (e) {
    // ignore error for missing config file
  }

  if (localConfig) {
    const hofSettings = require(localConfig).build;
    console.log(`Found local config at ${localConfig}`);
    merge(settings, hofSettings);
  }

  // load override config file if defined
  if (options.config) {
    merge(settings, require(path.resolve(process.cwd(), options.config)));
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
