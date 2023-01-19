import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

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
        data: {
          auth: '1',
          user: {
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: false,
            name: 'Acme',
            isSandboxRestricted: false,
            logoUrl: null,
          },
        },
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
        expect(useStore.getState().data?.org.isLive).toBeTruthy();
        const banner = screen.queryByRole('alert');
        expect(banner).not.toBeInTheDocument();
      });
    });
  });

  describe('when sandbox is enabled, but is restricted', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          auth: '1',
          user: {
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: false,
            name: 'Acme',
            isSandboxRestricted: true,
            logoUrl: null,
          },
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
        data: {
          auth: '1',
          user: {
            email: 'jane.doe@acme.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          org: {
            isLive: true,
            name: 'Acme',
            isSandboxRestricted: false,
            logoUrl: null,
          },
        },
      });
    });

    it('should NOT show the banner', () => {
      renderSandboxBanner();
      const banner = screen.queryByRole('alert');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
