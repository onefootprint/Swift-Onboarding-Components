import { customRender, screen, within } from '@onefootprint/test-utils';
import VerificationChecks from './verification-checks';
import onboardingConfigFixture from './verification-checks.test.config';

describe('<VerificationChecks />', () => {
  const renderVerificationChecks = ({
    adverseMedia = false,
    continuousMonitoring = false,
    ofac = false,
    pep = false,
  }: {
    adverseMedia?: boolean;
    continuousMonitoring?: boolean;
    ofac?: boolean;
    pep?: boolean;
  }) => {
    const hasAml = adverseMedia || continuousMonitoring || ofac || pep;

    return customRender(
      <VerificationChecks
        playbook={{
          ...onboardingConfigFixture,
          verificationChecks: hasAml ? [{ kind: 'aml', data: { adverseMedia, ofac, pep, continuousMonitoring } }] : [],
        }}
      />,
    );
  };

  describe('AML monitoring', () => {
    describe('when is disabled', () => {
      it('should show a fallback text', () => {
        renderVerificationChecks({});

        const aml = screen.getByRole('group', { name: 'Anti-Money Laundering (AML)' });
        const empty = within(aml).getByText('AML checks are not enabled.');
        expect(empty).toBeInTheDocument();
      });
    });
  });

  describe('ofac', () => {
    describe('when is enabled', () => {
      it('should show a check icon', () => {
        renderVerificationChecks({ ofac: true });

        const ofac = screen.getByRole('row', { name: 'Office of Foreign Assets Control (OFAC)' });
        const check = within(ofac).getByLabelText('Enabled');
        expect(check).toBeInTheDocument();
      });
    });

    describe('when is disabled', () => {
      it('should show a close icon', () => {
        renderVerificationChecks({ ofac: false, pep: true, adverseMedia: true });

        const ofac = screen.getByRole('row', { name: 'Office of Foreign Assets Control (OFAC)' });
        const close = within(ofac).getByLabelText('Disabled');
        expect(close).toBeInTheDocument();
      });
    });
  });

  describe('pep', () => {
    describe('when is enabled', () => {
      it('should show a check icon', () => {
        renderVerificationChecks({ pep: true });

        const pep = screen.getByRole('row', { name: 'Politically Exposed Person (PEP)' });
        const check = within(pep).getByLabelText('Enabled');
        expect(check).toBeInTheDocument();
      });
    });

    describe('when is disabled', () => {
      it('should show a close icon', () => {
        renderVerificationChecks({ pep: false, ofac: true, adverseMedia: true });

        const pep = screen.getByRole('row', { name: 'Politically Exposed Person (PEP)' });
        const close = within(pep).getByLabelText('Disabled');
        expect(close).toBeInTheDocument();
      });
    });
  });

  describe('adverse media', () => {
    describe('when is enabled', () => {
      it('should show a check icon', () => {
        renderVerificationChecks({ adverseMedia: true });

        const adverseMedia = screen.getByRole('row', { name: 'Adverse media' });
        const check = within(adverseMedia).getByLabelText('Enabled');
        expect(check).toBeInTheDocument();
      });
    });

    describe('when is disabled', () => {
      it('should show a close icon', () => {
        renderVerificationChecks({ adverseMedia: false, pep: true, ofac: true });

        const adverseMedia = screen.getByRole('row', { name: 'Adverse media' });
        const close = within(adverseMedia).getByLabelText('Disabled');
        expect(close).toBeInTheDocument();
      });
    });
  });
});
