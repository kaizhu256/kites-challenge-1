/*******************************************************************************
 *
 * A blank reference implementation exists below. Replace it with your
 * implementation.
 *
 *                                                                        [n=80]
 ******************************************************************************/

/*jslint browser: true, indent: 2, maxerr: 8, node: true, nomen: true, regexp: true, todo: true, unparam: true*/
/*global global, required, state, utility2, $*/
(function moduleHoursShared() {
  /* this shared module exports the hours api to both nodejs and browser */
  "use strict";

  var local;
  local = {

    _name: 'kites_hours.moduleHoursShared',

    _init: function () {
      if (typeof require === 'function') {
        require('utility2');
      }
      utility2.initModule(module, local);
      if (typeof module === 'object') {
        module.exports = required.kites_hours;
      }
    },

    parse: function (text) {
      text = local._tokenize(text);
      text = local._generateOutput(text);
      return text;
    },

    _dayDict: {
      sun: '0',
      mon: '1',
      tue: '2',
      wed: '3',
      thu: '4',
      fri: '5',
      sat: '6',
      '日': '0',
      '一': '1',
      '二': '2',
      '三': '3',
      '四': '4',
      '五': '5',
      '六': '6'
    },

    _tokenize: function (text) {
      text = text.trim().toLowerCase();
      /* normalize space-like characters */
      text = text.replace((/\s+/g), ' ');
      /* reserve '<' and '>' as special characters */
      text = text.replace((/[<>]/g), ' ');
      /* normalize hh:mm to hhmm */
      text = text.replace((/\b([012]{0,1}\d):(\d\d)\b/g), '$1$2');
      /* normalize hmm to hhmm */
      text = text.replace((/\b(\d\d\d)\b/g), '0$1');
      /* reduce am morning time */
      text = text.replace((/\b([012]\d\d\d)\s{0,1}am\b/g), '$1');
      /* reduce pm evening time */
      text = text.replace((/\b([01]\d\d\d)\s{0,1}pm\b/g), function (match, hhmm) {
        return ('0' + (Number(hhmm) + 1200)).slice(-4);
      });
      /* tokenize day */
      text = text.replace((/\b(sun|mon|tue|wed|thu|fri|sat)\w*/g), function (match, day) {
        day = local._dayDict[day];
        return day ? '<dd' + day + '>' : match;
      });
      text = text.replace((/\bweekday\b/g), '<dd1>-<dd5>');
      /* tokenize chinese day */
      text = text.replace((/星期(.)/g), function (match, day) {
        day = local._dayDict[day];
        return day ? '<dd' + day + '>' : match;
      });
      /* normalize '-' */
      text = text.replace((/[^<>\w]*(?:-|to|–|至)[^<>\w日一二三四五六]*/g), '-');
      /* normalize '&' */
      text = text.replace((/[^<>\w]*(?:&|and|，|、)[^<>\w日一二三四五六]*/g), '&');
      /* tokenize chinese day range dd1-dd2 */
      text = text.replace((/(<dd.>)([&\-])([日一二三四五六])/g), function (match, day1, to, day2) {
        day2 = local._dayDict[day2];
        return day2 ? day1 + to + '<dd' + day2 + '>' : match;
      });
      /* tokenize time range hhmm1-hhmm2 */
      text = text.replace((/\b([012]\d\d\d)-([012]\d\d\d)\b/g), function (match, hhmm1, hhmm2) {
        if (hhmm2 < hhmm1) {
          hhmm2 = String(Number(hhmm2) + 2400);
        }
        /* assert hhmm is between 0000-2800 */
        if (hhmm1.length === 4
            && '0000' <= hhmm1
            && hhmm1 <= '2800'
            && hhmm2.length === 4
            && '0000' <= hhmm2
            && hhmm2 <= '2800') {
          return '<hm' + hhmm1 + '-' + hhmm2 + '>';
        }
        return match;
      });
      /* expand day range */
      text = text.replace((/<dd(\d)>-<dd(\d)>/g), function (match, day1, day2) {
        var ii;
        day1 = Number(day1);
        day2 = Number(day2);
        if (day2 < day1) {
          day2 += 7;
        }
        match = '';
        for (ii = day1; ii <= day2; ii += 1) {
          match += '<dd' + (ii % 7) + '>';
        }
        return match;
      });
      /* remove cruft */
      text = text.replace((/>[^<]+/g), '>');
      /* add newline token */
      text = text.replace((/(<hm.*?)(<dd)/g), '$1\n$2');
      return text;
    },

    _generateOutput: function (text) {
      var dayList, hhmmDict, result, resultList;
      result = '';
      resultList = [];
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
        /* append hours to given day */
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
        /* condense hours into contiguous time ranges */
        for (jj = value.length - 2; jj >= 0; jj -= 1) {
          if (value[jj][1] >= value[jj + 1][0]) {
            value.splice(jj, 2, [value[jj][0], Math.max(value[jj][1], value[jj + 1][1])]);
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
      Object.keys(hhmmDict).forEach(function (key) {
        var ii, list;
        list = hhmmDict[key].sort();
        /* rotate list to remove holes in day ranges */
        ii = list.length;
        while (ii && ((list[0] + 6) % 7) === list[list.length - 1]) {
          list.push(list.shift());
          ii -= 1;
        }
        /* condense days into contiguous day ranges */
        list = list.join(',')
          .replace('0,1', '0-1')
          .replace('1,2', '1-2')
          .replace('2,3', '2-3')
          .replace('3,4', '3-4')
          .replace('4,5', '4-5')
          .replace('5,6', '5-6')
          .replace('6,0', '6-0')
          .replace((/(\d)-[\-\d]+(\d)/g), '$1-$2');
        resultList.push([list, key]);
      });
      /* sort results by the lowest ordinal number of the day of the week */
      result = resultList.sort(function (value1, value2) {
        value1 = value1[0].match(/\d/g).sort()[0];
        value2 = value2[0].match(/\d/g).sort()[0];
        return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      }).map(function (value) {
        return value[0] + ':' + value[1];
      }).join(';');
      if (result) {
        result = 'S' + result;
      }
      return result;
    }

  };
  local._init();
}());
