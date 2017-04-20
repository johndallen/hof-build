'use strict';

const build = require('../build');
const chokidar = require('chokidar');
const throttle = require('lodash.throttle');
const uniq = require('lodash.uniq');
const cp = require('child_process');
const match = require('minimatch');
const chalk = require('chalk');
const extname = require('path').extname;

const tasks = require('../');

const run = require('../../lib/run');

module.exports = config => {

  let toBuild = [];
  let server;

  const matchers = Object.keys(tasks).reduce((map, key) => {
    if (!config[key]) {
      return map;
    }
    const matcher = config[key].match || config[key].src;
    if (matcher) {
      map[key] = matcher;
    }
    return map;
  }, {});

  function triggersTask(path) {
    return Object.keys(matchers).filter(key => {
      return match(path, matchers[key]);
    });
  }

  function restart() {
    if (server) {
      server.kill();
      server.removeAllListeners();
      console.log(chalk.green('Restarting due to changes'));
    }
    const args = config.server.cmd.split(' ');
    const cmd = args.shift();
    server = cp.spawn(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'] });

    server.on('exit', code => {
      if (code) {
        console.log(chalk.red('Server exited with non-zero exit code. Awaiting code changes.'));
      }
    });
  }

  function detectRestart(jobs, files) {
    const restartingJobs = jobs.filter(job => config[job].restart !== false);
    const restartingFiles = files.filter(file => config.server.extensions.indexOf(extname(file)) > -1);
    return restartingJobs.length || restartingFiles.length;
  }

  function rebuild() {
    let jobs = [];
    toBuild.forEach(path => {
      if (config.verbose) {
        console.log(`${chalk.yellow('Changed')}: ${path}`);
      }
      jobs = jobs.concat(triggersTask(path));
    });
    jobs = uniq(jobs);

    if (toBuild.indexOf('hof.settings.json') > -1) {
      console.log(chalk.red('Build configuration modified. Manual restart required.'));
      server.kill();
      process.exit();
    }

    jobs.forEach(job => {
      console.log(`Executing build task: ${chalk.green(job)}`);
    });

    const shouldRestart = detectRestart(jobs, toBuild);
    toBuild = [];
    return run(jobs.map(task => tasks[task]), config)
      .then(() => {
        if (shouldRestart) {
          restart();
        }
      });
  }

  function stdin() {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', data => {
      data = (data + '').trim().toLowerCase();
      if (data === config.watch.restart) {
        restart();
      }
    });
  }

  function watch() {

    return new Promise(resolve => {

      const ignored = [].concat(config.watch.ignore);

      if (!config.watchNodeModules) {
        console.log('Ignoring node_modules directory. To watch node_modules run with --watch-node-modules flag');
        ignored.push('node_modules');
      }

      const watcher = chokidar.watch('.', { ignored });

      watcher.on('ready', () => {

        const watched = watcher.getWatched();
        console.log(`Watching ${Object.keys(watched).length} files for changes`);

        const throttledRebuild = throttle(rebuild, 1000);
        watcher.on('all', (event, file) => {
          toBuild.push(file);
          throttledRebuild();
        });
        stdin();
        resolve();
      });

    });
  }

  return build(config)
    .then(() => {
      return watch();
    })
    .then(() => {
      return restart();
    });

};
