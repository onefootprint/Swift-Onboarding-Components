import { customRender, screen } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import Content from './content';
import { authPlaybookFixture, docPlaybookFixture, kybPlaybookFixture, kycPlaybookFixture } from './content.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Content />', () => {
  const renderContent = (playbook: OnboardingConfig) => {
    customRender(<Content playbook={playbook} />);
  };

  describe('doc only playbook', () => {
    it('renders single page instead of tablist', async () => {
      renderContent(docPlaybookFixture);

      const governmentIssuedIdText = await screen.findByText('Government-issued ID');
      expect(governmentIssuedIdText).toBeInTheDocument();

      const tablist = screen.queryByRole('tablist');
      expect(tablist).not.toBeInTheDocument();
    });
  });

  describe('KYC playbook', () => {
    it('renders Tabs', async () => {
      renderContent(kycPlaybookFixture);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('KYB playbook', () => {
    it('renders Tabs', async () => {
      renderContent(kybPlaybookFixture);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('Auth playbook', () => {
    it('renders Tabs', async () => {
      renderContent(authPlaybookFixture);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });
  });
});
