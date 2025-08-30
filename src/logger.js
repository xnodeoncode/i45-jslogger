import { iLogger } from "./iLogger.js";
import { iLoggerValidator } from "./iLoggerValidator.js";

export { iLogger, iLoggerValidator };

export class Logger {
  #events;
  constructor() {
    this.consoleInfo = console.info.bind(console);
    this.consoleWarn = console.warn.bind(console);
    this.consoleError = console.error.bind(console);

    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);

    this.#events = [];
  }
  info = function (message = "", ...args) {
    this.addEvent("INFO", message);
    this.consoleInfo(`[INFO] ${new Date().toISOString()}:`, message, ...args);
  };
  warn = function (message = "", ...args) {
    this.addEvent("WARN", message);
    this.consoleWarn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
  };
  error = function (message = "", ...args) {
    this.addEvent("ERROR", message);
    this.consoleError(`[ERROR] ${new Date().toISOString()}:`, message, ...args);
  };

  addEvent = function (type, event) {
    this.#events.push({
      id: new Date().getTime(),
      type,
      event,
      timestamp: new Date().toISOString(),
    });
    try {
      window.localStorage.setItem("eventLog", JSON.stringify(this.#events));
    } catch (error) {
      this.consoleError("Failed to save event log to localStorage:", error);
    }
  };

  getEvents = function () {
    return this.#events.length
      ? this.#events
      : JSON.parse(window.localStorage.getItem("eventLog")) || [];
  };

  clear = function () {
    this.#events = [];
    window.localStorage.removeItem("eventLog");
  };
}
