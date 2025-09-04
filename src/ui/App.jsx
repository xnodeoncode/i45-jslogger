import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Logger, iLogger } from "../logger";
import { CustomLogger } from "../modules/customLogger.js";
import { anotherLogger } from "../modules/anotherLogger.js";
import { yetAnotherLogger } from "../modules/yetAnotherLogger.js";

const logger = new Logger();
const customLogger = new CustomLogger();
const anotherLoggerInstance = new anotherLogger();

logger.suppressConsole = false;
logger.dispatchEvents = true;
logger.suppressNative = false;
logger.loggingEnabled = true;

console.log("isValidClient:", logger.isValidClient(customLogger, iLogger));
logger.addClient(customLogger);
logger.addClient(anotherLoggerInstance);
logger.addClient(new yetAnotherLogger());

logger.info("Now logging with three clients.");
logger.log("This is a log message.");
logger.warn("This is a warning message.");
logger.error("This is an error message.");

window.addEventListener("INFO", (event) => {
  console.log("Custom event received:", event.detail);
});
window.addEventListener("WARN", (event) => {
  console.log("Custom event received:", event.detail);
});
window.addEventListener("ERROR", (event) => {
  console.log("Custom event received:", event.detail);
});

function App() {
  const [count, setCount] = useState(0);
  logger.info("App component rendered");

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
