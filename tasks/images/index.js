'use strict';

const spawn = require('../../lib/spawn');
const mkdir = require('../../lib/mkdir');

module.exports = config => {

  if (!config.images) {
    return Promise.resolve();
  }

  return mkdir(config.images.out)
    .then(() => {
      return spawn('cp', ['-r', config.images.src, config.images.out]);
    });

};
module.exports.task = 'copy images';
