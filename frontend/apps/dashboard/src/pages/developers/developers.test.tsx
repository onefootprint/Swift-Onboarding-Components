import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';
import {
  asAdminUserInLive,
  asAdminUserInSandbox,
  resetUser,
} from 'src/config/tests';

import Developers from './developers';
import { withApiKeys, withOnboardingConfigs } from './developers.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Developers />', () => {
  beforeEach(() => {
    withApiKeys();
    withOnboardingConfigs();
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'api_keys',
      },
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderDevelopers = () => customRender(<Developers />);

  describe('when is in sandbox mode', () => {
    beforeEach(() => {
      asAdminUserInSandbox();
    });

    it('should show a warning message', () => {
      renderDevelopers();
      const warning = screen.getByText(
        "You're viewing test keys. Disable sandbox mode to view live keys.",
      );
      expect(warning).toBeInTheDocument();
    });
  });

  describe('when is in live mode', () => {
    beforeEach(() => {
      asAdminUserInLive();
    });

    it('should show an info message', () => {
      renderDevelopers();
      const info = screen.getByText(
        "You're viewing live keys. Enable sandbox mode to view test keys.",
      );

      expect(info).toBeInTheDocument();
    });
  });
});
