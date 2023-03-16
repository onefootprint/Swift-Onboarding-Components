import {
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import Create, { CreateProps } from './create';
import getFormIdForState from './utils/get-form-id-for-state/get-form-id-for-state';

describe('<CreateConfig />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  const renderCreate = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    onCreate = defaultOptions.onCreate,
  }: Partial<CreateProps> = defaultOptions) => {
    customRender(<Create open={open} onClose={onClose} onCreate={onCreate} />);
  };

  describe('Type form', () => {
    it('user can toggle between kyb and kyc types', async () => {
      renderCreate();

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
      renderCreate({ open: true, onClose: onCloseMockFn });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await userEvent.click(closeButton);

      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('should trigger `onClose` when clicking on the "Cancel" button', async () => {
      const onCloseMockFn = jest.fn();
      renderCreate({ open: true, onClose: onCloseMockFn });

      const closeButton = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(closeButton);

      expect(onCloseMockFn).toHaveBeenCalled();
    });
  });

  describe('Name form', () => {
    it('should show an error if name is not filled', async () => {
      renderCreate();

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
      renderCreate();

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
      renderCreate();

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
  });

  describe('KycCollectForm', () => {
    it('should show collected data options', async () => {
      renderCreate();

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
        within(collectedData).getByText('Date of Birth'),
      ).toBeInTheDocument();
      expect(within(collectedData).getByText('Address')).toBeInTheDocument();
      expect(
        within(collectedData).getByText('SSN (Last 4)'),
      ).toBeInTheDocument();

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

    it('clicking back should take user to the name form', async () => {
      renderCreate();

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
  });
});
