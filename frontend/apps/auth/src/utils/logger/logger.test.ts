/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-expect-error: Cannot find module 'bun:test'
import { describe, expect, mock, test } from 'bun:test'; // eslint-disable-line import/no-unresolved

import getLogger from './logger';

const errorMock = mock();
const warnMock = mock();
const infoMock = mock();

mock.module('@onefootprint/idv', () => ({
  Logger: {
    error: errorMock,
    info: infoMock,
    warn: warnMock,
    setupSentry: () => undefined,
    setupLogRocket: (appName: string) => undefined,
    identify: (context: unknown) => undefined,
    track: (eventName: string, customData: unknown) => undefined,
  },
}));

describe('getLogger', () => {
  test('it should call the logger with the correct location and message', () => {
    const { logError, logInfo, logWarn } = getLogger('location');
    logError('error');
    logInfo('info');
    logWarn('warn');

    expect(errorMock).toHaveBeenCalledTimes(1);
    expect(errorMock.mock.calls[0]).toEqual(['error ', 'location']);

    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock.mock.calls[0]).toEqual(['info ', 'location']);

    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(warnMock.mock.calls[0]).toEqual(['warn ', 'location']);
  });
});
