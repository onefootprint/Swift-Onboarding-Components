import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Tabs from './tabs';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Tabs />', () => {
  it('should render all tabs by default', () => {
    customRender(
      <Tabs
        playbook={{
          ...getOnboardingConfiguration({}),
          documentsToCollect: [],
        }}
        isTabsDisabled={false}
        toggleDisableHeading={jest.fn()}
        hideSettings={false}
      />,
    );

    const dataCollection = screen.getByRole('tab', { name: 'Data collection' });
    expect(dataCollection).toBeInTheDocument();

    const verificationChecks = screen.getByRole('tab', { name: 'Verification checks' });
    expect(verificationChecks).toBeInTheDocument();

    const settings = screen.getByRole('tab', { name: 'Settings' });
    expect(settings).toBeInTheDocument();

    const rules = screen.getByRole('tab', { name: 'Rules' });
    expect(rules).toBeInTheDocument();
  });

  describe('when hideSettings is true', () => {
    it('should not render the settings tab', () => {
      customRender(
        <Tabs
          playbook={{
            ...getOnboardingConfiguration({}),
            documentsToCollect: [],
          }}
          isTabsDisabled={false}
          toggleDisableHeading={jest.fn()}
          hideSettings={true}
        />,
      );

      const dataCollection = screen.getByRole('tab', { name: 'Data collection' });
      expect(dataCollection).toBeInTheDocument();

      const verificationChecks = screen.getByRole('tab', { name: 'Verification checks' });
      expect(verificationChecks).toBeInTheDocument();

      const rules = screen.getByRole('tab', { name: 'Rules' });
      expect(rules).toBeInTheDocument();

      expect(screen.queryByRole('tab', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });
});
