/*jslint browser: true, indent: 2, maxerr: 8, node: true, nomen: true, regexp: true, todo: true, unparam: true*/
/*global global, required, state, utility2, $*/
/*
#### todo

*/



(function moduleInitShared() {
  /* this shared module inits kites_test */
  'use strict';
  var local = {

    _name: 'kites_test.moduleInitShared',

    _init: function () {
      /* init nodejs */
      local._initNodejs();
      /* init module */
      utility2.initModule(module, local);
      /* init browser */
      local._initBrowser();
    },

    _initBrowser: function () {
      var QUnit;
      QUnit = global.QUnit;
      if (!(state.isBrowser && QUnit)) {
        return;
      }
      QUnit.asyncTest("test report", function () {
        utility2.deferCallback('untilTestReportReady', 'defer', function () {
          QUnit.ok(!state.testReport.failures);
          QUnit.start();
        });
      });

    },

    _initNodejs: function () {
      var override;
      if (!(global.process && process.versions && process.versions.node)) {
        return;
      }
      /* exports */
      if (typeof window === 'object') {
        window.global = window.global || window;
      }
      global.required = global.required || {};
      global.state = global.state || {};
      state.isProcessArgv = true;
      override = state.stateOverride = state.stateOverride || {};
      override.serverPort = override.serverPort || Number(process.env.PORT) || undefined;
      override.socks5SshHost = override.socks5SshHost || process.env.SOCKS5_SSH_HOST;
      /* require utility2 */
      required.utility2 = required.utility2 || require('utility2');
      /* print debug info */
      utility2.debugAppOnce();
      /* auto jslint / eval / etc ... for the following files if modified */
      [
        {action: ['lint'], name: 'package.json'}
      ].forEach(utility2.fsWatch);
    }

  };
  local._init();
}());



