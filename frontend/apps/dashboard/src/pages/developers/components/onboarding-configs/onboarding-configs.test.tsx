import React from 'react';
import { customRender, screen, userEvent, waitFor, within } from 'test-utils';

import OnboardingConfigs from './onboarding-configs';
import {
  onboardingConfig,
  withOnboardingConfigs,
  withUpdateOnboardingConfigs,
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
        const item = await screen.findByTestId(
          `onboarding-config-${onboardingConfig.id}`,
        );
        const name = within(item).getByText(onboardingConfig.name);
        expect(name).toBeInTheDocument();
        const createdAt = within(item).getByText('7/20/22, 1:52 AM', {
          exact: false,
        });
        expect(createdAt).toBeInTheDocument();
        const mustCollectList = within(item).getByTestId(
          `must-collect-data-kinds-${onboardingConfig.id}`,
        );
        expect(
          within(mustCollectList).getByText('First name'),
        ).toBeInTheDocument();
        expect(
          within(mustCollectList).getByText('Last name'),
        ).toBeInTheDocument();
        const canAccessList = within(item).getByTestId(
          `can-access-data-kinds-${onboardingConfig.id}`,
        );
        expect(
          within(canAccessList).getByText('Date of birth'),
        ).toBeInTheDocument();
        const onboardingKey = within(item).getByText(onboardingConfig.key);
        expect(onboardingKey).toBeInTheDocument();
        const status = within(item).getByText('Enabled', { exact: false });
        expect(status).toBeInTheDocument();
      });
    });
  });

  describe('when toggling the status', () => {
    beforeAll(() => {
      withOnboardingConfigs();
    });

    it('should change the status from enabled to disabled', async () => {
      withUpdateOnboardingConfigs(onboardingConfig, { status: 'Disabled' });
      renderOnboardingConfigs();
      const item = await screen.findByTestId(
        `onboarding-config-${onboardingConfig.id}`,
      );
      const prevStatus = within(item).getByText('Enabled', {
        exact: false,
      });
      expect(prevStatus).toBeInTheDocument();
      const disableButton = screen.getByRole('button', { name: 'Disable' });
      await userEvent.click(disableButton);
      await waitFor(() => {
        const newStatus = within(item).getByText('Disabled', {
          exact: false,
        });
        expect(newStatus).toBeInTheDocument();
      });
    });
  });
});
