import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUserInLive, asAdminUserInSandbox, resetUser } from 'src/config/tests';

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
