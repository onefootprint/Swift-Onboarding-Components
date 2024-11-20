import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import Settings from './settings';
import { withUpdatePlaybook, withUpdatePlaybookError } from './settings.test.config';

describe('Settings', () => {
  const renderSettings = (playbook: OnboardingConfiguration) => customRender(<Settings playbook={playbook} />);

  describe('when the settings is enabled', () => {
    it('should render the switch correctly', () => {
      renderSettings(getOnboardingConfiguration({ kind: 'kyc' }));
      const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Enable passkey registration' });
      expect(toggle.checked).toBe(true);
    });
  });

  describe('when the settings is disabled', () => {
    it('should render the switch correctly', () => {
      renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', promptForPasskey: false }) });

      const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Enable passkey registration' });
      expect(toggle.checked).toBe(false);
    });
  });

  describe('when updating the passkeys settings', () => {
    describe('when it fails', () => {
      beforeEach(() => {
        withUpdatePlaybookError({ ...getOnboardingConfiguration({ kind: 'kyc', promptForPasskey: false }) });
      });

      it('should render the switch correctly', async () => {
        renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', promptForPasskey: true }) });

        const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Enable passkey registration' });
        await userEvent.click(toggle);

        await waitFor(() => {
          expect(toggle.checked).toBe(false);
        });
      });
    });

    describe('when it succeeds', () => {
      beforeEach(() => {
        withUpdatePlaybook({ ...getOnboardingConfiguration({ kind: 'kyc', promptForPasskey: false }) });
      });

      it('should render the switch correctly', async () => {
        renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', promptForPasskey: true }) });

        const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Enable passkey registration' });
        await userEvent.click(toggle);

        expect(toggle.checked).toBe(false);
      });
    });
  });

  describe('when the skip confirm is enabled', () => {
    it('should render the switch correctly', () => {
      renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', skipConfirm: true }) });

      const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Skip confirmation screen' });
      expect(toggle.checked).toBe(true);
    });
  });

  describe('when the skip confirm is disabled', () => {
    it('should render the switch correctly', () => {
      renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', skipConfirm: false }) });

      const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Skip confirmation screen' });
      expect(toggle.checked).toBe(false);
    });
  });

  describe('when updating the skip confirm settings', () => {
    describe('when it fails', () => {
      beforeEach(() => {
        withUpdatePlaybookError({ ...getOnboardingConfiguration({ kind: 'kyc', skipConfirm: false }) });
      });

      it('should render the switch correctly', async () => {
        renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', skipConfirm: true }) });

        const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Skip confirmation screen' });
        await userEvent.click(toggle);

        await waitFor(() => {
          expect(toggle.checked).toBe(false);
        });
      });
    });

    describe('when it succeeds', () => {
      beforeEach(() => {
        withUpdatePlaybook({ ...getOnboardingConfiguration({ kind: 'kyc', skipConfirm: false }) });
      });

      it('should render the switch correctly', async () => {
        renderSettings({ ...getOnboardingConfiguration({ kind: 'kyc', skipConfirm: true }) });

        const toggle = screen.getByRole<HTMLInputElement>('switch', { name: 'Skip confirmation screen' });
        await userEvent.click(toggle);

        expect(toggle.checked).toBe(false);
      });
    });
  });
});
