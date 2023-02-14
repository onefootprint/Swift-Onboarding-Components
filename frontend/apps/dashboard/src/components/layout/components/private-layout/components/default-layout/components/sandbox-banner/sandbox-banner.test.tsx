import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import {
  asAdminUserInLive,
  asAdminUserInSandbox,
  asAdminUserInSandboxAndRestricted,
  resetUser,
} from 'src/config/tests';
import { useStore } from 'src/hooks/use-session';

import SandboxBanner from './sandbox-banner';

describe('<SandboxBanner />', () => {
  afterAll(() => {
    resetUser();
  });

  const renderSandboxBanner = () => customRender(<SandboxBanner />);

  describe('when sandbox is enabled', () => {
    beforeEach(() => {
      asAdminUserInSandbox();
    });

    it('should show the banner', () => {
      renderSandboxBanner();
      const banner = screen.getByRole('alert');
      expect(banner).toBeInTheDocument();
    });

    describe('when clicking on the toggle button', () => {
      it('should switch to the live mode', async () => {
        renderSandboxBanner();
        const toggle = screen.getByRole('button', { name: 'Disable' });
        await userEvent.click(toggle);
        expect(useStore.getState().data?.org.isLive).toBeTruthy();
        const banner = screen.queryByRole('alert');
        expect(banner).not.toBeInTheDocument();
      });
    });
  });

  describe('when sandbox is enabled, but is restricted', () => {
    beforeEach(() => {
      asAdminUserInSandboxAndRestricted();
    });

    it('should show the banner', () => {
      renderSandboxBanner();
      const banner = screen.getByRole('alert');
      expect(banner).toBeInTheDocument();
    });

    it('should show the toggle button disabled', () => {
      renderSandboxBanner();
      const button = screen.queryByRole('button', { name: 'Disable' });
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('when sandbox is disabled', () => {
    beforeEach(() => {
      asAdminUserInLive();
    });

    it('should not show the banner', () => {
      renderSandboxBanner();
      const banner = screen.queryByRole('alert');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