(function moduleTestShared() {
  /* this shared module runs tests on both nodejs and browser */
  'use strict';
  var local = {

    _name: 'kites_test.moduleTestShared',

    _init: function () {
      utility2.initModule(module, local);
      utility2.securityBasicAuthValidate = local.securityBasicAuthValidate;
    },

    securityBasicAuthValidate: function () {
      /* disable mandatory password to access server from external network */
      return true;
    },

    _extra_psrse_am_pm_correctly_test: function (onEventError) {
      console.log('running test - extra - parse am / pm correctly');
      utility2.assert(required.kites_hours.parse('7:00') === '');
      utility2.assert(required.kites_hours.parse('7:00 to 11:00') === '');
      utility2.assert(required.kites_hours.parse('Sunday: 7:00 am to 11:00 pm') === 'S0:0700-2300');
      onEventError();
    },

    _Parses_simple_sentences_correctly_test: function (onEventError) {
      console.log('running test - Parses simple sentences correctly');
      utility2.assert(required.kites_hours.parse('Sunday: 7:00 to 11:00') === 'S0:0700-1100');
      utility2.assert(required.kites_hours.parse('Sunday: 15:00 to 1:00') === 'S0:1500-2500');
      utility2.assert(required.kites_hours.parse('Sun: 07:00-00:00') === 'S0:0700-2400');
      onEventError();
    },

    _Parses_THROUGH_sentences_correctly_test: function (onEventError) {
      console.log('running test - Parses THROUGH sentences correctly');
      utility2.assert(required.kites_hours.parse('Mon-Sun: 12:30-01:00') === 'S0-6:1230-2500');
      utility2.assert(required.kites_hours.parse('Mon to Sun: 06:30 - 22:30') === 'S0-6:0630-2230');
      utility2.assert(required.kites_hours.parse('Fri to Tue: 06:30 - 22:30') === 'S5-2:0630-2230');
      utility2.assert(required.kites_hours.parse('Mon - Wed: 07:00-01:00') === 'S1-3:0700-2500');
      onEventError();
    },

    _Parses_AND_sentences_correctly_test: function (onEventError) {
      console.log('running test - Parses AND sentences correctly');
      utility2.assert(required.kites_hours.parse('Mon-Thu & Sun: 09:30-22:30') === 'S0-4:0930-2230');
      utility2.assert(required.kites_hours.parse('Fri-Sat & PH: 09:30-23:00') === 'S5-6:0930-2300');
      onEventError();
    },

    _Parses_sentences_with_multiple_times_correctly_test: function (onEventError) {
      console.log('running test - Parses sentences with multiple times correctly');
      utility2.assert(required.kites_hours.parse('Mon-Fri: 11:45-16:30; 17:45-23:30') === 'S1-5:1145-1630,1745-2330');
      utility2.assert(required.kites_hours.parse('Monday to Sunday: 12:00-15:00, 18:00-22:00') === 'S0-6:1200-1500,1800-2200');
      onEventError();
    },

    _Deals_with_strange_Unicode_characters_correctly_test: function (onEventError) {
      console.log('running test - Deals with strange Unicode characters correctly');
      utility2.assert(required.kites_hours.parse('Mon：18:00-00:00') === 'S1:1800-2400');
      utility2.assert(required.kites_hours.parse('Sat & Sun: 12:00-14:30；18:00-23:00') === 'S6-0:1200-1430,1800-2300');
      utility2.assert(required.kites_hours.parse('Mon to Fri: 6:30 – 20:30') === 'S1-5:0630-2030');
      onEventError();
    },

    _Tokenizes_multiline_hours_correctly_test: function (onEventError) {
      console.log('running test - Tokenizes multiline hours correctly');
      utility2.assert(required.kites_hours.parse('Mon.-Sat.: 11:30-22:30; Sun.: 10:30-22:30') === 'S0:1030-2230;1-6:1130-2230');
      utility2.assert(required.kites_hours.parse('Sun.-Thur. 11:00-23:00, Fri.-Sat. 11:00-00:00') === 'S0-4:1100-2300;5-6:1100-2400');
      onEventError();
    },

    _Parses_complex_sentences_correctly_test: function (onEventError) {
      console.log('running test - Parses complex sentences correctly');
      utility2.assert(required.kites_hours.parse('Mon-Sun\nBreakfast 07:00-11:00\nLunch 11:30-14:30\nTea 14:00-18:00\nSun-Thu Dinner 18:30-22:30\nFri & Sat Dinner 18:30-23:30') === 'S0-4:0700-1100,1130-1800,1830-2230;5-6:0700-1100,1130-1800,1830-2330');
      onEventError();
    },

    _Custom_tests_test: function (onEventError) {
      console.log('running test - Custom tests');
      utility2.assert(required.kites_hours.parse('Mon-Sun: 06:00-23:00\n(Tea: 06:00-16:00)') === 'S0-6:0600-2300');
      utility2.assert(required.kites_hours.parse('Mon-Sat: 11:00-21:00 until 300 quotas soldout') === 'S1-6:1100-2100');
      utility2.assert(required.kites_hours.parse('Monday to Sunday & Public Holiday:\n12:00-15:00, 18:00-00:00') === 'S0-6:1200-1500,1800-2400');
      utility2.assert(required.kites_hours.parse('Restaurant Mon-Sun: 06:30-23:00\nBar Mon-Sun: 15:00-00:00\nBe on Canton Mon-Sun: 12:00-00:00') === 'S0-6:0630-2400');
      utility2.assert(required.kites_hours.parse('Mon-Sat: 2300-2500,0600-0800') === 'S1-6:0600-0800,2300-2500');
      utility2.assert(required.kites_hours.parse('Mon-Sat: 0000-2300,2301-2800') === 'S1-6:0000-2300,2301-2800');
      utility2.assert(required.kites_hours.parse('Fri-Sat: 0000-2300, Mon: 0000-2300') === 'S1,5-6:0000-2300');
      utility2.assert(required.kites_hours.parse('Fri-Sat: 0000-2300, Mon: 0000-2301') === 'S1:0000-2301;5-6:0000-2300');
      onEventError();
    },

    _Chinese_test: function (onEventError) {
      console.log('running test - Chinese');
      utility2.assert(required.kites_hours.parse('Mon.-Sun.: 12:00-22:30') === 'S0-6:1200-2230');
      utility2.assert(required.kites_hours.parse('星期一至日: 12:00-22:30') === 'S0-6:1200-2230');
      utility2.assert(required.kites_hours.parse('Mon.-Sat.: 12:00-23:00') === 'S1-6:1200-2300');
      utility2.assert(required.kites_hours.parse('星期一至六: 12:00-23:00 ') === 'S1-6:1200-2300');
      utility2.assert(required.kites_hours.parse('Mon.-Sun.: 12:00-14:30, 19:00-22:30') === 'S0-6:1200-1430,1900-2230');
      utility2.assert(required.kites_hours.parse('星期一至日: 12:00-14:30, 19:00-22:30') === 'S0-6:1200-1430,1900-2230');
      utility2.assert(required.kites_hours.parse('Mon to Sat: 12:00 – 14:30; 18:30 – 23:00\nSun: 12:00 – 15:00; 18:30 – 23:00') === 'S0:1200-1500,1830-2300;1-6:1200-1430,1830-2300');
      utility2.assert(required.kites_hours.parse('星期一至六：12:00 – 14:30; 18:30 – 23:00\n星期日：12:00 – 15:00; 18:30 – 23:00') === 'S0:1200-1500,1830-2300;1-6:1200-1430,1830-2300');
      utility2.assert(required.kites_hours.parse('Mon.-Fri.: 12:00-14:30； 18:00-22:30\nSat.-Sun.&Public Holidays: 11:30-15:00; 18:00-22:30') === 'S6-0:1130-1500,1800-2230;1-5:1200-1430,1800-2230');
      utility2.assert(required.kites_hours.parse('星期一至五：12:00-14:30； 18:00-22:30\n星期六、日及公眾假期：11:30-15:00； 18:00-22:30') === 'S6-0:1130-1500,1800-2230;1-5:1200-1430,1800-2230');
      utility2.assert(required.kites_hours.parse('Mon.-Sat.: 11:30-14:30, 18:00-22:30; Sun.&Public Holidays: 11:00-14:30, 18:00-22:30') === 'S0:1100-1430,1800-2230;1-6:1130-1430,1800-2230');
      utility2.assert(required.kites_hours.parse('星期一至六: 11:30-14:30, 18:00-22:30; 星期日及公眾假期: 11:00-14:30, 18:00-22:30') === 'S0:1100-1430,1800-2230;1-6:1130-1430,1800-2230');
      utility2.assert(required.kites_hours.parse('Breakfast (Weekday): 07:00-10:00\nBreakfast (Sunday and Public Holiday): 07:00-10:30\nLunch: 12:00-14:30\nDinner: 18:00-22:00\nVerandah Café : 07:00-23:00 (cakes and sandwiches only available from 14:00-18:00 daily)') === 'S0:0700-2300;1-5:0700-1000');
      utility2.assert(required.kites_hours.parse('早餐(星期一至六): 07:00-10:00\n早餐(星期日及公眾假期): 07:00-10:30\n午餐: 12:00-14:30\n晚餐: 18:00-22:00\n露台咖啡廳: 07:00-23:00 (糕點及三文治於14:00-18:00供應)') === 'S0:0700-2300;1-6:0700-1000');
      utility2.assert(required.kites_hours.parse('星期一至星期日: 07:00-21:00') === 'S0-6:0700-2100');
      onEventError();
    }

  };
  local._init();
}());



