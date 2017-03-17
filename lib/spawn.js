'use strict';

const cp = require('child_process');

module.exports = (cmd, args) => {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(cmd, args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });
    child.on('error', reject);
    child.on('exit', code => {
      return code === 0 ? resolve() : reject(new Error(`${cmd} exited with a non-zero code: ${code}`));
    });
  });
};
