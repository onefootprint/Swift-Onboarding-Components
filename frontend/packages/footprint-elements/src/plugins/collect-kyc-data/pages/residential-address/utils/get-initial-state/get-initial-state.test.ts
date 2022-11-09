import getInitialState from './get-initial-state';

describe('getInitialState', () => {
  it('should return undefined if nothing was passed in', () => {
    expect(getInitialState()).toBeUndefined();
  });

  it('should return the state if self if is not an US state', () => {
    expect(getInitialState('lorem')).toEqual('lorem');
  });

  it('should return the state object if it is passed in', () => {
    expect(getInitialState('CA')).toEqual({
      value: 'CA',
      label: 'California',
    });
  });
});
