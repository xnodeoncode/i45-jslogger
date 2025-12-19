export class Logger {
  // Environment detection
  static isBrowser = typeof window !== "undefined";
  static hasLocalStorage =
    Logger.isBrowser && typeof window.localStorage !== "undefined";
  static supportsCustomEvents =
    Logger.isBrowser && typeof CustomEvent !== "undefined";

  // Event namespace to prevent global window pollution
  static #EVENT_NAMESPACE = "i45-logger:";

  // Required client methods
  static #REQUIRED_METHODS = ["log", "info", "warn", "error"];

  // Private fields

  // collections
  #events;
  #clients;

  // settings
  #loggingEnabled;
  #enableDispatchEvents;
  #suppressNative;
  #suppressConsole;
  #maxEvents;

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

    this.#loggingEnabled = true;
    this.#enableDispatchEvents = true;
    this.#suppressNative = false;
    this.#suppressConsole = false;
    this.#maxEvents = null; // null = unlimited
  }

  /*******************************************************************
   * Getters and Setters
   ********************************************************************/

  /** Enable or disable logging globally.
   * When disabled, no logs will be recorded or output.
   * Default is true.
   ********************************************************************/
  get loggingEnabled() {
    return this.#loggingEnabled;
  }

  set loggingEnabled(value) {
    if (typeof value !== "boolean") {
      throw new TypeError(
        `loggingEnabled must be a boolean (true or false). Received: ${typeof value} with value: ${JSON.stringify(
          value
        )}`
      );
    }
    this.#loggingEnabled = value;
  }

  get suppressNative() {
    return this.#suppressNative;
  }

  set suppressNative(value) {
    if (typeof value !== "boolean") {
      throw new TypeError(
        `suppressNative must be a boolean (true or false). Received: ${typeof value}`
      );
    }
    this.#suppressNative = value;
  }

  get suppressConsole() {
    return this.#suppressConsole;
  }

  set suppressConsole(value) {
    if (typeof value !== "boolean") {
      throw new TypeError(
        `suppressConsole must be a boolean (true or false). Received: ${typeof value}`
      );
    }
    this.#suppressConsole = value;
  }

  /** Enable or disable CustomEvent dispatching to window.
   * When enabled, log events will be dispatched as CustomEvents on the window object.
   * Default is true.
   ********************************************************************/
  get enableDispatchEvents() {
    return this.#enableDispatchEvents;
  }

  set enableDispatchEvents(value) {
    if (typeof value !== "boolean") {
      throw new TypeError(
        `enableDispatchEvents must be a boolean (true or false). Received: ${typeof value}`
      );
    }
    this.#enableDispatchEvents = value;
  }

  /** Maximum number of events to store.
   * When limit is reached, oldest events are removed.
   * null = unlimited (default)
   ********************************************************************/
  get maxEvents() {
    return this.#maxEvents;
  }

  set maxEvents(value) {
    if (
      value !== null &&
      (typeof value !== "number" || value < 0 || !Number.isInteger(value))
    ) {
      throw new TypeError("maxEvents must be null or a positive integer.");
    }
    this.#maxEvents = value;
    // Trim existing events if needed
    if (value !== null && this.#events.length > value) {
      this.#events = this.#events.slice(-value);
      if (Logger.hasLocalStorage) {
        try {
          window.localStorage.setItem("eventLog", JSON.stringify(this.#events));
        } catch (error) {
          this.consoleError(
            "Failed to update event log in localStorage:",
            error
          );
        }
      }
    }
  }

  log(message = "", ...args) {
    if (!this.#loggingEnabled) return;

    if (!this.suppressNative) {
      this.addEvent("LOG", message);
    }
    if (!this.suppressConsole) {
      this.consoleLog(`[LOG] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => {
        try {
          client.log(message, ...args);
        } catch (error) {
          this.consoleError("Client error in log():", error);
        }
      });
    }
    if (Logger.supportsCustomEvents && this.#enableDispatchEvents) {
      window.dispatchEvent(
        new CustomEvent(`${Logger.#EVENT_NAMESPACE}LOG`, {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  info(message = "", ...args) {
    if (!this.#loggingEnabled) return;
    if (!this.suppressNative) {
      this.addEvent("INFO", message);
    }
    if (!this.suppressConsole) {
      this.consoleInfo(`[INFO] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => {
        try {
          client.info(message, ...args);
        } catch (error) {
          this.consoleError("Client error in info():", error);
        }
      });
    }
    if (Logger.supportsCustomEvents && this.#enableDispatchEvents) {
      window.dispatchEvent(
        new CustomEvent(`${Logger.#EVENT_NAMESPACE}INFO`, {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  warn(message = "", ...args) {
    if (!this.#loggingEnabled) return;
    if (!this.suppressNative) {
      this.addEvent("WARN", message);
    }
    if (!this.suppressConsole) {
      this.consoleWarn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
    if (this.#clients.size) {
      this.#clients.forEach((client) => {
        try {
          client.warn(message, ...args);
        } catch (error) {
          this.consoleError("Client error in warn():", error);
        }
      });
    }
    if (Logger.supportsCustomEvents && this.#enableDispatchEvents) {
      window.dispatchEvent(
        new CustomEvent(`${Logger.#EVENT_NAMESPACE}WARN`, {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  error(message = "", ...args) {
    if (!this.#loggingEnabled) return;
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
      this.#clients.forEach((client) => {
        try {
          client.error(message, ...args);
        } catch (error) {
          this.consoleError("Client error in error():", error);
        }
      });
    }
    if (Logger.supportsCustomEvents && this.#enableDispatchEvents) {
      window.dispatchEvent(
        new CustomEvent(`${Logger.#EVENT_NAMESPACE}ERROR`, {
          detail: { message, args, timestamp: new Date().toISOString() },
        })
      );
    }
    return this;
  }

  isValidClient(client) {
    if (!client) return false;
    return Logger.#REQUIRED_METHODS.every(
      (method) => typeof client[method] === "function"
    );
  }

  addClient(client) {
    if (this.#clients.has(client)) {
      this.warn("Client is already added.");
      return false;
    }

    if (this.isValidClient(client)) {
      this.#clients.add(client);
      this.log("A new client has been added.", client);
      return true;
    }

    this.error(
      `Failed to add client. Invalid client interface. Expected the following methods: ${Logger.#REQUIRED_METHODS.join(
        ", "
      )}`,
      client
    );
    return false;
  }

  removeClient(client) {
    if (!this.#clients.has(client)) {
      console.warn("Client not found.");
      return false;
    }
    this.#clients.delete(client);
    return true;
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
    // Don't add if maxEvents is 0
    if (this.#maxEvents === 0) {
      return this;
    }

    this.#events.push({
      id: new Date().getTime(),
      type,
      event,
      timestamp: new Date().toISOString(),
    });

    // Enforce maxEvents limit
    if (this.#maxEvents !== null && this.#events.length > this.#maxEvents) {
      this.#events = this.#events.slice(-this.#maxEvents);
    }

    if (Logger.hasLocalStorage) {
      try {
        window.localStorage.setItem("eventLog", JSON.stringify(this.#events));
      } catch (error) {
        this.consoleError("Failed to save event log to localStorage:", error);
      }
    }
    return this;
  }

  getEvents() {
    if (this.#events.length) {
      return this.#events;
    }
    if (Logger.hasLocalStorage) {
      return JSON.parse(window.localStorage.getItem("eventLog")) || [];
    }
    return [];
  }

  clearEventLog() {
    this.#events = [];
    if (Logger.hasLocalStorage) {
      window.localStorage.removeItem("eventLog");
    }
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

// Export a default instance for simple use cases
const defaultLogger = new Logger();
export default defaultLogger;
