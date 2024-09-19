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

      const passkeysTab = screen.getByRole('tab', { name: 'Passkeys' });
      expect(passkeysTab).toBeInTheDocument();

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

      const passkeysTab = screen.getByRole('tab', { name: 'Passkeys' });
      expect(passkeysTab).toBeInTheDocument();

      const rulesTab = screen.getByRole('tab', { name: 'Rules' });
      expect(rulesTab).toBeInTheDocument();
    });
  });

  describe('Auth playbook', () => {
    it('renders single page instead of tablist', async () => {
      renderContent(authPlaybookFixture);

      const signUpText = await screen.findByText('Sign up information');
      expect(signUpText).toBeInTheDocument();

      const tablist = screen.queryByRole('tablist');
      expect(tablist).not.toBeInTheDocument();
    });
  });
});
