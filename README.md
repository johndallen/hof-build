# hof-build
Performs build workflow for hof apps in prod and development

## Usage

Run a build by running `hof-build` from the command line in your project directory.

```
hof build [task]
```

If no task is specified then all tasks will run.

It is recommended to alias `hof-build` to an npm script in your package.json.

## Tasks

* `browserify` - compiles client-side js with browserify
* `sass` - compiles sass
* `images` - copies images from ./assets/images directory to ./public/images
* `translate` - compiles translation files

## Watch

You can additionally run a `watch` task to start a server instance, which will automatically restart based on changes to files. This will also re-perform the tasks above when relevant files change.

## Configuration

The default settings will match those for an app generated using [`hof-generator`](https://npmjs.com/hof-generator). To override any of the configuration settings you can define a path to a local config file, which will be merged with [the default configuration](./config/defaults.js)

```
hof-build --config /path/to/my/config.js
```

Any task can be disabled by setting its configuration to `false` (or any falsy value).

```js
module.exports = {
  browserify: false
};
```

### Configuration options

Each task has a common configuration format with the following options:

* `src` - defines the input file or files for the build task
* `out` - defines the output location of the built code where relevant
* `match` - defines the pattern for files to watch to trigger a rebuilt of this task
* `restart` - defines if this task should result in a server restart

Additionally the server instance created by `watch` can be configured by setting `server` config. Available options are:

* `cmd` - defines the command used to start the server
* `extensions` - defines the file extensions which will be watched to trigger a restart
