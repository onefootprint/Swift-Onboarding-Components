import generateEventEmitter from './generate-event-emmiter';

describe('generateEventEmitter', () => {
  it('should subscribe to an event', () => {
    const callbackMockFn = jest.fn();

    const eventEmitter = generateEventEmitter();
    eventEmitter.on('foo', callbackMockFn);
    eventEmitter.emit('foo');

    expect(callbackMockFn).toHaveBeenCalled();
  });

  it('should unsubscribe to an event', () => {
    const callbackMockFn = jest.fn();

    const eventEmitter = generateEventEmitter();
    const off = eventEmitter.on('foo', callbackMockFn);
    off();
    eventEmitter.emit('foo');
    expect(callbackMockFn).not.toHaveBeenCalled();
  });
});
