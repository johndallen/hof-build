'use strict';

const fs = require('fs');
const path = require('path');
const sass = require('npm-sass');

const mkdir = require('../../lib/mkdir');

module.exports = config => {

  const out = path.resolve(process.cwd(), config.sass.out);

  return mkdir(out)
    .then(() => {
      return new Promise((resolve, reject) => {
        sass(config.sass.src, (err, result) => {
          return err ? reject(err) : resolve(result.css);
        });
      });
    })
    .then(css => {
      return new Promise((resolve, reject) => {
        fs.writeFile(out, css, err => {
          return err ? reject(err) : resolve();
        });
      });
    });

};
module.exports.task = 'compile sass';
