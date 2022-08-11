import React from 'react';
import { customRender, screen } from 'test-utils';

import {
  liveOnboardingKey,
  sandboxOnboardingConfig,
} from './__fixtures__/onboarding-config';
import type { ListItemProps } from './list-item';
import ListItem from './list-item';

describe('<ListItem />', () => {
  describe('when in sandbox', () => {
    const renderSandboxListItem = ({
      data = sandboxOnboardingConfig,
    }: Partial<ListItemProps>) => customRender(<ListItem data={data} />);

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
    }: Partial<ListItemProps>) => customRender(<ListItem data={data} />);

    it('should NOT show the button "Test onboarding configuration"', () => {
      renderLiveListItem({});

      const link = screen.queryByRole('link', {
        name: 'Test onboarding configuration',
      });
      expect(link).not.toBeInTheDocument();
    });
  });
});
