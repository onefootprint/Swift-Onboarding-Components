import EventEmitter from './event-emmiter';

describe('EventEmitter', () => {
  it('should subscribe to an event', () => {
    const callbackMockFn = jest.fn();

    const eventEmitter = new EventEmitter();
    eventEmitter.on('foo', callbackMockFn);
    eventEmitter.emit('foo');

    expect(callbackMockFn).toHaveBeenCalled();
  });

  it('should unsubscribe to an event', () => {
    const callbackMockFn = jest.fn();

    const eventEmitter = new EventEmitter();
    const off = eventEmitter.on('foo', callbackMockFn);
    off();
    eventEmitter.emit('foo');
    expect(callbackMockFn).not.toHaveBeenCalled();
  });
});
