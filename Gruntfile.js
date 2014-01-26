/*jslint indent: 2*/
module.exports = function (grunt) {
  'use strict';
  require('./kites_test');
  var browsers = [{
    browserName: "firefox",
    version: "19",
    platform: "XP"
  }, {
    browserName: "googlechrome",
    platform: "XP"
  }, {
    browserName: "googlechrome",
    platform: "linux"
  }, {
    browserName: "internet explorer",
    platform: "WIN8",
    version: "10"
  }];

  grunt.initConfig({
    connect: {
      server: {
        options: {
          base: "",
          middleware: function () {
            return [ global.required.utility2.middlewareApplication ];
          },
          port: 8171
        }
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ["http://127.0.0.1:8171/test.html#testOnce=1"],
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID,
          concurrency: 3,
          browsers: browsers,
          testname: "qunit tests",
          tags: ["master"]
        }
      }
    },
    watch: {}
  });

  // Loading dependencies
  Object.keys(grunt.file.readJSON("package.json").devDependencies).forEach(function (key) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) {
      grunt.loadNpmTasks(key);
    }
  });

  grunt.registerTask("dev", ["connect", "watch"]);
  grunt.registerTask("test", ["connect", "saucelabs-qunit"]);
};
