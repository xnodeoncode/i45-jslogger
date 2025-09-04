export function anotherLogger() {
  this.name = "anotherLogger";
  // Implementation of anotherLogger
  this.info = function (message = "", ...args) {
    console.info(
      `[ANOTHER LOGGER] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };
  this.warn = function (message = "", ...args) {
    console.warn(
      `[ANOTHER LOGGER] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };
  this.error = function (message = "", ...args) {
    console.error(
      `[ANOTHER LOGGER] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };
  this.log = function (message = "", ...args) {
    console.log(
      `[ANOTHER LOGGER] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };
  this.getEvents = function () {
    return [];
  };
}
