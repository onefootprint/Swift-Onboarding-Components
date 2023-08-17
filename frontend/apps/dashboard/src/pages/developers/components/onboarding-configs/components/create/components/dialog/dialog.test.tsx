import {
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser } from 'src/config/tests';

import getFormIdForState from '../../utils/get-form-id-for-state';
import Dialog, { DialogProps } from './dialog';
import {
  ADDRESS_LABEL,
  BENEFICIAL_OWNERS_LABEL,
  BUSINESS_ADDRESS_LABEL,
  BUSINESS_BO_FULL_KYC_LABEL,
  BUSINESS_BO_FULL_KYC_OPTION,
  BUSINESS_NAME_LABEL,
  BUSINESS_PHONE_LABEL,
  BUSINESS_TIN_LABEL,
  BUSINESS_WEBSITE_LABEL,
  checkCollectedDataDoesNotExist,
  checkCollectedDataExists,
  clickBack,
  clickNext,
  DOB_LABEL,
  DRIVERS_LICENSE_LABEL,
  DRIVERS_LICENSE_OPTION,
  EMAIL_LABEL,
  fillInvestorProfile,
  fillKybAccess,
  fillKybCollect,
  fillKycAccess,
  fillKycCollect,
  fillName,
  ID_CARD_LABEL,
  ID_CARD_OPTION,
  ID_DOCUMENT_AND_SELFIE_LABEL,
  ID_DOCUMENT_LABEL,
  INVESTOR_PROFILE_LABEL,
  NAME_LABEL,
  NATIONALITY_LABEL,
  NATIONALITY_OPTION,
  PASSPORT_LABEL,
  PASSPORT_OPTION,
  PHONE_LABEL,
  selectType,
  SELFIE_LABEL,
  SELFIE_OPTION,
  SSN_FULL_LABEL,
  SSN_FULL_OPTION,
  SSN_LAST_FOUR_LABEL,
  SSN_LAST_FOUR_OPTION,
  toggleAccessOption,
  toggleCollectOption,
  withCreateOnboardingConfig,
} from './dialog.test.config';

