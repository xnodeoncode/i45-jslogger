export class EventLog {
  constructor() {
    this.events = [];
  }

  addEvent = function (type, event) {
    this.events.push({
      id: new Date().getTime(),
      type,
      event,
      timestamp: new Date().toISOString(),
    });
    window.localStorage.setItem("eventLog", JSON.stringify(this.events));
  };

  getEvents = function () {
    return this.events.length
      ? this.events
      : JSON.parse(window.localStorage.getItem("eventLog")) || [];
  };

  clear = function () {
    this.events = [];
    window.localStorage.removeItem("eventLog");
  };
}
