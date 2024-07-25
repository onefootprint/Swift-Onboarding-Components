import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import Passkeys from './passkeys';
import {
  playbookWithPasskeysFixture,
  playbookWithoutPasskeysFixture,
  withUpdatePlaybook,
  withUpdatePlaybookError,
} from './passkeys.test.config';

describe('Passkeys', () => {
  const renderPasskeys = (playbook = playbookWithPasskeysFixture) => customRender(<Passkeys playbook={playbook} />);

  describe('when the passkeys is enabled', () => {
    it('should render the switch correctly', () => {
      renderPasskeys();

      const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });
  });

  describe('when the passkeys is disabled', () => {
    it('should render the switch correctly', () => {
      renderPasskeys(playbookWithoutPasskeysFixture);

      const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });
  });

  describe('when updating the passkeys', () => {
    describe('when it fails', () => {
      beforeEach(() => {
        withUpdatePlaybookError(playbookWithoutPasskeysFixture);
      });

      it('should render the switch correctly', async () => {
        renderPasskeys();

        const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
        await userEvent.click(toggle);

        await waitFor(() => {
          expect(toggle.checked).toBe(false);
        });
      });
    });

    describe('when it succeeds', () => {
      beforeEach(() => {
        withUpdatePlaybook(playbookWithoutPasskeysFixture);
      });

      it('should render the switch correctly', async () => {
        renderPasskeys();

        const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
        await userEvent.click(toggle);

        expect(toggle.checked).toBe(false);
      });
    });
  });
});
