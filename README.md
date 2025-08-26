[NodeJS package](https://www.npmjs.com/package/i45-jslogger)

A basic logger to track events during development and testing. Log entries are written to the console as well as stored in localStorage.

Useful for tracking events when step through debugging is not needed.

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
