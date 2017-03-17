'use strict';

const browserify = require('browserify');
const fs = require('fs');
const path = require('path');

const mkdir = require('../../lib/mkdir');

module.exports = config => {
  const out = path.resolve(process.cwd(), config.browserify.out);

  return mkdir(out)
    .then(() => {
      return new Promise((resolve, reject) => {
        const bundler = browserify(config.browserify.src);
        const stream = bundler.bundle().pipe(fs.createWriteStream(out));
        stream.on('finish', resolve).on('error', reject);
      });
    });

};
module.exports.task = 'browserify';
