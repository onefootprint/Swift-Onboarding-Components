import { customRender, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import Init, { InitProps } from './init';
import { mockUrl, withD2pStatus } from './init.test.config';

jest.mock('expo-linking', () => ({
  __esModule: true,
  ...jest.requireActual('expo-linking'),
}));

describe.skip('<Init />', () => {
  beforeAll(() => {
    mockUrl('https://handoff.preview.onefootprint.com/?r=75#tok_ze124412421');
  });

  const renderInit = ({
    onSuccess = jest.fn(),
    onError = jest.fn(),
  }: Partial<InitProps>) => {
    return customRender(<Init onError={onError} onSuccess={onSuccess} />);
  };

  describe('when the handoff url is valid and the request to update the d2p status to inProgress succeeds', () => {
    beforeEach(() => {
      withD2pStatus();
    });

    it('should call onSuccess', async () => {
      const onSuccess = jest.fn();
      renderInit({ onSuccess });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });
});
