import crypto from 'crypto';

function hash(method, s, format) {
  const sum = crypto.createHash(method);
  const isBuffer = Buffer.isBuffer(s);
  sum.update(s, isBuffer ? 'binary' : 'utf8');
  return sum.digest(format || 'hex');
}

function md5(s, format) {
  return hash('md5', s, format);
}

function YYYYMMDDHHmmss(dd, options) {
  let d = dd || new Date();
  if (!(d instanceof Date)) {
    d = new Date(d);
  }

  let dateSep = '-';
  let timeSep = ':';
  if (options) {
    if (options.dateSep) {
      dateSep = options.dateSep;
    }
    if (options.timeSep) {
      timeSep = options.timeSep;
    }
  }
  let date = d.getDate();
  if (date < 10) {
    date = `0${date}`;
  }
  let month = d.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  let hours = d.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  let mintues = d.getMinutes();
  if (mintues < 10) {
    mintues = `0${mintues}`;
  }
  let seconds = d.getSeconds();
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${d.getFullYear()}${dateSep}${month}${dateSep}${date} ${hours}${timeSep}${mintues}${timeSep}${seconds}`;
}

function checkRequired(params, keys) {
  return new Promise((resolve, reject) => {
    let thisKeys = keys;
    if (!Array.isArray(thisKeys)) {
      thisKeys = [thisKeys];
    }
    for (let i = 0; i < thisKeys.length; i++) {
      const k = thisKeys[i];
      if (!{}.hasOwnProperty.call(params, k)) {
        const err = new Error(`${k} required`);
        err.name = 'ParameterMissingError';
        reject(err);
      }
    }
    resolve();
  });
}

function getApiResponseName(apiName) {
  const reg = /\./g;
  let thisApiName = apiName;
  if (thisApiName.match('^taobao')) {
    thisApiName = thisApiName.substr(7);
  }
  return `${thisApiName.replace(reg, '_')}_response`;
}

const util = {
  checkRequired,
  md5,
  YYYYMMDDHHmmss,
  getApiResponseName,
};

export default util;
