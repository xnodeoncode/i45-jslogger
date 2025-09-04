import { iLogger } from "./iLogger.js";
import { iLoggerValidator } from "./iLoggerValidator.js";

export { iLogger, iLoggerValidator };

export class Logger {
  #events;
  #clients;

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
  }

  loggingEnabled = true;
  suppressNative = false;
  suppressConsole = false;
  dispatchEvents = true;

  log(message = "", ...args) {
    if (!this.loggingEnabled) return;

    if (!this.suppressNative) {
      this.addEvent("LOG", message);
    }
    if (!this.suppressConsole) {
      this.consoleLog(`[LOG] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.log(message, ...args));
    }
    if (window && this.dispatchEvents) {
      window.dispatchEvent(
        new CustomEvent("LOG", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  info(message = "", ...args) {
    if (!this.loggingEnabled) return;
    if (!this.suppressNative) {
      this.addEvent("INFO", message);
    }
    if (!this.suppressConsole) {
      this.consoleInfo(`[INFO] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.info(message, ...args));
    }
    if (window && this.dispatchEvents) {
      window.dispatchEvent(
        new CustomEvent("INFO", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  warn(message = "", ...args) {
    if (!this.loggingEnabled) return;
    if (!this.suppressNative) {
      this.addEvent("WARN", message);
    }
    if (!this.suppressConsole) {
      this.consoleWarn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => client.warn(message, ...args));
    }
    if (window && this.dispatchEvents) {
      window.dispatchEvent(
        new CustomEvent("WARN", {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  error(message = "", ...args) {
    if (!this.loggingEnabled) return;
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
    if (window && this.dispatchEvents) {
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

  clearEvents() {
    this.#events = [];
    window.localStorage.removeItem("eventLog");
    console.clear();
    return this;
  }
}
