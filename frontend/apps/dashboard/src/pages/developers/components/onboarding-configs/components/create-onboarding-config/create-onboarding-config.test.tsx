import React from 'react';
import { customRender, screen, userEvent, waitFor } from 'test-utils';

import type { CreateOnboardingConfigProps } from './create-onboarding-config';
import CreateDialog from './create-onboarding-config';

describe('<CreateDialog />', () => {
  const defaultOptions = { open: true, onClose: jest.fn() };

  const renderCreateDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
  }: Partial<CreateOnboardingConfigProps> = defaultOptions) =>
    customRender(<CreateDialog open={open} onClose={onClose} />);

  const renderCreateDialogOnTheCollectDataSection = async (
    options = {
      open: true,
      onClose: jest.fn(),
    },
  ) => {
    renderCreateDialog(options);
    const inputName = screen.getByLabelText('Onboarding configuration name');
    await userEvent.type(inputName, 'User ID verification');
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
  };

  const renderCreateDialogOnTheAccessDataSection = async (
    options = {
      open: true,
      onClose: jest.fn(),
    },
  ) => {
    renderCreateDialog(options);
    const inputName = screen.getByLabelText('Onboarding configuration name');
    await userEvent.type(inputName, 'User ID verification');
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    await userEvent.click(continueButton);
  };

  describe('"Name" section', () => {
    it('should show an error if name is not filled', async () => {
      renderCreateDialog();

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      const errorMessage = screen.getByText(
        'Please enter a name for your onboarding configuration.',
      );
      expect(errorMessage).toBeInTheDocument();
    });

    it('should move to the collect data section after filling out a valid name', async () => {
      renderCreateDialog();

      const inputName = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(inputName, 'User ID verification');

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      const collectDataTitle = screen.getByText('Collected data');
      expect(collectDataTitle).toBeInTheDocument();
    });

    describe('when closing', () => {
      it('should trigger `onClose` when clicking on the "Close" button', async () => {
        const onCloseMockFn = jest.fn();
        renderCreateDialog({ open: true, onClose: onCloseMockFn });

        const closeButton = screen.getByRole('button', { name: 'Close' });
        await userEvent.click(closeButton);

        expect(onCloseMockFn).toHaveBeenCalled();
      });

      it('should trigger `onClose` when clicking on the "Cancel" button', async () => {
        const onCloseMockFn = jest.fn();
        renderCreateDialog({ open: true, onClose: onCloseMockFn });

        const closeButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(closeButton);

        expect(onCloseMockFn).toHaveBeenCalled();
      });
    });
  });

  describe('"Collect data" section', () => {
    it('should show the email and phone_number checked and disabled', async () => {
      await renderCreateDialogOnTheCollectDataSection();

      const emailCheckbox = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailCheckbox).toBeDisabled();

      const phoneCheckbox = screen.getByLabelText(
        'Phone number',
      ) as HTMLInputElement;
      expect(phoneCheckbox).toBeDisabled();
    });

    describe('when clicking on the back button', () => {
      it('should go to the "name" section', async () => {
        await renderCreateDialogOnTheCollectDataSection();

        const backButton = screen.getByRole('button', { name: 'Go back' });
        await userEvent.click(backButton);

        const nameForm = screen.getByTestId('name-form');
        expect(nameForm).toBeVisible();
      });
    });

    describe('when clicking on the cancel button', () => {
      it('should show a confirmation to close before closing', async () => {
        const onCloseMockFn = jest.fn();
        await renderCreateDialogOnTheCollectDataSection({
          open: true,
          onClose: onCloseMockFn,
        });

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

        await waitFor(() => {
          const dialog = screen.getByRole('dialog', { name: 'Are you sure?' });
          expect(dialog).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: 'Yes' });
        await userEvent.click(confirmButton);

        expect(onCloseMockFn).toHaveBeenCalled();
      });
    });
  });

  describe('"Access data" section', () => {
    it('should only show the fields that were selected in the previous step', async () => {
      await renderCreateDialogOnTheCollectDataSection();

      const nameCheckbox = screen.getByLabelText('Full name');
      await userEvent.click(nameCheckbox);

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId('access-form')).toBeVisible();
      });

      const allCheckboxes = screen.getAllByRole('checkbox', {
        checked: true,
      });

      // Phone number + Email + Full name
      expect(allCheckboxes.length).toEqual(3);
    });

    describe('when selecting the ssn', () => {
      describe('when collecting the full ssn', () => {
        it('should show only the SSN (Full) field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const ssnCheckbox = screen.getByLabelText('SSN');
          await userEvent.click(ssnCheckbox);

          const ssnRadio = screen.getByLabelText('Full');
          await userEvent.click(ssnRadio);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const fullSsn = screen.getByLabelText('SSN (Full)');
          expect(fullSsn).toBeInTheDocument();
        });
      });

      describe('when collecting the last four ssn', () => {
        it('should show only the SSN (Last 4) field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const ssnCheckbox = screen.getByLabelText('SSN');
          await userEvent.click(ssnCheckbox);

          const ssnRadio = screen.getByLabelText('Last 4');
          await userEvent.click(ssnRadio);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const last4Ssn = screen.getByLabelText('SSN (Last 4)');
          expect(last4Ssn).toBeInTheDocument();
        });
      });
    });

    describe('when selecting the address', () => {
      describe('when collecting the full address', () => {
        it('should show the Address (full) field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const addressCheckbox = screen.getByLabelText('Address');
          await userEvent.click(addressCheckbox);

          const addressRadio = screen.getByLabelText('Full');
          await userEvent.click(addressRadio);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const addressFullCheckbox = screen.getByLabelText('Address (Full)');
          expect(addressFullCheckbox).toBeInTheDocument();
        });
      });

      describe('when collecting the partial address', () => {
        it('should show the Address (Country & Zip Code) field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const addressCheckbox = screen.getByLabelText('Address');
          await userEvent.click(addressCheckbox);

          const addressRadio = screen.getByLabelText('Country & Zip Code');
          await userEvent.click(addressRadio);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const addressPartialCheckbox = screen.getByLabelText(
            'Address (Country & Zip Code)',
          );
          expect(addressPartialCheckbox).toBeInTheDocument();
        });
      });
    });

    describe('when clicking on the back button', () => {
      it('should go to the "Collect data" section', async () => {
        await renderCreateDialogOnTheAccessDataSection();

        const backButton = screen.getByRole('button', { name: 'Go back' });
        await userEvent.click(backButton);

        const nameForm = screen.getByTestId('collect-form');
        expect(nameForm).toBeVisible();
      });
    });

    describe('when clicking on the cancel button', () => {
      it('should show a confirmation to close before closing', async () => {
        const onCloseMockFn = jest.fn();
        await renderCreateDialogOnTheAccessDataSection({
          open: true,
          onClose: onCloseMockFn,
        });

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

        await waitFor(() => {
          const dialog = screen.getByRole('dialog', { name: 'Are you sure?' });
          expect(dialog).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: 'Yes' });
        await userEvent.click(confirmButton);

        expect(onCloseMockFn).toHaveBeenCalled();
      });
    });
  });
});
