'use strict';

module.exports = options => {

  const merge = require('lodash.merge');

  const config = require('./config/defaults');

  if (options.config) {
    merge(config, require(options.config));
  }

  merge(config, {
    watchNodeModules: options['watch-node-modules']
  });

  const task = options._[0] || 'build';

  let runner;

  try {
    runner = require(`./tasks/${task}`);
  } catch (e) {
    throw new Error(`Unknown task: ${task}`);
  }

  return runner(config);

};
