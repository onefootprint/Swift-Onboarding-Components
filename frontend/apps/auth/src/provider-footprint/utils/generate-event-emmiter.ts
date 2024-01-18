type Events = {
  [key: string]: Function[];
};

const generateEventEmitter = (eventsArgs?: Events) => {
  const events: Events = eventsArgs || {};

  const on = (name: string, cb: Function) => {
    (events[name] || (events[name] = [])).push(cb);

    return () => {
      const index = events[name].indexOf(cb);
      if (index >= 0 && events[name]) {
        events[name].splice(index);
      }
    };
  };

  const emit = (name: string, ...args: unknown[]): void => {
    (events[name] || []).forEach(fn => fn(...args));
  };

  return {
    on,
    emit,
  };
};

export default generateEventEmitter;