describe('<Dialog />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  const renderDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
  }: Partial<DialogProps> = defaultOptions) => {
    customRender(<Dialog open={open} onClose={onClose} />);
  };

  describe('When toggling open/closed state', () => {
    it('should hide dialog if not open', () => {
      renderDialog({ open: false });
      expect(
        screen.queryByTestId('onboarding-configs-create-dialog'),
      ).not.toBeInTheDocument();
    });

    it('should show dialog if open', () => {
      renderDialog({ open: true });
      expect(
        screen.getByTestId('onboarding-configs-create-dialog'),
      ).toBeInTheDocument();
    });
  });

  describe('When collecting type', () => {
    it('user can toggle between kyb and kyc types', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();

      const kyc = screen.getByLabelText('KYC') as HTMLButtonElement;
      expect((kyc as any).selected).toBeTruthy();

      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      expect((kyb as any).selected).toBeFalsy();

      expect(kyb).toBeInTheDocument();
      await userEvent.click(kyb);
      await waitFor(() => {
        expect((kyb as any).selected).toBeTruthy();
      });

      await userEvent.click(kyc);
      await waitFor(() => {
        expect((kyc as any).selected).toBeTruthy();
      });
    });

    it('should trigger `onClose` when clicking on the "Close" button', async () => {
      const onCloseMockFn = jest.fn();
      renderDialog({ open: true, onClose: onCloseMockFn });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);

      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should trigger `onClose` when clicking on the "Cancel" button', async () => {
      const onCloseMockFn = jest.fn();
      renderDialog({ open: true, onClose: onCloseMockFn });

      const closeButton = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(closeButton);

      expect(onCloseMockFn).toHaveBeenCalled();
    });
  });

  describe('When collecting name', () => {
    it('should show an error if name is not filled', async () => {
      renderDialog();

      await selectType();

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      await clickNext();
      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Please enter a name for your onboarding configuration.',
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('clicking back should take user to the type form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();

      await clickNext();
      await clickNext();

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      await clickBack();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
    });

    it('clicking next should take user to the kyc form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();

      await clickNext();
      await clickNext();

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await clickNext();

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
    });

    it('clicking next should take user to the kyb form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      await userEvent.click(kyb);

      await clickNext();
      await clickNext();

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await clickNext();

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();
    });
  });

  describe('When collecting KYC data', () => {
    it('should show collected data options', async () => {
      renderDialog();

      await selectType();
      await fillName();

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();

      await checkCollectedDataExists([
        EMAIL_LABEL,
        PHONE_LABEL,
        NAME_LABEL,
        DOB_LABEL,
        ADDRESS_LABEL,
        SSN_FULL_LABEL,
      ]);

      await toggleCollectOption(
        SSN_LAST_FOUR_OPTION,
        SSN_LAST_FOUR_LABEL,
        true,
      );
      await toggleCollectOption(SSN_FULL_OPTION, SSN_FULL_LABEL, true);
      await toggleCollectOption(NATIONALITY_OPTION, NATIONALITY_LABEL, true);
      await toggleCollectOption(NATIONALITY_OPTION, NATIONALITY_LABEL, false);

      // Select ID card & selfie
      await toggleCollectOption(ID_CARD_OPTION, ID_CARD_LABEL, true);
      await toggleCollectOption(SELFIE_OPTION, SELFIE_LABEL, true);

      // Unselect Selfie & then ID card
      await toggleCollectOption(SELFIE_OPTION, SELFIE_LABEL, false);
      await checkCollectedDataExists([ID_CARD_LABEL]);
      await toggleCollectOption(ID_CARD_OPTION, ID_CARD_LABEL, false);
      expect(screen.queryByText(SELFIE_OPTION)).not.toBeInTheDocument();

      // Select Passport & selfie
      await toggleCollectOption(PASSPORT_OPTION, PASSPORT_LABEL, true);
      await toggleCollectOption(SELFIE_OPTION, SELFIE_LABEL, true);

      // Unselect passport
      // This should automatically unselect the selfie
      await toggleCollectOption(PASSPORT_OPTION, PASSPORT_LABEL, false);
      await checkCollectedDataDoesNotExist([ID_CARD_LABEL]);

      // Select Driver's license & selfie
      await toggleCollectOption(
        DRIVERS_LICENSE_OPTION,
        DRIVERS_LICENSE_LABEL,
        true,
      );
      await toggleCollectOption(SELFIE_OPTION, SELFIE_LABEL, true);
    });

    it('should go back to the name form', async () => {
      renderDialog();

      await selectType();
      await fillName();

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await clickBack();

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
    });
  });

  describe('When collecting KYC data access', () => {
    it('should show collected data options selected by default', async () => {
      renderDialog();

      await selectType();
      await fillName();

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();

      // Select nationality option - unchecked by default
      await toggleCollectOption(NATIONALITY_OPTION, NATIONALITY_LABEL, true);
      await clickNext();

      await fillInvestorProfile();

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      await toggleAccessOption(EMAIL_LABEL, false);
      await toggleAccessOption(PHONE_LABEL, false);
      await toggleAccessOption(NAME_LABEL, false);
      await toggleAccessOption(DOB_LABEL, false);
      await toggleAccessOption(NATIONALITY_LABEL, false);
      await toggleAccessOption(ADDRESS_LABEL, false);
      await toggleAccessOption(SSN_FULL_LABEL, false);
    });

    it('should show investor profile if it was collected', async () => {
      renderDialog();

      await selectType();
      await fillName();

      await fillKycCollect();

      await fillInvestorProfile(true);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      await toggleAccessOption(INVESTOR_PROFILE_LABEL, false);
    });

    it('should show document if only document was collected', async () => {
      renderDialog();

      await selectType();
      await fillName();

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await toggleCollectOption(ID_CARD_OPTION, ID_CARD_LABEL, true);
      await clickNext();

      await fillInvestorProfile();

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      expect(
        screen.queryByLabelText(ID_DOCUMENT_AND_SELFIE_LABEL),
      ).not.toBeInTheDocument();
      await toggleAccessOption(ID_DOCUMENT_LABEL, false);
      await toggleAccessOption(ID_DOCUMENT_LABEL, true);
    });

    it('should show document and selfie if document and selfie were collected', async () => {
      renderDialog();

      await selectType();
      await fillName();

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await toggleCollectOption(ID_CARD_OPTION, ID_CARD_LABEL, true);
      await toggleCollectOption(SELFIE_OPTION, SELFIE_LABEL, true);
      await clickNext();

      await fillInvestorProfile();

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      await toggleAccessOption(ID_DOCUMENT_AND_SELFIE_LABEL, false);
    });

    it('should go back to kyc collect form', async () => {
      renderDialog();

      await selectType();
      await fillName();
      await fillKycCollect();
      await fillInvestorProfile();

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      await clickBack();
      expect(
        screen.getByTestId(getFormIdForState('kycInvestorProfile')),
      ).toBeInTheDocument();

      await clickBack();
      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
    });

    it('should save onboarding config next', async () => {
      withCreateOnboardingConfig();

      const onClose = jest.fn();
      renderDialog({ onClose });

      await selectType();
      await fillName();
      await fillKycCollect();
      await fillInvestorProfile();
      await fillKycAccess();

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(
          screen.getByText('Onboarding config created successfully.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('When collecting KYB data', () => {
    it('should show collected data options', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      await userEvent.click(kyb);

      await clickNext();

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await clickNext();

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();

      await checkCollectedDataExists([
        BUSINESS_NAME_LABEL,
        BUSINESS_TIN_LABEL,
        BUSINESS_ADDRESS_LABEL,
        BENEFICIAL_OWNERS_LABEL,
      ]);

      await toggleCollectOption(
        BUSINESS_BO_FULL_KYC_OPTION,
        BUSINESS_BO_FULL_KYC_LABEL,
        true,
      );
      await checkCollectedDataDoesNotExist([BENEFICIAL_OWNERS_LABEL]);

      await toggleCollectOption(
        BUSINESS_WEBSITE_LABEL,
        BUSINESS_WEBSITE_LABEL,
        true,
      );
      await toggleCollectOption(
        BUSINESS_PHONE_LABEL,
        BUSINESS_PHONE_LABEL,
        true,
      );
    });

    describe('When user is not a firm-employee', () => {
      beforeEach(asAdminUser);

      it('should display option to KYC all BOs', async () => {
        renderDialog();

        // Advance to data collection screen
        await selectType(true);
        await fillName();

        expect(
          screen.getByTestId(getFormIdForState('kybCollect')),
        ).toBeInTheDocument();

        const options = screen.getByTestId('kyb-collect-form-options');
        expect(
          within(options).getByLabelText('Fully KYC all beneficial owners'),
        ).toBeInTheDocument();
      });
    });

    it('should go back to name form', async () => {
      renderDialog();

      await selectType(true);
      await clickNext();
      await fillName();

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();

      await clickBack();
      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
    });

    it('should go to kyb bo collect form next', async () => {
      renderDialog();

      await selectType(true);
      await fillName();
      await fillKybCollect();
      await fillKycCollect();

      expect(
        screen.getByTestId(getFormIdForState('kybAccess')),
      ).toBeInTheDocument();

      await clickBack();
      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();

      await clickBack();
      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();
    });

    it('should save onboarding config next', async () => {
      withCreateOnboardingConfig();

      const onClose = jest.fn();
      renderDialog({ onClose });

      await selectType(true);
      await fillName();
      await fillKybCollect();
      await fillKycCollect();
      await fillKybAccess();

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(
          screen.getByText('Onboarding config created successfully.'),
        ).toBeInTheDocument();
      });
    });
  });
});
