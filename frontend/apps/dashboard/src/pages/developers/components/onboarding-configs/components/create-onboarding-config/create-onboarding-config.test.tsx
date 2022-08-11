import React from 'react';
import { customRender, screen, userEvent, waitFor, within } from 'test-utils';

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
    it('should show an error if nothing was selected and remove it once the user selects a field', async () => {
      await renderCreateDialogOnTheCollectDataSection();

      const collectForm = screen.getByTestId('collect-form');

      const allCheckbox = within(collectForm).getByLabelText('All');
      await userEvent.click(allCheckbox);

      const continueButton = screen.getByRole('button', {
        name: 'Continue',
      });
      await userEvent.click(continueButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Choose at least one data attribute to continue.',
        );
        expect(errorMessage).toBeInTheDocument();
      });
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

      const collectForm = screen.getByTestId('collect-form');

      const allCheckbox = within(collectForm).getByLabelText('All');
      await userEvent.click(allCheckbox);

      const nameCheckbox = within(collectForm).getByLabelText('Email');
      await userEvent.click(nameCheckbox);

      const phoneCheckbox = within(collectForm).getByLabelText('Phone number');
      await userEvent.click(phoneCheckbox);

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId('access-form')).toBeVisible();
      });

      const accessForm = screen.getByTestId('access-form');
      const allCheckboxes = within(accessForm).getAllByRole('checkbox', {
        checked: true,
      });

      // All + Email + Phone number
      expect(allCheckboxes.length).toEqual(3);
    });

    describe('when the user selectes only the SSN (Last 4) in the "Collect form" section', () => {
      it('should show only the SSN (Last 4) field', async () => {
        await renderCreateDialogOnTheCollectDataSection();

        const collectForm = screen.getByTestId('collect-form');

        const lastFourSsn = within(collectForm).getByLabelText('Last 4');
        await userEvent.click(lastFourSsn);

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(screen.getByTestId('access-form')).toBeVisible();
        });

        const last4Ssn = screen.getByLabelText('SSN (last 4)');
        expect(last4Ssn).toBeInTheDocument();
      });
    });

    describe('when the user selectes only one option in the "Collect form" section', () => {
      it('should not show the field "All"', async () => {
        await renderCreateDialogOnTheCollectDataSection();

        const collectForm = screen.getByTestId('collect-form');

        const allCheckbox = within(collectForm).getByLabelText('All');
        await userEvent.click(allCheckbox);

        const nameCheckbox = within(collectForm).getByLabelText('Email');
        await userEvent.click(nameCheckbox);

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(screen.getByTestId('access-form')).toBeVisible();
        });

        const accessForm = screen.getByTestId('access-form');
        const allCheckboxes = within(accessForm).getAllByRole('checkbox', {
          checked: true,
        });

        expect(allCheckboxes.length).toEqual(1);
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
