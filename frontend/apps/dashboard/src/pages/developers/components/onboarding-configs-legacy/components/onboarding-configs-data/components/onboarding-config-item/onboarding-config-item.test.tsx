import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import {
  liveOnboardingKey,
  sandboxOnboardingConfig,
} from './__fixtures__/onboarding-config';
import type { OnboardingConfigItemProps } from './onboarding-config-item';
import ListItem from './onboarding-config-item';

describe('<OnboardingConfigItem />', () => {
  describe('when in sandbox', () => {
    const renderSandboxListItem = ({
      data = sandboxOnboardingConfig,
    }: Partial<OnboardingConfigItemProps>) =>
      customRender(<ListItem data={data} />);

    it('should show a link button "Test onboarding configuration"', () => {
      renderSandboxListItem({});

      const link = screen.getByRole('link', {
        name: 'Test onboarding configuration',
      });
      expect(link).toBeInTheDocument();

      const href = link.getAttribute('href');
      expect(
        href?.includes(`/preview?ob_key=${sandboxOnboardingConfig.key}`),
      ).toBeTruthy();
    });
  });

  describe('when in live', () => {
    const renderLiveListItem = ({
      data = liveOnboardingKey,
    }: Partial<OnboardingConfigItemProps>) =>
      customRender(<ListItem data={data} />);

    it('should NOT show the button "Test onboarding configuration"', () => {
      renderLiveListItem({});

      const link = screen.queryByRole('link', {
        name: 'Test onboarding configuration',
      });
      expect(link).not.toBeInTheDocument();
    });
  });
});