(function moduleTestServerNodejs() {
  /* this nodejs module runs the test server */
  'use strict';
  var local = {

    _name: 'kites_test.moduleTestServerNodejs',

    _init: function () {
      if (!state.isNodejs) {
        return;
      }
      utility2.initModule(module, local);
    },

    _initOnce: function () {
      /* require kites */
      required.kites_hours = require('./kites_hours.js');
    },

    _initTest: function () {
      utility2.deferCallback('untilPhantomjsServerReady', 'defer', function (error) {
        if (!error) {
          utility2.testLocal(local);
        }
      });
    },

    'routerFileDict_/kites_hours.js': function (request, response) {
      /* this function serves the file kites_test.js */
      utility2.serverRespondDefault(response, 200, 'application/javascript; charset=utf-8',
        required.kites_hours._fileContentBrowser);
    },

    'routerFileDict_/kites_test.js': function (request, response) {
      /* this function serves the file kites_test.js */
      utility2.serverRespondDefault(response, 200, 'application/javascript; charset=utf-8',
        required.kites_test._fileContentBrowser);
    },

    'routerDict_/test.html': function (request, response) {
      /* this function serves the file test.html */
      utility2.serverRespondDefault(response, 200, 'text/html',
        utility2.templateFormat(local.fileKiteTestHtml,
          { globalOverride: JSON.stringify({ state: {
            localhost: state.localhost
          } }) }));
    },

    'routerFileDict_/': function (request, response, next) {
      /* this function serves files */
      utility2.serverRespondFile(response, process.cwd() + request.urlPathNormalized, next);
    },

    fileKiteTestHtml: '<!DOCTYPE html><html><head>'
      + '<link href="/external.qunit.min.css" rel="stylesheet"/>\n'
      + '</head><body>\n'
      + '<div id="qunit"></div>'
      + '<div id="qunit-fixture"></div>'
      + '<h1>kites-challenge-1 test page</h1>\n'
      + '<p>open the browser\'s javascript console to see test results</p>\n'
      + '<script>window.globalOverride = {{globalOverride}};</script>\n'
      + '<script src="/public/utility2-external/utility2-external.browser.lite.min.js"></script>\n'
      + '<script src="/external.qunit.min.js"></script>\n'
      + '<script src="/public/utility2.js"></script>\n'
      + '<script src="/kites_hours.js"></script>\n'
      + '<script src="/kites_test.js"></script>\n'
      + '</body></html>\n',

    _phantomjs_test: function (onEventError) {
      utility2.phantomjsTestUrl('/test.html#testOnce=1', onEventError);
    }

  };
  local._init();
}());
