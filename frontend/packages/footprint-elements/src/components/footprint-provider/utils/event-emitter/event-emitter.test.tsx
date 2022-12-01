import EventEmitter from './event-emmiter';

describe('EventEmitter', () => {
  it('should listen to an event', () => {
    const callbackMockFn = jest.fn();

    const eventEmitter = new EventEmitter();
    eventEmitter.on('foo', callbackMockFn);
    eventEmitter.emit('foo');

    expect(callbackMockFn).toHaveBeenCalled();
  });
});
