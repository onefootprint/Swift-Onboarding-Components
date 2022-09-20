import React from 'react';
import { useStore } from 'src/hooks/use-session-user';
import { customRender, screen, userEvent } from 'test-utils';

import SandboxBanner from './sandbox-banner';

const originalState = useStore.getState();

describe('<SandboxBanner />', () => {
  afterAll(() => {
    useStore.setState(originalState);
  });

  const renderSandboxBanner = () => customRender(<SandboxBanner />);

  describe('when sandbox is enabled', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
      });
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
        expect(useStore.getState().isLive).toBeTruthy();
        const banner = screen.queryByRole('alert');
        expect(banner).not.toBeInTheDocument();
      });
    });
  });

  describe('when sandbox is enabled, but is restricted', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
        data: {
          auth: 'vtok_X7n2zMasfrMSCp8DQJD56cnDojCJUtaUKRzKKF',
          email: 'joe@doe.com',
          firstName: 'Joe',
          lastName: 'Doe',
          sandboxRestricted: true,
          tenantName: 'Acme Bank',
        },
      });
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
      useStore.setState({
        isLive: true,
      });
    });

    it('should NOT show the banner', () => {
      renderSandboxBanner();
      const banner = screen.queryByRole('alert');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
