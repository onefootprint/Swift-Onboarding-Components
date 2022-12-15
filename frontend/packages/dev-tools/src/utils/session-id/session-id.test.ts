import getSessionId from './session-id';

describe('getSessionId', () => {
  it('should return a session id', () => {
    const sessionId = getSessionId();
    expect(typeof sessionId).toBe('string');
  });

  it('should return the same session id that was created previously', () => {
    const sessionId = getSessionId();
    const sessionId2 = getSessionId();
    expect(sessionId).toEqual(sessionId2);
  });
});
