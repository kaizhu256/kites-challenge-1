/*******************************************************************************
 *
 * A blank reference implementation exists below. Replace it with your
 * implementation.
 *
 *                                                                        [n=80]
 ******************************************************************************/

module.exports = (function() {
  "use strict";

  var hours = {
    parse: function (text) {
      text = hours._tokenize(text);
      return hours._parse(text);
    },

    _tokenize: function (text) {
      text = text.trim().toLowerCase()
        // /* normalize chinese dd */
        // .replace((/星期/g), function (match, dd) {
          // return '<dd' + {
            // '一': 0,
            // '二': 1,
            // '三': 2,
            // '四': 3,
            // '五': 4,
            // '六': 5,
            // '日': 6,
          // }[dd] + '>';
        // })
        // .replace((/(<dd.>)到(.)/g), function (match, dd1, dd2) {
          // return dd1 + '-<dd' + {
            // '一': 0,
            // '二': 1,
            // '三': 2,
            // '四': 3,
            // '五': 4,
            // '六': 5,
            // '日': 6,
          // }[dd2] + '>';
        // })
        /* normalize space-like characters */
        .replace((/\s+/g), ' ')
        /* reserve '<' and '>' as special characters */
        .replace((/[<>]/g), ' ')
        /* normalize hh:mm to hhmm */
        .replace((/\b([012]{0,1}\d):(\d\d)\b/g), '$1$2')
        /* normalize hmm to hhmm */
        .replace((/\b(\d\d\d)\b/g), '0$1')
        /* reduce am morning time */
        .replace((/\b([012]\d\d\d)\W{0,1}am\b/g), '$1')
        /* reduce pm evening time */
        .replace((/\b([01]\d\d\d)\W{0,1}pm\b/g), function (match, hhmm) {
          return ('0' + (Number(hhmm) + 1200)).slice(-4);
        })
        /* normalize '-' */
        .replace((/\W*(?:-|to|–|至)\W*/g), '-')
        /* normalize '&' */
        .replace((/\W*(?:&|and)\W*/g), '&')
        /* normalize date range hhmm1-hhmm2 */
        .replace((/\b([012]\d\d\d)-([012]\d\d\d)\b/g), function (match, hhmm1, hhmm2) {
          if (hhmm2 < hhmm1) {
            hhmm2 = String(Number(hhmm2) + 2400);
            if (hhmm2.length > 4) {
              return match;
            }
          }
          /* assert hhmm is between 0000-2800 */
          if ('0000' <= hhmm1 && hhmm1 <= '2800' && '0000' <= hhmm2 && hhmm2 <= '2800') {
            return '<hm' + hhmm1 + '-' + hhmm2 + '>';
          }
          return match;
        })
        /* normalize dd */
        .replace((/\b(sun|mon|tue|wed|thu|fri|sat)\w*/g), function (match, dd) {
          return '<dd' + {
            sun: 0,
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6
          }[dd] + '>';
        })
        /* expand dd range */
        .replace((/<dd(\d)>-<dd(\d)>/g), function (match, dd1, dd2) {
          var ii;
          dd1 = Number(dd1);
          dd2 = Number(dd2);
          if (dd2 < dd1) {
            dd2 += 7;
          }
          match = '';
          for (ii = dd1; ii <= dd2; ii += 1) {
            match += '<dd' + (ii % 7) + '>';
          }
          return match;
        })
        /* remove cruft */
        .replace((/>[^<]+/g), '>')
        /* add newline token */
        .replace((/(<hm.*?)(<dd)/g), '$1\n$2');
      return text;
    },

    _parse: function (text) {
      var dayDict, dayList, hhmmDict, result;
      result = '';
      if (!(/<dd/g).test(text) || (/>[^\n-<]/).test(text)) {
        return result;
      }
      /* lexically parse text using '<' and '>' token delimiters */
      dayList = ['', '', '', '', '', '', ''];
      text.split('\n').forEach(function (line) {
        var hhmm;
        hhmm = (/<hm.*/).exec(line);
        if (!hhmm) {
          return;
        }
        hhmm = hhmm[0];
        line.replace((/<dd(\d)>/g), function (match, ii) {
          dayList[ii] = dayList[ii] || '';
          dayList[ii] += hhmm;
        });
      });
      hhmmDict = {};
      dayList.forEach(function (value, ii) {
        var jj;
        value = (value.match(/\d\d\d\d-\d\d\d\d/g) || []).sort().map(function (hhmm) {
          return hhmm.split('-');
        });
        for (jj = value.length - 2; jj >= 0; jj -= 1) {
          if (value[jj][1] >= value[jj + 1][0]) {
            value.splice(jj, 2, [value[jj][0], value[jj + 1][1]]);
          }
        }
        value = value.map(function (hhmm) {
          return hhmm.join('-');
        }).join(',');
        if (value) {
          hhmmDict[value] = hhmmDict[value] || [];
          hhmmDict[value].push(ii);
        }
      });
      dayDict = {};
      Object.keys(hhmmDict).forEach(function (key) {
        var ii, list;
        list = hhmmDict[key].sort();
        /* rotate list to remove holes */
        ii = list.length;
        while (ii && ((list[0] + 6) % 7) === list[list.length - 1]) {
          list.push(list.shift());
          ii -= 1;
        }
        list = list.join(',')
          .replace('0,1', '0-1')
          .replace('1,2', '1-2')
          .replace('2,3', '2-3')
          .replace('3,4', '3-4')
          .replace('4,5', '4-5')
          .replace('5,6', '5-6')
          .replace('6,0', '6-0')
          .replace((/(\d)-[\-\d]+(\d)/g), '$1-$2');
        dayDict[list] = key;
      });
      result = Object.keys(dayDict).sort().map(function (key) {
        return key + ':' + dayDict[key];
      }).join(';');
      if (result) {
        result = 'S' + result;
      }
      return result;
    }
  };

  return hours;

}());

