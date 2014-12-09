/*jshint -W083 */

/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


var
  joola = require('../index'),
  util = require('util'),
  _ = require('underscore'),
  de = require('deep-extend'),
  traverse = require('traverse'),
  crypto = require('crypto'),
  ce = require('cloneextend');//,
//JSONStream = require('JSONStream');

var common = ce.clone(util);
common._id = 'common';
module.exports = exports = common;
common.extend = common._extend;
common._ = _;

require('./modifiers');

common.mixin = function (origin, add, overwrite) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = 0;//keys.length;
  while (i < keys.length) {
    if (origin.hasOwnProperty(keys[i])) {
      if (overwrite)
        origin[keys[i]] = add[keys[i]];
      //else
      //common.extend(origin[keys[i]], add[keys[i]]);

    }
    else
      origin[keys[i]] = add[keys[i]];
    i++;
  }
  return origin;
};

common._mixin = function (destination, source) {
  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) return arguments[0];

  var target = arguments[0];

  // convert arguments to array and cut off target object
  var args = Array.prototype.slice.call(arguments, 1);

  var key, val, src, clone, tmpBuf;

  args.forEach(function (obj) {
    if (typeof obj !== 'object') return;

    for (var key in obj) {
      if (!(key in obj)) continue;

      src = target[key];
      val = obj[key];

      if (val === target) continue;

      if (typeof val === 'object' && key === 'container') {
        target[key] = val;
        continue;
      }

      if (typeof val !== 'object' || val === null) {
        target[key] = val;
        continue;
      } else if (val instanceof Buffer) {
        tmpBuf = new Buffer(val.length);
        val.copy(tmpBuf);
        target[key] = tmpBuf;
        continue;
      }

      if (typeof src !== 'object' || src === null) {
        clone = (Array.isArray(val)) ? [] : {};
        target[key] = common._mixin(clone, val);
        continue;
      }

      if (Array.isArray(val)) {
        clone = (Array.isArray(src)) ? src : [];
      } else {
        clone = (!Array.isArray(src)) ? src : {};
      }

      target[key] = common._mixin(clone, val);
    }
  });
  return target;
};

//hook functions for timings
/* istanbul ignore next */
common.hookEvents = function (obj) {
  if (!obj)
    return;
  var name, fn, obj_id;

  if (obj._id)
    obj_id = obj._id;

  for (name in obj) {
    fn = obj[name];
    if (name.substring(0, 1) == '_')
      continue;

    if (typeof fn === 'function' && name !== 'hookEvents') {
      obj[name] = function (name, fn) {
        var args = arguments;
        return function () {
          var self = this;
          var timeID = 'Function ' + (obj_id ? obj_id + '.' : '') + name;

          if (joola.options.debug.functions.enabled && console.time)
            console.time(timeID);
          var result = fn.apply(self, arguments);
          if (joola.options.debug.functions.enabled && console.time) {
            console.timeEnd(timeID);
          }
          return result;
        };
      }(name, fn);
    }
    else if (typeof fn === 'object')
      this.hookEvents(fn);
  }
};

common.uuid = function (length) {
  // http://stackoverflow.com/questions/8855687/secure-random-token-in-node-js
  function randomString(length, chars) {
    var charsLength = chars.length;
    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
    var cursor = 0;
    for (var i = 0; i < length; i++) {
      cursor += randomBytes[i];
      result[i] = chars[cursor % charsLength];
    }
    return result.join('');
  }

  return randomString(length || 32, 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789');
};

common.stringify = function (obj, callback) {
  return callback(null, JSON.stringify(obj));
};

common.parse = function (string, callback) {
  return callback(null, JSON.parse(string));
};

common.hash = function (string) {
  return require('crypto').createHash('md5').update(string).digest("hex");
};

common.ensureLength = function (string, length) {
  if (!string)
    return string;
  if (typeof string !== 'string')
    return string;
  if (string === '')
    return;
  var counter = 0;
  while (string.length > length && counter < 100) {
    string = string.replace('...', '');
    string = string.substring(0, string.length - 1) + '...';
    counter++;
  }
  return string;
};

common.flatGetSet = function (obj, is, value) {
  if (typeof is == 'string') {
    return common.flatGetSet(obj, is.split('.'), value);
  }
  else if (is.length == 1 && value !== undefined) {
    if (value === null) {
      return delete obj[is[0]];
    }
    else {
      obj[is[0]] = value;
    }
  }
  else if (is.length === 0) {
    if (typeof obj === 'object' && Object.keys(obj).length === 0)
      return null;
    else {
      //check if converted array
      if (typeof obj === 'object' && Object.keys(obj)[0] === '0')
        return common.objToArray(obj);

      return obj;
    }
  }
  else {
    if (typeof obj === 'undefined' || obj === null)
      obj = {};
    if (typeof obj[is[0]] === 'undefined' || obj[is[0]] === null)
      obj[is[0]] = {};
    return common.flatGetSet(obj[is[0]], is.slice(1), value);
  }
};

common.isNumeric= function( obj ) {
  return !Array.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
}