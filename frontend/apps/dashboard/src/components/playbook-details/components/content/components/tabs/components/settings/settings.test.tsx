import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { OnboardingConfigKind } from '@onefootprint/types';
import Settings from './settings';
import {
  playbookWithPasskeysFixture,
  playbookWithoutPasskeysFixture,
  withUpdatePlaybook,
  withUpdatePlaybookError,
} from './settings.test.config';

describe('Settings', () => {
  const renderSettings = (playbook = playbookWithPasskeysFixture) => customRender(<Settings playbook={playbook} />);

  describe('when the settings is enabled', () => {
    it('should render the switch correctly', () => {
      renderSettings();

      const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });
  });

  describe('when the settings is disabled', () => {
    it('should render the switch correctly', () => {
      renderSettings(playbookWithoutPasskeysFixture);

      const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });
  });

  describe('when updating the passkeys settings', () => {
    describe('when it fails', () => {
      beforeEach(() => {
        withUpdatePlaybookError(playbookWithoutPasskeysFixture);
      });

      it('should render the switch correctly', async () => {
        renderSettings();

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
        renderSettings();

        const toggle = screen.getByRole('switch', { name: 'Enable passkey registration' }) as HTMLInputElement;
        await userEvent.click(toggle);

        expect(toggle.checked).toBe(false);
      });
    });
  });

  describe('reonboard settings', () => {
    beforeEach(() => {
      withUpdatePlaybook(playbookWithoutPasskeysFixture);
    });

    it('should not render the switch for KYC playbook', async () => {
      renderSettings();
      expect(screen.queryByRole('switch', { name: 'Allow reonboarding' })).toBeFalsy();
    });

    it('should render the switch correctly for KYB', async () => {
      renderSettings({
        ...playbookWithPasskeysFixture,
        kind: OnboardingConfigKind.kyb,
      });

      const toggle = screen.getByRole('switch', { name: 'Allow reonboarding' }) as HTMLInputElement;
      await userEvent.click(toggle);

      expect(toggle.checked).toBe(true);
    });
  });

  describe('when the skip confirm is enabled', () => {
    it('should render the switch correctly', () => {
      renderSettings({ ...playbookWithPasskeysFixture, skipConfirm: true });

      const toggle = screen.getByRole('switch', { name: 'Skip confirmation screen' }) as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });
  });

  describe('when the skip confirm is disabled', () => {
    it('should render the switch correctly', () => {
      renderSettings({ ...playbookWithPasskeysFixture, skipConfirm: false });

      const toggle = screen.getByRole('switch', { name: 'Skip confirmation screen' }) as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });
  });

  describe('when updating the skip confirm settings', () => {
    describe('when it fails', () => {
      beforeEach(() => {
        withUpdatePlaybookError({ ...playbookWithPasskeysFixture, skipConfirm: false });
      });

      it('should render the switch correctly', async () => {
        renderSettings();

        const toggle = screen.getByRole('switch', { name: 'Skip confirmation screen' }) as HTMLInputElement;
        await userEvent.click(toggle);

        await waitFor(() => {
          expect(toggle.checked).toBe(false);
        });
      });
    });

    describe('when it succeeds', () => {
      beforeEach(() => {
        withUpdatePlaybook({ ...playbookWithPasskeysFixture, skipConfirm: false });
      });

      it('should render the switch correctly', async () => {
        renderSettings({ ...playbookWithPasskeysFixture, skipConfirm: true });

        const toggle = screen.getByRole('switch', { name: 'Skip confirmation screen' }) as HTMLInputElement;
        await userEvent.click(toggle);

        expect(toggle.checked).toBe(false);
      });
    });
  });
});
