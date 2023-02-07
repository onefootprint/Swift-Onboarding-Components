import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import type { CreateOnboardingConfigProps } from './create-onboarding-config';
import CreateDialog from './create-onboarding-config';

describe('<CreateDialog />', () => {
  const defaultOptions = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  const renderCreateDialog = ({
    open = defaultOptions.open,
    onClose = defaultOptions.onClose,
    onCreate = defaultOptions.onCreate,
  }: Partial<CreateOnboardingConfigProps> = defaultOptions) =>
    customRender(
      <CreateDialog open={open} onClose={onClose} onCreate={onCreate} />,
    );

  const renderCreateDialogOnTheCollectDataSection = async (
    options = {
      open: true,
      onClose: jest.fn(),
    },
  ) => {
    renderCreateDialog(options);
    const inputName = screen.getByLabelText('Onboarding configuration name');
    await userEvent.type(inputName, 'User ID verification');
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
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
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
  };

  describe('"Name" section', () => {
    it('should show an error if name is not filled', async () => {
      renderCreateDialog();

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Please enter a name for your onboarding configuration.',
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should move to the collect data section after filling out a valid name', async () => {
      renderCreateDialog();

      const inputName = screen.getByLabelText('Onboarding configuration name');
      await userEvent.type(inputName, 'User ID verification');

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

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

      const nameCheckbox = screen.getByLabelText(
        'Full name',
      ) as HTMLInputElement;
      expect(nameCheckbox).toBeDisabled();

      const addressCheckbox = screen.getByLabelText(
        'Address',
      ) as HTMLInputElement;
      expect(addressCheckbox).toBeDisabled();
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

    describe('when collecting the id document & selfie', () => {
      it('should only show selfie only if id doc checkbox is checked', async () => {
        await renderCreateDialogOnTheCollectDataSection();

        const idDocCheckbox = screen.getByLabelText(
          'ID Document',
        ) as HTMLInputElement;
        expect(idDocCheckbox).toBeInTheDocument();
        expect(idDocCheckbox.checked).toBe(false);

        expect(screen.queryByLabelText('Selfie')).toEqual(null);

        await userEvent.click(idDocCheckbox);
        await waitFor(() => {
          expect(idDocCheckbox.checked).toBe(true);
        });

        await waitFor(() => {
          const selfieCheckbox = screen.getByLabelText(
            'Selfie',
          ) as HTMLInputElement;
          expect(selfieCheckbox).toBeInTheDocument();
        });
        const selfieCheckbox = screen.getByLabelText(
          'Selfie',
        ) as HTMLInputElement;
        expect(selfieCheckbox.checked).toBe(false);

        await userEvent.click(selfieCheckbox);
        await waitFor(() => {
          expect(selfieCheckbox.checked).toBe(true);
        });

        // Uncheck ID doc, selfie checkbox should be unchecked after that too
        await userEvent.click(idDocCheckbox);
        await waitFor(() => {
          expect(idDocCheckbox.checked).toBe(false);
        });

        await waitFor(() => {
          expect(selfieCheckbox).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('"Access data" section', () => {
    it('should only show the fields that were selected in the previous step', async () => {
      await renderCreateDialogOnTheCollectDataSection();

      const nameCheckbox = screen.getByLabelText('Full name');
      await userEvent.click(nameCheckbox);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('access-form')).toBeVisible();
      });

      const allCheckboxes = screen.getAllByRole('checkbox', {
        checked: true,
      });

      // Phone number + Email + Full name + address
      expect(allCheckboxes.length).toEqual(4);
    });

    it('should show id document but hide selfie if only the id doc was collected', async () => {
      await renderCreateDialogOnTheCollectDataSection();

      let idDocCheckbox = screen.getByLabelText('ID Document');
      await userEvent.click(idDocCheckbox);

      await waitFor(() => {
        const selfieCheckbox = screen.getByLabelText('Selfie');
        expect(selfieCheckbox).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('access-form')).toBeVisible();
      });

      idDocCheckbox = screen.getByLabelText('ID Document');
      expect(idDocCheckbox).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByLabelText('Selfie')).toEqual(null);
      });

      // Checking id doc doesn't make selfie appear
      await userEvent.click(idDocCheckbox);
      await waitFor(() => {
        expect(screen.queryByLabelText('Selfie')).toEqual(null);
      });
    });

    it('should show both the id doc and selfie if both were collected', async () => {
      await renderCreateDialogOnTheCollectDataSection();

      let idDocCheckbox = screen.getByLabelText(
        'ID Document',
      ) as HTMLInputElement;
      await userEvent.click(idDocCheckbox);

      await waitFor(() => {
        expect(idDocCheckbox.checked).toBe(true);
      });

      await waitFor(() => {
        const selfieCheckbox = screen.getByLabelText(
          'Selfie',
        ) as HTMLInputElement;
        expect(selfieCheckbox).toBeInTheDocument();
      });

      let selfieCheckbox = screen.getByLabelText('Selfie') as HTMLInputElement;
      expect(selfieCheckbox.checked).toBe(false);

      await userEvent.click(selfieCheckbox);
      await waitFor(() => {
        expect(selfieCheckbox.checked).toBe(true);
      });

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('access-form')).toBeVisible();
      });

      idDocCheckbox = screen.getByLabelText('ID Document') as HTMLInputElement;
      expect(idDocCheckbox).toBeInTheDocument();
      expect(idDocCheckbox.checked).toBe(true);

      selfieCheckbox = screen.getByLabelText('Selfie') as HTMLInputElement;
      expect(selfieCheckbox).toBeInTheDocument();
      expect(selfieCheckbox.checked).toBe(true);

      await userEvent.click(selfieCheckbox);

      await waitFor(() => {
        expect(selfieCheckbox.checked).toBe(false);
      });

      await userEvent.click(idDocCheckbox);

      await waitFor(() => {
        expect(idDocCheckbox.checked).toBe(false);
      });

      // Unchecking the id document box hides the selfie checkbox
      await waitFor(() => {
        expect(selfieCheckbox).not.toBeInTheDocument();
      });
    });

    describe('when selecting the ssn', () => {
      describe('when collecting the full ssn', () => {
        it('should show only the SSN field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const ssnCheckbox = screen.getByLabelText('SSN');
          await userEvent.click(ssnCheckbox);

          const ssnRadio = screen.getByLabelText('Full');
          await userEvent.click(ssnRadio);

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const fullSsn = screen.getByLabelText('SSN');
          expect(fullSsn).toBeInTheDocument();
        });
      });

      describe('when collecting the last four ssn', () => {
        it('should show only the SSN (last 4) field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const ssnCheckbox = screen.getByLabelText('SSN');
          await userEvent.click(ssnCheckbox);

          const ssnRadio = screen.getByLabelText('Last 4');
          await userEvent.click(ssnRadio);

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const last4Ssn = screen.getByLabelText('SSN (last 4)');
          expect(last4Ssn).toBeInTheDocument();
        });
      });
    });

    describe('when selecting the address', () => {
      describe('when collecting the full address', () => {
        it('should show the Address field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const addressCheckbox = screen.getByLabelText('Address');
          await userEvent.click(addressCheckbox);

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);

          await waitFor(() => {
            expect(screen.getByTestId('access-form')).toBeVisible();
          });

          const addressFullCheckbox = screen.getByLabelText('Address');
          expect(addressFullCheckbox).toBeInTheDocument();
        });
      });

      // TODO: https://linear.app/footprint/issue/FP-1607/improve-toggle-react-hook-form-integration
      describe.skip('when collecting the partial address', () => {
        it('should show the Address (Country & Zip Code) field', async () => {
          await renderCreateDialogOnTheCollectDataSection();

          const addressCheckbox = screen.getByLabelText('Address');
          await userEvent.click(addressCheckbox);

          const addressRadio = screen.getByLabelText('Country & Zip Code');
          await userEvent.click(addressRadio);

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);

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
