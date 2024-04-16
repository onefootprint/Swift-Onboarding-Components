import { describe, expect, it, mock } from 'bun:test';
import type { TFunction } from 'i18next';

import alertError from './alert-error';

// @ts-ignore: dump translation function
const t: TFunction<'common'> = x => x;

describe('alertError', () => {
  it('should generate an error toast with the provided message', () => {
    /** @ts-ignore: mock does not have the correct type */
    const mockedShow = mock();
    const showError = alertError(t, mockedShow);

    showError('Test Error Message');

    expect(mockedShow).toHaveBeenNthCalledWith(1, {
      description: 'Test Error Message',
      title: 'unable-to-perform-action',
      variant: 'error',
    });
  });

  it('should handle both string and Error input messages appropriately', () => {
    /** @ts-ignore: mock does not have the correct type */
    const mockedShow = mock();
    const showError = alertError(t, mockedShow);

    showError('Test Error Message');

    expect(mockedShow).toHaveBeenNthCalledWith(1, {
      description: 'Test Error Message',
      title: 'unable-to-perform-action',
      variant: 'error',
    });

    showError(new Error('Test Error'));

    expect(mockedShow).toHaveBeenNthCalledWith(2, {
      description: 'Test Error',
      title: 'unable-to-perform-action',
      variant: 'error',
    });
  });
});
