import { iLogger } from "./iLogger.js";

export class iLoggerValidator {
  static isValid(object, interfaceDefinition) {
    if (!object) return false;
    switch (arguments.length) {
      case 1:
        interfaceDefinition = iLogger;
        break;
      case 2:
        interfaceDefinition = arguments[1];
        break;
      default:
        console.warn("Invalid number of arguments");
        return false;
    }
    if (!interfaceDefinition) {
      console.warn("Interface definition is not provided.");
      return false;
    }

    var count = 0;

    for (const method of interfaceDefinition) {
      if (object[method] && typeof object[method] === "function") {
        count++;
      } else {
      }
    }
    return count === interfaceDefinition.length;
  }
}
