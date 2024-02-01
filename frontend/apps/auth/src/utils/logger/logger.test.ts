import { describe, expect, mock, test } from 'bun:test';

import getLogger from './logger';

const noop = () => undefined;
const errorMock = mock(noop);
const warnMock = mock(noop);
const infoMock = mock(noop);

mock.module('@onefootprint/idv', () => ({
  Logger: {
    error: errorMock,
    info: infoMock,
    warn: warnMock,
    setupSentry: () => undefined,
    setupLogRocket: () => undefined,
    identify: () => undefined,
    track: () => undefined,
  },
}));

describe('getLogger', () => {
  test('it should call the logger with the correct location and message', () => {
    const { logError, logInfo, logWarn } = getLogger('location');
    logError('error');
    logInfo('info');
    logWarn('warn');

    expect(errorMock).toHaveBeenCalledTimes(1);
    expect(errorMock.mock.calls[0].join('|')).toEqual('error |location');

    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock.mock.calls[0].join('|')).toEqual('info |location');

    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(warnMock.mock.calls[0].join('|')).toEqual('warn |location');
  });
});
