[NodeJS package](https://www.npmjs.com/package/i45-jslogger)

A browser based logger to track events during development and testing. Log entries are written to the console as well as stored in localStorage.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Logging Levels](#logging-levels)
- [Using a class/module](#classmodule-usage)
- [Using a Custom Logger (Client)](#using-a-custom-logger-client)

## Properties

i45-jslogger exposes the following properties:

- loggingEnabled:_boolean_
  - Enables/disables logging.
- suppressNative:_boolean_
  - Enables/disables native logging, client logs and dispatch events are not affected.
- suppressConsole:_boolean_
  - Enables/disables console messages.

## Methods

i45-jslogger exposes the following methods:

- log():_this_
  - Executes the log method for all registered clients.
- info():_this_
  - Executes the info method for all registered clients.
- warn():_this_
  - Executes the warn method for all registered clients.
- error():_this_
  - Executes the error message for all registered clients.
- isValidClient():_boolean_
  - Validates that a client has the required methods.
- addClient():_this_
  - Validates that a client has the required methods and adds it to the collection.
- removeClient():_this_
  - Removes a client by name.
- clients():_Array_
  - Returns an array of all registered clients.
- removeAllClients():_this_
  - Clears all registered clients.
- addEvent():_this_
  - Adds an event to the event log without logging.
- getEvents():_Array_
  - Returns an array of all events captured in the event log.
- clearEvents():_this_
  - Removes all events from local storage and the console.

## Installation

```javascript
npm i i45-jslogger
```

## Usage

```javascript
import { Logger } from "i45-jslogger";

var logger = new Logger();

logger.info("This is an info message.");
logger.warn("This is a warn message.");
logger.error("This is an error message.");
```

Console output:
![Console output](console.png)

Local storage output:
![Local storage](local-storage.png)

## Logging Levels

Set logging levels in the Console.

Console set to display warning and errors only.
![Logging levels](logging-levels.png)

## Class/Module Usage

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
      this.#error(`The method enableLogging() expected a boolean, but got ${typeof value}`, true);
    }
    this.#loggingEnabled = value;
  }

  doSomething(){

    //... method code

    // log the action.
    this.#info("We've just done somethings".);
  }

  #info(message, ...args){
    if(this.#loggingEnabled){
      this.#logger.info(messge, ...args);
    }
  }

  #warn(message, ...args){
    if(this.#loggingEnabled){
      this.#logger.warn(message, ...args);
    }
  }

  #error(message, throwError = false, ...args){
    if(this.#loggingEnabled){
      this.#logger.error(message, ...args);
    }

    // Even when logging is disabled, an error can be thrown when necessary.
    if(throwError){
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

i45-jslogger accepts additional clients as long as the required methods are implemented.

Required methods:

- log()
- info()
- warn()
- error()
- getEvents()

Add a new logger with:

```javascript
import { Logger } from "i45-jslogger";

var logger = new Logger();
logger.addClient(myCustomLogger);
```

Each call to a method on i45-jslogger will call the corresponding method on each custom logger added.

### Complete Example

```javascript

import { Logger } from "i45-jslogger";

export class MyClass {
  // private field for logging.
  #loggingEnabled;
  #logger;

  constructor() {
    this.#logger = new Logger();

    // logging can be enabled/disabled either in the consuming class, or on the logger itself. For example: this.#logger.loggingEnabled = true|false;
    this.#loggingEnabled = true;
  }

  enableLogging(value = false) {
    if (typeof value !== "boolean") {
      // if logging is enabled, the error will be logged and optionally thrown to stop further execution.

      // the second parameter, throwError, is optional, but can be used to throw the error if logging is disabled.
      this.#error(`The method enableLogging() expected a boolean, but got ${typeof value}`, throwError=true);
    }
    this.#loggingEnabled = value;
  }

  doSomething(){

    try {
        // log the action.
        this.#info("We're working on somethings".);

        //... method code

    } catch (e){

        // log and/or throw the error. [See method below.]
        this.#error("An error occurred.",throwError = true, e);

    } finally {

        this.#info("We're done.");
    }
    return this;
  }

  useCustomLogger(myCustomLogger){
    // add new client
    // multiple clients can be added.
    // the logging events on each client is called in the order that they were added.
    // customLogger1.info(), customLogger2.info(),...
      this.#logger.addClient(myCustomLogger);
  }

  #info(message, ...args){
    if(this.#loggingEnabled){
      this.#logger.info(messge, ...args);
    }
  }

  #warn(message, ...args){
    if(this.#loggingEnabled){
      this.#logger.warn(message, ...args);
    }
  }

  #error(message, throwError = false, ...args){
    if(this.#loggingEnabled){
      this.#logger.error(message, ...args);
    }

    // An error can still be thrown with logging disabled.
    if(throwError){
      throw new Error(message, ...args);
    }
  }
}

var myClass = new MyClass();
myClass.useCustomLogger(myCustomLogger);
myClass.enableLogging(true);
myClass.doSomething();
```

## Event Listeners

i45-jslogger dispatches custom events on the window object. An EventListener can be used to subscribe to the events.

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

Window events can be disabled using:

```javascript
import { Logger } from "i45-jslogger";

const logger = new Logger();

//disable window events
logger.dispatchEvents = false;
```
