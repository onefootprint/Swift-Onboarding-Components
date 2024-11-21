import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Content from './content';
import { authPlaybookFixture, docPlaybookFixture, kybPlaybookFixture, kycPlaybookFixture } from './content.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Content />', () => {
  const renderContent = (playbook: OnboardingConfiguration) => {
    customRender(<Content playbook={playbook} playbooks={[playbook]} />);
  };

  describe('doc only playbook', () => {
    it('renders Tabs with doc-only data collection tab open by default', async () => {
      renderContent(docPlaybookFixture);

      const governmentIssuedIdText = await screen.findByText('Government-issued ID');
      expect(governmentIssuedIdText).toBeInTheDocument();

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const dataCollectionTab = screen.getByRole('tab', { name: 'Data collection' });
      expect(dataCollectionTab).toBeInTheDocument();

      const rulesTab = screen.getByRole('tab', { name: 'Rules' });
      expect(rulesTab).toBeInTheDocument();
    });
  });

  describe('KYC playbook', () => {
    it('renders Tabs', async () => {
      renderContent(kycPlaybookFixture);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const dataCollectionTab = screen.getByRole('tab', { name: 'Data collection' });
      expect(dataCollectionTab).toBeInTheDocument();

      const verificationChecksTab = screen.getByRole('tab', { name: 'Verification checks' });
      expect(verificationChecksTab).toBeInTheDocument();

      const settingsTab = screen.getByRole('tab', { name: 'Settings' });
      expect(settingsTab).toBeInTheDocument();

      const rulesTab = screen.getByRole('tab', { name: 'Rules' });
      expect(rulesTab).toBeInTheDocument();
    });
  });

  describe('KYB playbook', () => {
    it('renders Tabs', async () => {
      renderContent(kybPlaybookFixture);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const dataCollectionTab = screen.getByRole('tab', { name: 'Data collection' });
      expect(dataCollectionTab).toBeInTheDocument();

      const verificationChecksTab = screen.getByRole('tab', { name: 'Verification checks' });
      expect(verificationChecksTab).toBeInTheDocument();

      const settingsTab = screen.getByRole('tab', { name: 'Settings' });
      expect(settingsTab).toBeInTheDocument();

      const rulesTab = screen.getByRole('tab', { name: 'Rules' });
      expect(rulesTab).toBeInTheDocument();
    });
  });

  describe('Auth playbook', () => {
    it('renders single page instead of tablist', async () => {
      renderContent(authPlaybookFixture);

      const signUpText = await screen.findByText('Sign up information');
      expect(signUpText).toBeInTheDocument();

      const settingsTab = screen.queryByRole('tab', { name: 'Settings' });
      expect(settingsTab).not.toBeInTheDocument();

      const tablist = screen.queryByRole('tablist');
      expect(tablist).not.toBeInTheDocument();
    });
  });
});
