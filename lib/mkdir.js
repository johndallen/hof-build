'use strict';

const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (file) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(file);
    mkdirp(dir, err => {
      return err ? reject(err) : resolve();
    });
  });
};
