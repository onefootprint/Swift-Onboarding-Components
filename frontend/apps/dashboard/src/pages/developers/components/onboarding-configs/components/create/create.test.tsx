import {
  customRender,
  screen,
  userEvent,
  waitFor,
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
  });
});
