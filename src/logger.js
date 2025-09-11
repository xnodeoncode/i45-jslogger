import { iLogger } from "./iLogger.js";
import { iLoggerValidator } from "./iLoggerValidator.js";

export { iLogger, iLoggerValidator };

export class Logger {
  // Private fields

  // collections
  #events;
  #clients;

  // settings
  #enableEvents;
  #enableLogging;
  #suppressNative;
  #suppressConsole;

  // Deprecated fields
  #loggingEnabled;
  #dispatchEvents;

  constructor() {
    this.consoleLog = console.log.bind(console);
    this.consoleInfo = console.info.bind(console);
    this.consoleWarn = console.warn.bind(console);
    this.consoleError = console.error.bind(console);

    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);

    this.#events = [];
    this.#clients = new Set();

    this.#enableEvents = true;
    this.#enableLogging = true;
    this.#suppressNative = false;
    this.#suppressConsole = false;

    // These are deprecated, use enableEvents and enableLogging properties instead.
    this.#dispatchEvents = true;
    this.#loggingEnabled = true;
  }

  /*******************************************************************
   * Getters and Setters
   ********************************************************************/

  /** Enable or disable logging globally.
   * When disabled, no logs will be recorded or output.
   * Default is true.
   * @deprecated Use loggingEnabled property instead.
   ********************************************************************/
  get loggingEnabled() {
    return this.#loggingEnabled;
  }

  /** Enable or disable logging globally.
   * When disabled, no logs will be recorded or output.
   * Default is true.
   * @deprecated Use loggingEnabled property instead.
   ********************************************************************/
  set loggingEnabled(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("loggingEnabled must be a boolean.");
    }
    this.#loggingEnabled = value;
  }

  /** Enable or disable logging globally.
   * When disabled, no logs will be recorded or output.
   * Default is true.
   *
   ********************************************************************/
  set enableLogging(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("enableLogging must be a boolean.");
    }
    this.#enableLogging = value;
  }
  get enableLogging() {
    return this.#enableLogging;
  }

  get suppressNative() {
    return this.#suppressNative;
  }

  set suppressNative(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("suppressNative must be a boolean.");
    }
    this.#suppressNative = value;
  }

  get suppressConsole() {
    return this.#suppressConsole;
  }

  set suppressConsole(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("suppressConsole must be a boolean.");
    }
    this.#suppressConsole = value;
  }

  /** Enable or disable event dispatching.
   * When enabled, log events will be dispatched as CustomEvents on the window object.
   * Default is true.
   * @deprecated Use enableEvents property instead.
   *
   ********************************************************************/
  get dispatchEvents() {
    return this.#dispatchEvents;
  }
  /** Enable or disable event dispatching.
   * When enabled, log events will be dispatched as CustomEvents on the window object.
   * Default is true.
   * @deprecated Use enableEvents property instead.
   *
   ********************************************************************/
  set dispatchEvents(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("dispatchEvents must be a boolean.");
    }
    this.#dispatchEvents = value;
  }

  /** Enable or disable event dispatching.
   * When enabled, log events will be dispatched as CustomEvents on the window object.
   * Default is true.
   *
   ********************************************************************/
  set enableEvents(value) {
    if (typeof value !== "boolean") {
      throw new TypeError("enableEvents must be a boolean.");
    }
    this.#enableEvents = value;
  }

  get enableEvents() {
    return this.#enableEvents;
  }

  log(message = "", ...args) {
    if (!this.#enableLogging) return;

    if (!this.suppressNative) {
      this.addEvent("LOG", message);
    }
    if (!this.suppressConsole) {
      this.consoleLog(`[LOG] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.log(message, ...args));
    }
    if (window && this.enableEvents) {
      window.dispatchEvent(
        new CustomEvent("LOG", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  info(message = "", ...args) {
    if (!this.#enableLogging) return;
    if (!this.suppressNative) {
      this.addEvent("INFO", message);
    }
    if (!this.suppressConsole) {
      this.consoleInfo(`[INFO] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.info(message, ...args));
    }
    if (window && this.enableEvents) {
      window.dispatchEvent(
        new CustomEvent("INFO", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  warn(message = "", ...args) {
    if (!this.#enableLogging) return;
    if (!this.suppressNative) {
      this.addEvent("WARN", message);
    }
    if (!this.suppressConsole) {
      this.consoleWarn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.warn(message, ...args));
    }
    if (window && this.enableEvents) {
      window.dispatchEvent(
        new CustomEvent("WARN", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  error(message = "", ...args) {
    if (!this.enableLogging) return;
    if (!this.suppressNative) {
      this.addEvent("ERROR", message);
    }
    if (!this.suppressConsole) {
      this.consoleError(
        `[ERROR] ${new Date().toISOString()}:`,
        message,
        ...args
      );
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.error(message, ...args));
    }
    if (window && this.enableEvents) {
      window.dispatchEvent(
        new CustomEvent("ERROR", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  isValidClient(object) {
    if (iLoggerValidator) {
      return iLoggerValidator.isValid(object);
    } else {
      console.warn("iLoggerValidator is not available.");
      return false;
    }
  }

  addClient(client) {
    if (this.#clients.has(client)) {
      this.warn("Client is already added.");
      return 0;
    }

    if (this.isValidClient(client)) {
      this.#clients.add(client);
      this.log("A new client has been added.", client);
      return 1;
    }

    this.error(
      `Failed to add client. Invalid client interface. Expected the following methods: ${iLogger}`,
      client
    );
    return 0;
  }

  removeClient(client) {
    if (!this.#clients.has(client)) {
      console.warn("Client not found.");
      return;
    }
    this.#clients.delete(client);
  }

  clients() {
    if (!this.#clients.size) {
      console.warn("No clients available.");
      return [];
    }
    return Array.from(this.#clients);
  }

  removeAllClients() {
    this.#clients.clear();
  }

  addEvent(type, event) {
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
    return this;
  }

  getEvents() {
    return this.#events.length
      ? this.#events
      : JSON.parse(window.localStorage.getItem("eventLog")) || [];
  }

  /*******************************************************************
   * @deprecated Use clearEventLog(), clearConsole(), or clearAll() instead.
   * Clear all events from memory and localStorage, and clear the console.
   ********************************************************************/
  clearEvents() {
    this.#events = [];
    window.localStorage.removeItem("eventLog");
    console.clear();
    return this;
  }

  clearEventLog() {
    this.#events = [];
    window.localStorage.removeItem("eventLog");
    return this;
  }

  clearConsole() {
    console.clear();
    return this;
  }

  clearAll() {
    this.clearEventLog();
    this.clearConsole();
    return this;
  }
}
