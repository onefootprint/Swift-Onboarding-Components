import type {
  CollectedDataOption,
  ObConfigurationKind,
  VerificationCheck,
} from '@onefootprint/request-types/dashboard';
import { customRender, screen, within } from '@onefootprint/test-utils';
import VerificationChecks from './verification-checks';
import { onboardingConfigFixture } from './verification-checks.test.config';

describe('<VerificationChecks />', () => {
  const renderVerificationChecks = ({
    verificationChecks = [],
    mustCollectData = [
      'email',
      'name',
      'dob',
      'full_address',
      'ssn9',
      'phone_number',
      'business_name',
      'business_address',
      'business_tin',
      'business_kyced_beneficial_owners',
    ],
    kind = 'kyc',
  }: {
    verificationChecks?: VerificationCheck[];
    mustCollectData?: CollectedDataOption[];
    kind?: ObConfigurationKind;
  }) => {
    return customRender(
      <VerificationChecks
        playbook={{
          ...onboardingConfigFixture,
          mustCollectData,
          verificationChecks,
          kind,
        }}
      />,
    );
  };

  describe('KYB AML checks', () => {
    it('should show the correct text when full KYB is enabled and KYC checks are disabled', () => {
      renderVerificationChecks({
        verificationChecks: [{ kind: 'kyb', data: { einOnly: false } }],
        kind: 'kyb',
      });
      const kyb = screen.getByRole('group', { name: 'Know Your Business (KYB)' });
      const full = within(kyb).getByText('Full KYB (data collection + verification checks)');
      expect(full).toBeInTheDocument();

      const kycChecks = screen.getByText('KYC is not being conducted on beneficial owners');
      expect(kycChecks).toBeInTheDocument();
    });

    it('should show the correct text when EIN-only KYB is enabled and full KYC checks are enabled', () => {
      renderVerificationChecks({
        verificationChecks: [
          { kind: 'kyb', data: { einOnly: true } },
          { kind: 'kyc', data: {} },
        ],
        mustCollectData: ['business_kyced_beneficial_owners'],
        kind: 'kyb',
      });

      const kyb = screen.getByRole('group', { name: 'Know Your Business (KYB)' });
      const einOnly = within(kyb).getByText('TIN (EIN) and business name verification only');
      expect(einOnly).toBeInTheDocument();

      const kyc = screen.getByRole('group', { name: 'Know Your Customer (KYC)' });
      const full = within(kyc).getByText('On all business owners');
      expect(full).toBeInTheDocument();
    });
  });

  describe('KYC AML checks', () => {
    it('should show a fallback text when AML monitoring is disabled', () => {
      renderVerificationChecks({});

      const noAMLChecks = screen.getByText('AML checks are not enabled');
      expect(noAMLChecks).toBeInTheDocument();
    });

    describe('ofac', () => {
      it('should show a check icon when ofac is enabled', () => {
        renderVerificationChecks({
          verificationChecks: [
            {
              kind: 'aml',
              data: {
                ofac: true,
                pep: false,
                adverseMedia: false,
                continuousMonitoring: false,
                matchKind: 'fuzzy_low',
              },
            },
          ],
        });

        const ofac = screen.getByRole('row', { name: 'Office of Foreign Assets Control (OFAC)' });
        const check = within(ofac).getByLabelText('Enabled');
        expect(check).toBeInTheDocument();
      });

      it('should show a close icon when ofac is disabled', () => {
        renderVerificationChecks({
          verificationChecks: [
            {
              kind: 'aml',
              data: {
                ofac: false,
                pep: true,
                adverseMedia: true,
                continuousMonitoring: false,
                matchKind: 'fuzzy_low',
              },
            },
          ],
        });

        const ofac = screen.getByRole('row', { name: 'Office of Foreign Assets Control (OFAC)' });
        const close = within(ofac).getByLabelText('Disabled');
        expect(close).toBeInTheDocument();
      });
    });

    describe('pep', () => {
      it('should show a check icon when pep is enabled', () => {
        renderVerificationChecks({
          verificationChecks: [
            {
              kind: 'aml',
              data: {
                ofac: false,
                pep: true,
                adverseMedia: false,
                continuousMonitoring: false,
                matchKind: 'fuzzy_low',
              },
            },
          ],
        });

        const pep = screen.getByRole('row', { name: 'Politically Exposed Person (PEP)' });
        const check = within(pep).getByLabelText('Enabled');
        expect(check).toBeInTheDocument();
      });

      it('should show a close icon when is pep disabled', () => {
        renderVerificationChecks({
          verificationChecks: [
            {
              kind: 'aml',
              data: {
                ofac: true,
                pep: false,
                adverseMedia: true,
                continuousMonitoring: false,
                matchKind: 'fuzzy_low',
              },
            },
          ],
        });

        const pep = screen.getByRole('row', { name: 'Politically Exposed Person (PEP)' });
        const close = within(pep).getByLabelText('Disabled');
        expect(close).toBeInTheDocument();
      });
    });

    describe('adverse media', () => {
      it('should show a check icon when adverse media is enabled', () => {
        renderVerificationChecks({
          verificationChecks: [
            {
              kind: 'aml',
              data: {
                ofac: false,
                pep: false,
                adverseMedia: true,
                continuousMonitoring: false,
                matchKind: 'fuzzy_low',
              },
            },
          ],
        });

        const adverseMedia = screen.getByRole('row', { name: 'Adverse media' });
        const check = within(adverseMedia).getByLabelText('Enabled');
        expect(check).toBeInTheDocument();
      });

      it('should show a close icon when is adverse media is disabled', () => {
        renderVerificationChecks({
          verificationChecks: [
            {
              kind: 'aml',
              data: {
                ofac: true,
                pep: true,
                adverseMedia: false,
                continuousMonitoring: false,
                matchKind: 'fuzzy_low',
              },
            },
          ],
        });

        const adverseMedia = screen.getByRole('row', { name: 'Adverse media' });
        const close = within(adverseMedia).getByLabelText('Disabled');
        expect(close).toBeInTheDocument();
      });
    });
  });
});
