[NodeJS package](https://www.npmjs.com/package/i45-jslogger)

A browser based logger to track events during development and testing. Log entries are written to the console as well as stored in localStorage.

## ⚠️ v1.4.0 Breaking Changes

- `addClient()` now returns `boolean` (true/false) instead of `0|1`
- `removeClient()` now returns `boolean` (true/false) instead of `void`

## Environment Support

- ✅ **Browser**: Full support with all features
- ⚠️ **Node.js**: Limited support (no localStorage, no events)
- ⚠️ **SSR (Next.js, Nuxt)**: Requires client-side initialization

The package now includes environment detection and won't crash in Node.js environments, but localStorage and CustomEvent features will be unavailable.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Logging Levels](#logging-levels)
- [Using a Class/Module](#classmodule-usage)
- [Using a Custom Logger (Client)](#using-a-custom-logger-client)
- [Event Listeners](#event-listeners)

## Properties

i45-jslogger exposes the following properties:

- loggingEnabled:_boolean_
  - Enables/disables logging.
- suppressNative:_boolean_
  - Enables/disables native logging, client messages and dispatch events are not affected.
- suppressConsole:_boolean_
  - Enables/disables console messages.

## Methods

i45-jslogger exposes the following methods:

#### Supported Logging Levels

- log():

  _@param: Message(type:string)_

  _@param: ...args(type:any)_

  _@returns: this_

  - Executes the log method for all registered clients.

- info():

  _@param: Message(type:string)_

  _@param: ...args(type:any)_

  _@returns: this_

  - Executes the info method for all registered clients.

- warn():

  _@param: Message(type:string)_

  _@param: ...args(type:any)_

  _@returns: this_

  - Executes the warn method for all registered clients.

- error():

  _@param: Message(type:string)_

  _@param: ...args(type:any)_

  _@returns: this_

  - Executes the error message for all registered clients.

- isValidClient():

  _@param: custom logger(type:object)_

  _@returns: boolean_

  - Validates that a client has the required methods.

- addClient():

  _@param: custom logger(type:object)_
  _@returns: boolean_

  - Validates that a client has the required methods and adds it to the call tree. Returns `true` if successful, `false` if the client is already added or invalid.

- removeClient():

  _@param: client(type:object)_

  _@returns: boolean_

  - Removes a client from the call tree. Returns `true` if successful, `false` if not found.

- clients():

  _@returns: Array_

  - Returns an array of all registered clients.

- removeAllClients():

  _@returns: this_

  - Clears all registered clients.

- addEvent():_this_

  - Adds an event to the event log without logging.

- getEvents():

  _@returns: Array_

  - Returns an array of all events captured in the event log.

- clearEvents():

  _@returns: \_this_

  - Removes all events from local storage and the console.

## Installation

```javascript
npm i i45-jslogger
```

## Usage

### Simple Usage (Default Instance)

```javascript
import logger from "i45-jslogger";

logger.info("This is an info message.");
logger.warn("This is a warn message.");
logger.error("This is an error message.");
```

### Advanced Usage (Multiple Instances)

```javascript
import { Logger } from "i45-jslogger";

// Create custom logger instances with different configurations
const debugLogger = new Logger();
debugLogger.enableLogging = true;

const analyticsLogger = new Logger();
analyticsLogger.suppressConsole = true;
analyticsLogger.addClient(customClient);

debugLogger.info("Debug message");
analyticsLogger.info("Analytics event");
```

### Which Should You Use?

**Use Default Instance** when:

- Building a small app or prototype
- You only need one logger
- You want the simplest API

**Use Custom Instances** when:

- Different parts of your app need different configurations
- You want isolated loggers (debug, analytics, errors)
- Testing (each test gets a fresh instance)
- Building a library that shouldn't affect global logger state

Console output:
![Console output](https://raw.githubusercontent.com/xnodeoncode/i45-jslogger/main/docs/images/console.png)

Local storage output:
![Console output](https://raw.githubusercontent.com/xnodeoncode/i45-jslogger/main/docs/images/local-storage.png)

## Logging Levels

Filter by logging levels in the Console.

Console set to display warning and errors only.
![Logging levels](https://raw.githubusercontent.com/xnodeoncode/i45-jslogger/main/docs/images/logging-levels.png)

## Class/Module Usage

### Using Default Logger

```javascript
import logger from "i45-jslogger";

export class MyClass {
  // private field for logging.
  #loggingEnabled;

  constructor() {
    this.#loggingEnabled = false;
  }

  enableLogging(value = false) {
    if (typeof value !== "boolean") {
      this.#error(
        `The method enableLogging() expected a boolean, but got ${typeof value}`,
        true
      );
    }
    this.#loggingEnabled = value;
  }

  doSomething() {
    // log the action.
    this.#info("We've just done something");
  }

  #info(message, ...args) {
    if (this.#loggingEnabled) {
      logger.info(message, ...args);
    }
  }

  #warn(message, ...args) {
    if (this.#loggingEnabled) {
      logger.warn(message, ...args);
    }
  }

  #error(message, throwError = false, ...args) {
    if (this.#loggingEnabled) {
      logger.error(message, ...args);
    }

    // Even when logging is disabled, an error can be thrown when necessary.
    if (throwError) {
      throw new Error(message, ...args);
    }
  }
}
```

### Using Custom Logger Instance

```javascript
import { Logger } from "i45-jslogger";

export class MyClass {
  // private field for logging.
  #loggingEnabled;
  #logger;

  constructor() {
    this.#loggingEnabled = false;
    this.#logger = new Logger();
  }

  enableLogging(value = false) {
    if (typeof value !== "boolean") {
      // if logging is enabled, the error will be logged and also thrown to stop further processing.
      // the second parameter, throwError, determines if the error is thrown or not.
      this.#error(
        `The method enableLogging() expected a boolean, but got ${typeof value}`,
        true
      );
    }
    this.#loggingEnabled = value;
  }

  doSomething() {
    //... method code

    // log the action.
    this.#info("We've just done something");
  }

  #info(message, ...args) {
    if (this.#loggingEnabled) {
      this.#logger.info(message, ...args);
    }
  }

  #warn(message, ...args) {
    if (this.#loggingEnabled) {
      this.#logger.warn(message, ...args);
    }
  }

  #error(message, throwError = false, ...args) {
    if (this.#loggingEnabled) {
      this.#logger.error(message, ...args);
    }

    // Even when logging is disabled, an error can be thrown when necessary.
    if (throwError) {
      throw new Error(message, ...args);
    }
  }
}

var myClass = new MyClass();
myClass.enableLogging(true);
myClass.doSomething();
```

```
// console output
[INFO] 2025-08-26T14:41:25.073z: We've just done something.
```

## Using a Custom Logger (Client)

i45-jslogger accepts additional clients, such as a file system logger, as long as the required methods are implemented.

Required methods:

- log()
- info()
- warn()
- error()

Add a new logger with:

```javascript
// Using default instance
import logger from "i45-jslogger";
logger.addClient(myCustomLogger);

// OR using custom instance
import { Logger } from "i45-jslogger";
const logger = new Logger();
logger.addClient(myCustomLogger);
```

Each method call on i45-jslogger will result in the corresponding method on clients. Client calls are synchronous and in the order that the clients were added. See the sample code below.

### Complete Example

```javascript
import { Logger } from "i45-jslogger";

export class MyClass {
  // private field for logging.
  #loggingEnabled;
  #logger;

  constructor() {
    this.#logger = new Logger();

    // logging can be enabled/disabled either in the consuming class, or on the logger itself.
    // For example: this.#logger.loggingEnabled = true|false;
    this.#loggingEnabled = true;
  }

  enableLogging(value = false) {
    if (typeof value !== "boolean") {
      // if logging is enabled, the error will be logged and optionally thrown to stop further execution.

      // the second parameter, throwError, is optional, but can be used to throw the error if logging is disabled.
      this.#error(
        `The method enableLogging() expected a boolean, but got ${typeof value}`,
        true
      );
    }
    this.#loggingEnabled = value;
    return this;
  }

  doSomething() {
    try {
      // log the action.
      this.#info("Working on something");

      //... method code
    } catch (e) {
      // log and/or throw the error. [See method below.]
      this.#error("An error occurred.", true, e);
    } finally {
      this.#info("Something is done.");
    }
    return this;
  }

  useCustomLogger(myCustomLogger) {
    // add new client
    // multiple clients can be added.
    // Client calls are synchronous and occur in the order that clients are added.
    // Logger.info() calls -> customLogger1.info(), customLogger2.info(), ...etc.
    this.#logger.addClient(myCustomLogger);

    return this;
  }

  #info(message, ...args) {
    if (this.#loggingEnabled) {
      this.#logger.info(message, ...args);
    }
    return this;
  }

  #warn(message, ...args) {
    if (this.#loggingEnabled) {
      this.#logger.warn(message, ...args);
    }
    return this;
  }

  #error(message, throwError = false, ...args) {
    if (this.#loggingEnabled) {
      this.#logger.error(message, ...args);
    }

    // An error can still be thrown with logging disabled.
    if (throwError) {
      throw new Error(message, ...args);
    }
    return this;
  }
}

var myClass = new MyClass();
myClass.useCustomLogger(myCustomLogger).enableLogging(true);
myClass.doSomething();
```

## Event Listeners

i45-jslogger dispatches custom events on the window object. An [EventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) can be used to subscribe to the events.

The following dispatch events are (case-sensitive):

- "LOG"
- "INFO"
- "WARN"
- "ERROR"

To capture the event, add an event listener as below.

```javascript
window.addEventListener("LOG", (event) => {
  console.log("Custom event received:", event.detail);
});

window.addEventListener("INFO", (event) => {
  console.log("Custom event received:", event.detail);
});

window.addEventListener("WARN", (event) => {
  console.log("Custom event received:", event.detail);
});

window.addEventListener("ERROR", (event) => {
  console.log("Custom event received:", event.detail);
});
```

### Disable Events

Window events are enabled by default, and can be disabled using:

```javascript
// Using default instance
import logger from "i45-jslogger";
logger.enableEvents = false;

// OR using custom instance
import { Logger } from "i45-jslogger";
const logger = new Logger();
logger.enableEvents = false;
```
