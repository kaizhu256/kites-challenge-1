/*jslint browser: true, indent: 2, maxerr: 8, node: true, nomen: true, regexp: true, todo: true, unparam: true*/
/*global global, required, state, utility2, $*/
(function moduleGruntNodejs() {
  /* this nodejs module runs grunt tasks */
  'use strict';
  console.log(process.argv);
  var local = {

    _name: 'Gruntfile.moduleGruntNodejs',

    _init: function () {
      global.state = JSON.parse(
        new Buffer(
          (/--state-override-base64=([^ ]*)/)
            .exec(process.argv.join(' ') + ' --state-override-base64=e30')[1],
          'base64'
        ).toString()
      );
      console.log([global.state]);
      module.exports = local._grunt;
    },

    _grunt: function (grunt) {
      var browsers = [{
        // browserName: 'ANDROID',
        // 'device-orientation': 'portrait',
        // platform: 'Linux',
        // version: '4.0'
      // }, {
        // browserName: 'ANDROID',
        // 'device-orientation': 'portrait',
        // 'device-type': 'tablet',
        // platform: 'Linux',
        // version: '4.0'
      // }, {
        browserName: 'CHROME',
        platform: 'Linux',
        version: '30'
      }, {
        browserName: 'FIREFOX',
        platform: 'Linux',
        version: '26'
      }, {
        browserName: 'OPERA',
        platform: 'Linux',
        version: '12'
      }, {
        browserName: 'CHROME',
        platform: 'OSX 10.9',
        version: '31'
      }, {
        browserName: 'FIREFOX',
        platform: 'OSX 10.9',
        version: '26'
      }, {
        browserName: 'SAFARI',
        platform: 'OSX 10.9',
        version: '7'
      }, {
        browserName: 'CHROME',
        platform: 'Windows 8.1',
        version: '31'
      }, {
        browserName: 'FIREFOX',
        platform: 'Windows 8.1',
        version: '26'
      }, {
        // browserName: 'INTERNET EXPLORER',
        // platform: 'Windows 8.1',
        // version: '11'
      // }, {
        browserName: 'CHROME',
        platform: 'Windows XP',
        version: '31'
      }, {
        browserName: 'FIREFOX',
        platform: 'Windows XP',
        version: '26'
      }, {
        browserName: 'OPERA',
        platform: 'Windows XP',
        version: '12'
      }];

      grunt.initConfig({
        'saucelabs-qunit': {
          all: {
            options: {
              urls: [state.localhost + '/test.html#testOnce=1'],
              tunnelTimeout: 5,
              build: process.env.TRAVIS_JOB_ID,
              concurrency: 3,
              browsers: browsers,
              testname: 'qunit tests',
              tags: ['master']
            }
          }
        }
      });

      /* Loading dependencies */
      Object.keys(grunt.file.readJSON('package.json').devDependencies).forEach(function (key) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
          grunt.loadNpmTasks(key);
        }
      });

      grunt.registerTask('test', ['saucelabs-qunit']);
    }

  };
  local._init();
}());
