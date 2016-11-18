'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _topUtil = require('./topUtil');

var _topUtil2 = _interopRequireDefault(_topUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TopClient = function () {
  function TopClient(options) {
    _classCallCheck(this, TopClient);

    var opts = options || {};
    if (!opts.appkey || !opts.appsecret) {
      throw new Error('appkey or appsecret need!');
    }
    this.options = opts;
    this.REST_URL = opts.REST_URL || 'http://gw.api.taobao.com/router/rest';
    this.appkey = opts.appkey;
    this.appsecret = opts.appsecret;
  }

  _createClass(TopClient, [{
    key: 'invoke',
    value: function invoke(method, params, reponseNames, defaultResponse, type) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var thisParams = params;
        thisParams.method = method;
        _this.request(thisParams, type).then(function (result) {
          var response = result;
          if (reponseNames && reponseNames.length > 0) {
            for (var i = 0; i < reponseNames.length; i++) {
              var name = reponseNames[i];
              response = response[name];
              if (response === undefined) {
                break;
              }
            }
          }
          if (response === undefined) {
            response = defaultResponse;
          }
          resolve(response);
        }).catch(function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'timestamp',
    value: function timestamp() {
      return _topUtil2.default.YYYYMMDDHHmmss();
    }
  }, {
    key: 'sign',
    value: function sign(params) {
      var sorted = Object.keys(params).sort();
      var basestring = this.appsecret;
      for (var i = 0; i < sorted.length; i++) {
        var k = sorted[i];
        basestring += k + params[k];
      }
      basestring += this.appsecret;
      return _topUtil2.default.md5(basestring).toUpperCase();
    }
  }, {
    key: 'request',
    value: function request(params) {
      var _this2 = this;

      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'POST';

      return new Promise(function (resolve, reject) {
        _topUtil2.default.checkRequired(params, 'method').then(function () {
          var args = {
            timestamp: _this2.timestamp(),
            format: 'json',
            app_key: _this2.appkey,
            v: '2.0',
            sign_method: 'md5'
          };

          for (var k in params) {
            if (_typeof(params[k]) === 'object') {
              args[k] = JSON.stringify(params[k]);
            } else {
              args[k] = params[k];
            }
          }
          args.sign = _this2.sign(args);
          var url = _this2.REST_URL;
          var requestOpts = {
            method: type,
            url: url,
            json: true
          };
          if (type.toUpperCase() === 'GET') {
            requestOpts.qs = args;
          } else if (type.toUpperCase() === 'POST') {
            requestOpts.form = args;
          } else {
            requestOpts.body = JSON.stringify(args);
          }
          (0, _request3.default)(requestOpts, function (error, response, body) {
            if (error) {
              reject(error);
            }
            if (body) {
              var errRes = body && body.error_response;
              if (errRes) {
                var msg = errRes.msg + ', code ' + errRes.code;
                if (errRes.sub_msg && errRes.sub_code) {
                  msg += '; ' + errRes.sub_code + ': ' + errRes.sub_msg;
                }
                var e = new Error(msg);
                e.name = 'TOPClientError';
                e.code = errRes.code;
                e.sub_code = errRes.sub_code;
                e.data = body;
                reject(e);
              }
              resolve(body);
            }
            reject();
          });
        }).catch(function (checkErr) {
          reject(checkErr);
        });
      });
    }
  }, {
    key: 'execute',
    value: function execute(apiname, params, type) {
      return this.invoke(apiname, params, [_topUtil2.default.getApiResponseName(apiname)], null, type);
    }
  }]);

  return TopClient;
}();

exports.default = TopClient;