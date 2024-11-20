import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Tabs from './tabs';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderTabs = (playbook: OnboardingConfiguration) => {
  customRender(<Tabs playbook={playbook} isTabsDisabled={false} toggleDisableHeading={jest.fn()} />);
};

describe('<Tabs />', () => {
  it('should render the default tabs', () => {
    renderTabs({
      ...getOnboardingConfiguration({}),
      documentsToCollect: [],
    });

    const dataCollection = screen.getByRole('tab', { name: 'Data collection' });
    expect(dataCollection).toBeInTheDocument();

    const verificationChecks = screen.getByRole('tab', { name: 'Verification checks' });
    expect(verificationChecks).toBeInTheDocument();

    const settings = screen.getByRole('tab', { name: 'Settings' });
    expect(settings).toBeInTheDocument();

    const rules = screen.getByRole('tab', { name: 'Rules' });
    expect(rules).toBeInTheDocument();
  });
});
