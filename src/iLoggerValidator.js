export class iLoggerValidator {
  static isValid(object, interfaceDefinition) {
    for (const method in interfaceDefinition) {
      if (!(method in object) || typeof object[method] !== "function") {
        return false;
      }
    }
    return true;
  }
}
