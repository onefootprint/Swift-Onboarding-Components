import {
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import getFormIdForState from '../../utils/get-form-id-for-state';
import Dialog, { DialogProps } from './dialog';
import withCreateOnboardingConfig from './dialog.test.config';

// TODO: Add KYB Access form tests

describe('<CreateConfig />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  const renderDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    onCreate = defaultOptions.onCreate,
  }: Partial<DialogProps> = defaultOptions) => {
    customRender(<Dialog open={open} onClose={onClose} onCreate={onCreate} />);
  };

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

  describe('Type form', () => {
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

  describe('Name form', () => {
    it('should show an error if name is not filled', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      await userEvent.click(nextButton);
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
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const backButton = screen.getByRole('button', { name: 'Go back' });
      await userEvent.click(backButton);

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
    });

    it('clicking next should take user to the kyc form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
    });

    it('clicking next should take user to the kyb form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      await userEvent.click(kyb);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();
    });
  });

  describe('KycCollectForm', () => {
    it('should show collected data options', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();

      const collectedData = screen.getByTestId('collected-data');
      expect(within(collectedData).getByText('Email')).toBeInTheDocument();
      expect(
        within(collectedData).getByText('Phone number'),
      ).toBeInTheDocument();
      expect(within(collectedData).getByText('Full name')).toBeInTheDocument();
      expect(
        within(collectedData).getByText('Date of birth'),
      ).toBeInTheDocument();
      expect(within(collectedData).getByText('Address')).toBeInTheDocument();
      expect(within(collectedData).getByText('SSN (Full)')).toBeInTheDocument();

      // Select SSN (Full) option
      const ssnFullOption = screen.getByLabelText('SSN (Full)');
      await userEvent.click(ssnFullOption);
      expect(within(collectedData).getByText('SSN (Full)')).toBeInTheDocument();

      // Select SSN (Last 4) option
      const ssnLast4Option = screen.getByLabelText('SSN (Last 4)');
      await userEvent.click(ssnLast4Option);
      expect(
        within(collectedData).getByText('SSN (Last 4)'),
      ).toBeInTheDocument();

      // Select ID Document
      const idDocumentOption = screen.getByLabelText('ID Document');
      await userEvent.click(idDocumentOption);
      expect(
        within(collectedData).getByText('ID Document'),
      ).toBeInTheDocument();

      // Select Selfie
      const selfieOption = screen.getByLabelText('Selfie');
      await userEvent.click(selfieOption);
      expect(
        within(collectedData).getByText('ID Document & Selfie'),
      ).toBeInTheDocument();

      // Unselect Selfie
      await userEvent.click(selfieOption);
      expect(
        within(collectedData).getByText('ID Document'),
      ).toBeInTheDocument();

      // Select Selfie & Unselect ID Document
      await userEvent.click(selfieOption);
      await userEvent.click(idDocumentOption);
      expect(
        within(collectedData).queryByText('ID Document & Selfie'),
      ).not.toBeInTheDocument();
      expect(
        within(collectedData).queryByText('ID Document'),
      ).not.toBeInTheDocument();
    });

    it('should go back to the name form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      expect(nextButton).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      const backButton = screen.getByRole('button', { name: 'Go back' });
      await userEvent.click(backButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
    });

    it('should go to the kyc access form next', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();
    });
  });

  describe('KycAccessForm', () => {
    it('should show collected data options selected by default', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      const email = screen.getByLabelText('Email') as HTMLInputElement;
      expect(email).toBeInTheDocument();
      expect(email.checked).toBeTruthy();

      const phoneNumber = screen.getByLabelText(
        'Phone number',
      ) as HTMLInputElement;
      expect(phoneNumber).toBeInTheDocument();
      expect(phoneNumber.checked).toBeTruthy();

      const fullName = screen.getByLabelText('Full name') as HTMLInputElement;
      expect(fullName).toBeInTheDocument();
      expect(fullName.checked).toBeTruthy();

      const dateOfBirth = screen.getByLabelText(
        'Date of birth',
      ) as HTMLInputElement;
      expect(dateOfBirth).toBeInTheDocument();
      expect(dateOfBirth.checked).toBeTruthy();
      await userEvent.click(dateOfBirth);
      expect(dateOfBirth.checked).toBeFalsy();

      const address = screen.getByLabelText('Address') as HTMLInputElement;
      expect(address).toBeInTheDocument();
      expect(address.checked).toBeTruthy();

      const ssnFull = screen.getByLabelText('SSN (Full)') as HTMLInputElement;
      expect(ssnFull).toBeInTheDocument();
      expect(ssnFull.checked).toBeTruthy();
      await userEvent.click(ssnFull);
      expect(ssnFull.checked).toBeFalsy();
    });

    it('should show document if only document was collected', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      const options = screen.getByTestId('kyc-collect-form-options');
      const idDocumentOption = within(options).getByLabelText('ID Document');
      await userEvent.click(idDocumentOption);

      const collectedData = screen.getByTestId('collected-data');
      expect(
        within(collectedData).getByText('ID Document'),
      ).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      const idDocCheckbox = screen.getByLabelText('ID Document');
      expect(idDocCheckbox).toBeInTheDocument();
      expect(idDocCheckbox).toBeChecked();
      expect(screen.queryByLabelText('Selfie')).not.toBeInTheDocument();

      await userEvent.click(idDocCheckbox);
      expect(idDocCheckbox).not.toBeChecked();
      expect(screen.queryByLabelText('Selfie')).not.toBeInTheDocument();
    });

    it('should show document and selfie if document and selfie were collected', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      const options = screen.getByTestId('kyc-collect-form-options');
      const idDocumentOption = within(options).getByLabelText('ID Document');
      await userEvent.click(idDocumentOption);
      const selfieOption = screen.getByLabelText('Selfie');
      await userEvent.click(selfieOption);
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      const idDocCheckbox = screen.getByLabelText('ID Document');
      expect(idDocCheckbox).toBeInTheDocument();
      expect(idDocCheckbox).toBeChecked();

      const selfieCheckbox = screen.getByLabelText('Selfie');
      expect(selfieCheckbox).toBeInTheDocument();
      expect(selfieCheckbox).toBeChecked();

      await userEvent.click(selfieCheckbox);
      expect(selfieCheckbox).not.toBeChecked();

      await userEvent.click(idDocCheckbox);
      expect(idDocCheckbox).not.toBeChecked();
      expect(screen.queryByLabelText('Selfie')).not.toBeInTheDocument();
    });

    it('should go back to kyc collect form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: 'Go back' });
      await userEvent.click(backButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
    });

    it('should save onboarding config next', async () => {
      withCreateOnboardingConfig();

      const onCreate = jest.fn();
      const onClose = jest.fn();
      renderDialog({ onCreate, onClose });

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycAccess')),
      ).toBeInTheDocument();
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(onCreate).toHaveBeenCalled();
      });
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

  describe('KybCollectForm', () => {
    it('should show collected data options', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      await userEvent.click(kyb);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();

      const collectedData = screen.getByTestId('collected-data');
      expect(
        within(collectedData).getByText('Business name'),
      ).toBeInTheDocument();
      expect(
        within(collectedData).getByText('Registered business address'),
      ).toBeInTheDocument();
      expect(
        within(collectedData).getByText('Business beneficial owners'),
      ).toBeInTheDocument();
      expect(
        within(collectedData).getByText('Taxpayer Identification Number (TIN)'),
      ).toBeInTheDocument();

      const options = screen.getByTestId('kyb-collect-form-options');
      const website = within(options).getByLabelText(
        'Business website',
      ) as HTMLInputElement;
      expect(website).toBeInTheDocument();
      expect(website.checked).toBeFalsy();
      await userEvent.click(website);
      expect(website.checked).toBeTruthy();

      const phoneNumber = within(options).getByLabelText(
        'Business phone number',
      ) as HTMLInputElement;
      expect(phoneNumber).toBeInTheDocument();
      expect(phoneNumber.checked).toBeFalsy();
      await userEvent.click(phoneNumber);
      expect(phoneNumber.checked).toBeTruthy();
    });

    it('should go back to name form', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      await userEvent.click(kyb);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: 'Go back' });
      await userEvent.click(backButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
    });

    it('should go to kyb bo collect form next', async () => {
      renderDialog();

      expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
      const kyb = screen.getByLabelText('KYB') as HTMLButtonElement;
      await userEvent.click(kyb);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(nameInput, 'Test name');
      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kybCollect')),
      ).toBeInTheDocument();

      await userEvent.click(nextButton);

      expect(
        screen.getByTestId(getFormIdForState('kycCollect')),
      ).toBeInTheDocument();
    });
  });
});
