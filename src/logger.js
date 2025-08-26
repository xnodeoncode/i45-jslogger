import { EventLog } from "eventLog.js";

export { EventLog };

export class Logger {
  #eventLog = new EventLog();
  constructor() {
    this.consoleInfo = console.info.bind(console);
    this.consoleWarn = console.warn.bind(console);
    this.consoleError = console.error.bind(console);

    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);

    this.consoleInfo("Logger initialized.");
  }
  info = function (message = "", ...args) {
    this.#eventLog.addEvent("INFO", message);
    this.consoleInfo(`[INFO] ${new Date().toISOString()}:`, message, ...args);
  };
  warn = function (message = "", ...args) {
    this.#eventLog.addEvent("WARN", message);
    this.consoleWarn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
  };
  error = function (message = "", ...args) {
    this.#eventLog.addEvent("ERROR", message);
    this.consoleError(`[ERROR] ${new Date().toISOString()}:`, message, ...args);
  };

  clear = function () {
    this.#eventLog.clear();
    console.clear();
  };

  getEvents() {
    return this.#eventLog.getEvents();
  }
}
