# strichliste, WIP

Until now the `strichliste` only features an empty project that features a build system.
Included are:

* jquery
* angular
* angular-translate
* bootstrap
* browserify
* less

The buildsystem will concatenate script library files with compiled commonJS modules (browserify), compile less and concatenate it with library style files, copy images and static template resources.
The output folder is `./frontend` whereas development is done in `./frontendSource`.

## Installation

### clone repository
````bash
$ git clone git@github.com:hackerspace-bootstrap/strichliste.git
````

### install dependencies
````bash
$ npm install
````

### run tests
````bash
$ npm test
````

### create build
````bash
$ ./node_modules/.bin/gulp build
````

### development mode
When in development the following command will as well initiate the build process as well as creating a watch on the relevant folders.
The build process will then be run again when certain file has been changed.

````bash
$ ./node_modules/.bin/gulp dev
````

Bear in mind: The development process until now is somewhat fragile, if your source code contains syntax errors the broserify will fail which will in tun cause the dev watcher to fail.
This will be fixed in the near future.

## Run
The `strichliste` API also serves static files from the build directory (`./frontend`) if present e.g. the frontend has been built.