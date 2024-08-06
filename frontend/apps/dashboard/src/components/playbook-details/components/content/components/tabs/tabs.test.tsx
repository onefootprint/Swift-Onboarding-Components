import { customRender, screen } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';

import Tabs from './tabs';
import playbookFixture from './tabs.test.config';

const renderTabs = (playbook: OnboardingConfig) => {
  customRender(<Tabs playbook={playbook} isTabsDisabled={false} toggleDisableHeading={jest.fn()} />);
};

describe('<Tabs />', () => {
  it('should render the default tabs', () => {
    renderTabs(playbookFixture);

    const dataCollection = screen.getByRole('tab', { name: 'Data collection' });
    expect(dataCollection).toBeInTheDocument();

    const aml = screen.getByRole('tab', { name: 'AML monitoring' });
    expect(aml).toBeInTheDocument();

    const rules = screen.getByRole('tab', { name: 'Rules' });
    expect(rules).toBeInTheDocument();
  });
});
