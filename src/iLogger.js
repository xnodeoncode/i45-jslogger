/**
 * @typedef {Object} iLogger
 * @property {function(string):void} info
 * @property {function(string):void} warn
 * @property {function(string):void} error
 * @property {function():Array} getEvents
 */

/** @type {iLogger} */
// export const iLogger = {
//   log: (message, ...args) => {},
//   info: (message, ...args) => {},
//   warn: (message, ...args) => {},
//   error: (message, ...args) => {},
// };

export const iLogger = ["log", "info", "warn", "error"];
