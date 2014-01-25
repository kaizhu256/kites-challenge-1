module.exports = function (grunt) {
    'use strict';
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
                    port: 9999
                }
            }
        },
        'saucelabs-qunit': {
            all: {
                options: {
                    urls: ["http://127.0.0.1:9999/test-qunit/index.html"],
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
