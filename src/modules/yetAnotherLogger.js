export function yetAnotherLogger() {
  this.info = function (message = "", ...args) {
    console.info(
      `[YET ANOTHER LOGGER][INFO] ${new Date().toISOString()}:`,
      message,
      ...args
    );
    window.dispatchEvent(
      new CustomEvent("yetAnotherLoggerInfo", {
        detail: { message, args, timestamp: new Date().toISOString() },
      })
    );
  };
  this.warn = function (message = "", ...args) {
    console.warn(
      `[YET ANOTHER LOGGER][WARN] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };

  this.error = function (message = "", ...args) {
    console.error(
      `[YET ANOTHER LOGGER][ERROR] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };
  this.log = function (message = "", ...args) {
    console.log(
      `[YET ANOTHER LOGGER][LOG] ${new Date().toISOString()}:`,
      message,
      ...args
    );
  };
  this.getEvents = function () {
    return [];
  };
}
