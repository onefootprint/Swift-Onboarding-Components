type Events = {
  [key: string]: Function[];
};

class EventEmitter {
  public events: Events;

  constructor(events?: Events) {
    this.events = events || {};
  }

  public on(name: string, cb: Function) {
    (this.events[name] || (this.events[name] = [])).push(cb);
  }

  public emit(name: string, ...args: any[]): void {
    (this.events[name] || []).forEach(fn => fn(...args));
  }
}

export default EventEmitter;
