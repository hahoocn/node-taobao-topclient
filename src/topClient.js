import request from 'request';
import util from './topUtil';

class TopClient {
  constructor(options) {
    const opts = options || {};
    if (!opts.appkey || !opts.appsecret) {
      throw new Error('appkey or appsecret need!');
    }
    this.options = opts;
    this.REST_URL = opts.REST_URL || 'http://gw.api.taobao.com/router/rest';
    this.appkey = opts.appkey;
    this.appsecret = opts.appsecret;
  }

  invoke(method, params, reponseNames, defaultResponse, type) {
    return new Promise((resolve, reject) => {
      const thisParams = params;
      thisParams.method = method;
      this.request(thisParams, type)
      .then((result) => {
        let response = result;
        if (reponseNames && reponseNames.length > 0) {
          for (let i = 0; i < reponseNames.length; i++) {
            const name = reponseNames[i];
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
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  timestamp() {
    return util.YYYYMMDDHHmmss();
  }

  sign(params) {
    const sorted = Object.keys(params).sort();
    let basestring = this.appsecret;
    for (let i = 0; i < sorted.length; i++) {
      const k = sorted[i];
      basestring += k + params[k];
    }
    basestring += this.appsecret;
    return util.md5(basestring).toUpperCase();
  }

  request(params, type = 'POST') {
    return new Promise((resolve, reject) => {
      util.checkRequired(params, 'method')
      .then(() => {
        const args = {
          timestamp: this.timestamp(),
          format: 'json',
          app_key: this.appkey,
          v: '2.0',
          sign_method: 'md5'
        };

        for (const k in params) {
          if (typeof params[k] === 'object') {
            args[k] = JSON.stringify(params[k]);
          } else {
            args[k] = params[k];
          }
        }
        args.sign = this.sign(args);
        const url = this.REST_URL;
        const requestOpts = {
          method: type,
          url,
          json: true,
        };
        if (type.toUpperCase() === 'GET') {
          requestOpts.qs = args;
        } else if (type.toUpperCase() === 'POST') {
          requestOpts.form = args;
        } else {
          requestOpts.body = JSON.stringify(args);
        }
        request(requestOpts, (error, response, body) => {
          if (error) {
            reject(error);
          }
          if (body) {
            const errRes = body && body.error_response;
            if (errRes) {
              let msg = `${errRes.msg}, code ${errRes.code}`;
              if (errRes.sub_msg && errRes.sub_code) {
                msg += `; ${errRes.sub_code}: ${errRes.sub_msg}`;
              }
              const e = new Error(msg);
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
      })
      .catch((checkErr) => {
        reject(checkErr);
      });
    });
  }

  execute(apiname, params, type) {
    return this.invoke(apiname, params, [util.getApiResponseName(apiname)], null, type);
  }
}

export default TopClient;
