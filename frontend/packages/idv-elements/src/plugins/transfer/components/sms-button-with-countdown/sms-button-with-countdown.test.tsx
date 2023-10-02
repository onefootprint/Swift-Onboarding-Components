import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import TestWrapper from '../../test-utils/test-wrapper';
import type { SmsButtonWithCountdownProps } from './sms-button-with-countdown';
import SmsButtonWithCountdown from './sms-button-with-countdown';
import withD2PSms from './sms-button-with-countdown.test.config';

describe('<SmsButtonWithCountdown />', () => {
  const renderSmsButtonWithCountdown = ({
    url,
    authToken,
  }: Partial<SmsButtonWithCountdownProps> = {}) =>
    customRender(
      <TestWrapper>
        <SmsButtonWithCountdown url={url} authToken={authToken} />
      </TestWrapper>,
    );

  describe('when sending sms succeeds', () => {
    beforeEach(() => {
      withD2PSms();
    });

    it('starts countdown on initial render', async () => {
      renderSmsButtonWithCountdown({
        authToken: 'tok_123',
        url: 'www.fp.com',
      });
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBeTruthy();
      await waitFor(() => {
        expect(screen.getByText(/Please wait.+/)).toBeInTheDocument();
      });
    });
  });
});
