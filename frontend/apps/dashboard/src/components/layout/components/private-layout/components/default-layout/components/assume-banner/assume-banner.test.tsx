import { createUseRouterSpy, customRender, screen } from '@onefootprint/test-utils';
import React from 'react';
import { asAssumedUser, asUser, resetUser } from 'src/config/tests';

import AssumeBanner from './assume-banner';

const useRouterSpy = createUseRouterSpy();

describe('<AssumeBanner />', () => {
  afterAll(() => {
    resetUser();
  });

  const renderAssumeBanner = () => customRender(<AssumeBanner />);

  describe('when assuming a tenant', () => {
    useRouterSpy({ pathname: '/users' });
    beforeEach(() => {
      asAssumedUser();
    });

    it('should show the banner', () => {
      renderAssumeBanner();
      const banner = screen.getByRole('alert');
      expect(banner).toBeInTheDocument();
    });
  });

  describe('when not assuming a tenant', () => {
    beforeEach(() => {
      useRouterSpy({ pathname: '/users' });
      asUser();
    });

    it('should not show the banner', () => {
      renderAssumeBanner();
      const banner = screen.queryByRole('alert');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
