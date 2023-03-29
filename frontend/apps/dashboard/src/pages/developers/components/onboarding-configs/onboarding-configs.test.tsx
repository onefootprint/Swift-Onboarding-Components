import { createUseRouterSpy, customRender } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import OnboardingConfigs from './onboarding-configs';

const useRouterSpy = createUseRouterSpy();

/*
  TODO: add tests once implemented
*/

describe.skip('<OnboardingConfigs />', () => {
  const renderOnboardingConfigs = () => customRender(<OnboardingConfigs />);

  beforeAll(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  beforeEach(() => {
    useRouterSpy({
      pathname: '/developers',
      query: {
        tab: 'onboarding-configs',
      },
    });
  });

  it('should render', () => {
    renderOnboardingConfigs();
  });
});
