'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hash(method, s, format) {
  var sum = _crypto2.default.createHash(method);
  var isBuffer = Buffer.isBuffer(s);
  sum.update(s, isBuffer ? 'binary' : 'utf8');
  return sum.digest(format || 'hex');
}

function md5(s, format) {
  return hash('md5', s, format);
}

function YYYYMMDDHHmmss(dd, options) {
  var d = dd || new Date();
  if (!(d instanceof Date)) {
    d = new Date(d);
  }

  var dateSep = '-';
  var timeSep = ':';
  if (options) {
    if (options.dateSep) {
      dateSep = options.dateSep;
    }
    if (options.timeSep) {
      timeSep = options.timeSep;
    }
  }
  var date = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  var month = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  var hours = d.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  var mintues = d.getMinutes();
  if (mintues < 10) {
    mintues = '0' + mintues;
  }
  var seconds = d.getSeconds();
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return '' + d.getFullYear() + dateSep + month + dateSep + date + ' ' + hours + timeSep + mintues + timeSep + seconds;
}

function checkRequired(params, keys) {
  return new Promise(function (resolve, reject) {
    var thisKeys = keys;
    if (!Array.isArray(thisKeys)) {
      thisKeys = [thisKeys];
    }
    for (var i = 0; i < thisKeys.length; i++) {
      var k = thisKeys[i];
      if (!{}.hasOwnProperty.call(params, k)) {
        var err = new Error(k + ' required');
        err.name = 'ParameterMissingError';
        reject(err);
      }
    }
    resolve();
  });
}

function getApiResponseName(apiName) {
  var reg = /\./g;
  var thisApiName = apiName;
  if (thisApiName.match('^taobao')) {
    thisApiName = thisApiName.substr(7);
  }
  return thisApiName.replace(reg, '_') + '_response';
}

var util = {
  checkRequired: checkRequired,
  md5: md5,
  YYYYMMDDHHmmss: YYYYMMDDHHmmss,
  getApiResponseName: getApiResponseName
};

exports.default = util;