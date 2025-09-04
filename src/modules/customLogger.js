export class CustomLogger {
  constructor() {
    this.name = "CustomLogger";
  }
  log(message, ...args) {
    console.log(`[${this.name}] ${message}`, ...args);
  }
  info(message, ...args) {
    console.info(`[${this.name}] ${message}`, ...args);
  }
  warn(message, ...args) {
    console.warn(`[${this.name}] ${message}`, ...args);
  }
  error(message, ...args) {
    console.error(`[${this.name}] ${message}`, ...args);
  }
  getEvents() {
    return [];
  }
}
