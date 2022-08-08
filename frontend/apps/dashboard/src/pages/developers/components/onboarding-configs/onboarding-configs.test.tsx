import React from 'react';
import { customRender, screen, within } from 'test-utils';

import OnboardingConfigs from './onboarding-configs';
import {
  listOnboardingConfigsFixture,
  withOnboardingConfigs,
} from './onboarding-configs.test.config';

describe('<OnboardingConfigs />', () => {
  const renderOnboardingConfigs = () => {
    customRender(<OnboardingConfigs />);
  };

  describe('list the api keys', () => {
    describe('when listing the onboarding configs with success', () => {
      beforeAll(() => {
        withOnboardingConfigs();
      });

      it('should show the data', async () => {
        renderOnboardingConfigs();
        const [firstApiKey] = listOnboardingConfigsFixture;

        const item = await screen.findByTestId(
          `onboarding-config-${firstApiKey.id}`,
        );

        const name = within(item).getByText(firstApiKey.name);
        expect(name).toBeInTheDocument();

        const createdAt = within(item).getByText('July 20, 22, 1:52 AM', {
          exact: false,
        });
        expect(createdAt).toBeInTheDocument();

        const mustCollectList = within(item).getByTestId(
          `must-collect-data-kinds-${firstApiKey.id}`,
        );
        expect(
          within(mustCollectList).getByText('First name'),
        ).toBeInTheDocument();
        expect(
          within(mustCollectList).getByText('Last name'),
        ).toBeInTheDocument();

        const canAccessList = within(item).getByTestId(
          `can-access-data-kinds-${firstApiKey.id}`,
        );
        expect(
          within(canAccessList).getByText('Date of birth'),
        ).toBeInTheDocument();

        const onboardingKey = within(item).getByText(firstApiKey.key);
        expect(onboardingKey).toBeInTheDocument();

        const status = within(item).getByText('Enabled', { exact: false });
        expect(status).toBeInTheDocument();
      });
    });
  });
});
