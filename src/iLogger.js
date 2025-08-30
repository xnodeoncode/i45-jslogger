/**
 * @typedef {Object} iLogger
 * @property {function(string):void} info
 * @property {function(string):void} warn
 * @property {function(string):void} error
 * @property {function():Array} getEvents
 */

/** @type {iLogger} */
const iLogger = {
  info: (message) => {},
  warn: (message) => {},
  error: (message) => {},
  getEvents: () => {},
};

export default iLogger;
