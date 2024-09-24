import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import VerificationChecks from '.';
import type { VerificationChecksProps } from './verification-checks';

describe('<VerificationChecks />', () => {
  const renderAml = ({
    defaultAmlValues = {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
    },
    businessInfo = {
      basic: {
        address: true,
        collectBOInfo: true,
        name: false,
        phoneNumber: false,
        tin: false,
        type: false,
        website: false,
      },
      docs: {
        custom: [],
      },
    },
    allowInternationalResident = false,
    collectBO = false,
    isKyb = false,
    isPending = false,
    onBack = jest.fn(),
    onSubmit = jest.fn(),
    requiresDoc = false,
  }: Partial<VerificationChecksProps>) => {
    customRender(
      <VerificationChecks
        allowInternationalResident={allowInternationalResident}
        businessInfo={businessInfo}
        collectBO={collectBO}
        defaultAmlValues={defaultAmlValues}
        isKyb={isKyb}
        isPending={isPending}
        onBack={onBack}
        onSubmit={onSubmit}
        requiresDoc={requiresDoc}
      />,
    );
  };

  describe('initial state', () => {
    it('should show the "AML monitoring" option and kyc check should be disabled', () => {
      renderAml({});

      const kycCheck = screen.getByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      expect(kycCheck).toBeDisabled();

      const aml = screen.getByRole('switch', {
        name: 'Enhanced AML monitoring',
      });
      expect(aml).toBeInTheDocument();

      const ofac = screen.queryByRole('checkbox', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      expect(ofac).not.toBeInTheDocument();

      const pep = screen.queryByRole('checkbox', {
        name: 'Politically Exposed Person (PEP)',
      });
      expect(pep).not.toBeInTheDocument();

      const adverseMedia = screen.queryByRole('checkbox', {
        name: 'Adverse media',
      });
      expect(adverseMedia).not.toBeInTheDocument();
    });
  });

  describe('kyc checks', () => {
    it('should show the "KYC check" option for KYC kind with requires doc', () => {
      renderAml({ requiresDoc: true });

      const kycCheck = screen.getByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      expect(kycCheck).toBeEnabled();
    });

    it('should not show KYC check option if allowInternationalResident is true', () => {
      renderAml({ allowInternationalResident: true });

      const kycCheck = screen.queryByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      expect(kycCheck).not.toBeInTheDocument();
    });

    it('should show the "KYC check" option as disabled and truthy if doc is not required', () => {
      renderAml({ requiresDoc: false });

      const kycCheck = screen.getByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      expect(kycCheck).toBeDisabled();
      expect(kycCheck).toBeChecked();
    });

    it('should show the "KYC check" option as disabled and falsy for KYB kind with collectBO false', () => {
      renderAml({ isKyb: true });

      const kycCheck = screen.getByRole('switch', {
        name: 'Run KYC on beneficial owners',
      });
      expect(kycCheck).toBeDisabled();
      expect(kycCheck).not.toBeChecked();
    });

    it('should show the "KYC check" option as enabled and truthy for KYB kind with collectBO true', () => {
      renderAml({ isKyb: true, collectBO: true });

      const kycCheck = screen.getByRole('switch', {
        name: 'Run KYC on beneficial owners',
      });
      expect(kycCheck).toBeEnabled();
      expect(kycCheck).toBeChecked();
    });

    describe('aml checks', () => {
      describe('when clicking on the "AML monitoring" option', () => {
        it('should show the "AML monitoring" option', async () => {
          renderAml({});

          const aml = screen.getByRole('switch', {
            name: 'Enhanced AML monitoring',
          });
          await userEvent.click(aml);

          const ofac = screen.getByRole('checkbox', {
            name: 'Office of Foreign Assets Control (OFAC)',
          });
          expect(ofac).toBeInTheDocument();

          const pep = screen.getByRole('checkbox', {
            name: 'Politically Exposed Person (PEP)',
          });
          expect(pep).toBeInTheDocument();

          const adverseMedia = screen.getByRole('checkbox', {
            name: 'Adverse media',
          });
          expect(adverseMedia).toBeInTheDocument();
        });
      });
    });

    describe('when submitting the data', () => {
      it('should call the onSubmit callback', async () => {
        const onSubmit = jest.fn();
        renderAml({ onSubmit, allowInternationalResident: true });

        const aml = screen.getByRole('switch', {
          name: 'Enhanced AML monitoring',
        });
        await userEvent.click(aml);

        const ofac = screen.getByRole('checkbox', {
          name: 'Office of Foreign Assets Control (OFAC)',
        });
        await userEvent.click(ofac);

        const pep = screen.getByRole('checkbox', {
          name: 'Politically Exposed Person (PEP)',
        });
        await userEvent.click(pep);

        const adverseMedia = screen.getByRole('checkbox', {
          name: 'Adverse media',
        });
        await userEvent.click(adverseMedia);

        const submit = screen.getByRole('button', { name: 'Create' });
        await userEvent.click(submit);

        expect(onSubmit).toHaveBeenCalledWith({
          skipKyc: true,
          runKyb: false,
          amlFormData: {
            enhancedAml: true,
            ofac: true,
            pep: true,
            adverseMedia: true,
          },
        });
      });
    });

    describe('when it is loading', () => {
      it('should show the loading state', () => {
        renderAml({ isPending: true });

        const back = screen.getByRole('button', { name: 'Back' });
        expect(back).toBeDisabled();

        const submit = screen.getByRole('progressbar', { name: 'Loading...' });
        expect(submit).toBeInTheDocument();
      });
    });

    describe('when clicking on the back button', () => {
      it('should call the onBack callback', async () => {
        const onBack = jest.fn();
        renderAml({ onBack });

        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        expect(onBack).toHaveBeenCalled();
      });
    });

    describe('when it has default data', () => {
      it('should render the default data', () => {
        renderAml({
          defaultAmlValues: {
            enhancedAml: true,
            ofac: true,
            pep: true,
            adverseMedia: true,
          },
        });

        const aml = screen.getByRole('switch', {
          name: 'Enhanced AML monitoring',
        });
        expect(aml).toBeChecked();

        const ofac = screen.getByRole('checkbox', {
          name: 'Office of Foreign Assets Control (OFAC)',
        });
        expect(ofac).toBeChecked();

        const pep = screen.getByRole('checkbox', {
          name: 'Politically Exposed Person (PEP)',
        });
        expect(pep).toBeChecked();

        const adverseMedia = screen.getByRole('checkbox', {
          name: 'Adverse media',
        });
        expect(adverseMedia).toBeChecked();
      });
    });
  });

  describe('kyb checks', () => {
    describe('when it is not KYB', () => {
      it('should not show the KYB checks', () => {
        renderAml({});

        const title = screen.queryByText('Know Your Business (KYB)');
        expect(title).not.toBeInTheDocument();
      });
    });

    describe('when it is KYB', () => {
      it('should show the KYB checks', () => {
        renderAml({ isKyb: true });

        const title = screen.getByText('Know Your Business (KYB)');
        expect(title).toBeInTheDocument();

        const fullCheck = screen.getByRole('radio', {
          name: 'Full KYB',
        });
        expect(fullCheck).toBeInTheDocument();

        const einOnly = screen.getByRole('radio', {
          name: 'TIN (EIN) verification only',
        });
        expect(einOnly).toBeInTheDocument();
      });

      describe('when clicking on the toggle "Run KYB"', () => {
        it('should hide the KYB checks', async () => {
          renderAml({
            isKyb: true,
            businessInfo: {
              basic: {
                address: false,
                collectBOInfo: true,
                name: false,
                phoneNumber: false,
                tin: false,
                type: false,
                website: false,
              },
              docs: {
                custom: [],
              },
            },
          });

          const kybCheck = screen.getByRole('switch', {
            name: 'Run KYB',
          });
          await userEvent.click(kybCheck);

          const runFull = screen.queryByRole('radio', {
            name: 'Run full KYB',
          });
          expect(runFull).not.toBeInTheDocument();
        });

        it('should display a tooltip with the reason why the Full KYB option is disabled', async () => {
          renderAml({
            isKyb: true,
            businessInfo: {
              basic: {
                address: false,
                collectBOInfo: true,
                name: false,
                phoneNumber: false,
                tin: false,
                type: false,
                website: false,
              },
              docs: {
                custom: [],
              },
            },
          });

          const fullKyb = screen.getByRole('radio', {
            name: 'Full KYB',
          });
          await userEvent.hover(fullKyb);

          const tooltip = screen.getByRole('tooltip', {
            name: 'Running full KYB requires you to collect Business name, Business address and EIN, at least.',
          });
          expect(tooltip).toBeInTheDocument();
        });

        it('should check the "EIN verificarion only"', () => {
          renderAml({
            isKyb: true,
            businessInfo: {
              basic: {
                address: false,
                collectBOInfo: true,
                name: false,
                phoneNumber: false,
                tin: false,
                type: false,
                website: false,
              },
              docs: {
                custom: [],
              },
            },
          });

          const einOnly = screen.getByRole('radio', {
            name: 'TIN (EIN) verification only',
          });
          expect(einOnly).toBeChecked();
        });
      });

      describe('when it is not collection business address', () => {
        it('should disable Full KYB option', () => {
          renderAml({
            isKyb: true,
            businessInfo: {
              basic: {
                address: false,
                collectBOInfo: true,
                name: false,
                phoneNumber: false,
                tin: false,
                type: false,
                website: false,
              },
              docs: {
                custom: [],
              },
            },
          });

          const fullKyb = screen.getByRole('radio', {
            name: 'Full KYB',
          });
          expect(fullKyb).toBeDisabled();
        });
      });
    });
  });
});
