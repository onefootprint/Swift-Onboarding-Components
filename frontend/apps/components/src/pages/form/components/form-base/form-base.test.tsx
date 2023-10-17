import { FootprintFormType } from '@onefootprint/footprint-js';
import {
  createGoogleMapsSpy,
  getPlacePredictions,
  render,
  screen,
  userEvent,
  waitFor,
  Wrapper,
} from '@onefootprint/test-utils';
import React from 'react';
import FootprintProvider from 'src/components/footprint-provider';

import type { FormBaseProps } from './form-base';
import FormBase from './form-base';

describe('<FormBase />', () => {
  const renderFormBase = ({
    title,
    type,
    variant,
    isLoading,
    hideFootprintLogo,
    hideButtons,
    onSave,
    onCancel,
    onClose,
  }: FormBaseProps) => {
    const footprint = {
      on: jest.fn(),
      send: jest.fn(),
      load: jest.fn(),
    };

    return render(
      <Wrapper>
        <FootprintProvider client={footprint}>
          <FormBase
            title={title}
            type={type}
            variant={variant}
            isLoading={isLoading}
            hideFootprintLogo={hideFootprintLogo}
            hideButtons={hideButtons}
            onSave={onSave}
            onCancel={onCancel}
            onClose={onClose}
          />
        </FootprintProvider>
      </Wrapper>,
    );
  };

  beforeEach(() => {
    createGoogleMapsSpy();
    getPlacePredictions.mockClear();
  });

  describe('When receiving options', () => {
    it('should show save button, close button and logo by default', () => {
      renderFormBase({});
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByTestId('secured-by-footprint')).toBeInTheDocument();
    });

    it('should show cancel button if onCancel is provided', async () => {
      renderFormBase({ onCancel: jest.fn() });
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
    });

    it('should hide buttons', () => {
      renderFormBase({ hideButtons: true });
      expect(
        screen.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Cancel' }),
      ).not.toBeInTheDocument();
    });

    it('should hide footprint logo', () => {
      renderFormBase({ hideFootprintLogo: true });
      expect(
        screen.queryByTestId('secured-by-footprint'),
      ).not.toBeInTheDocument();
    });

    it('should show title', () => {
      renderFormBase({ title: 'My title' });
      expect(screen.getByText('My title')).toBeInTheDocument();
    });

    it('should omit title if not provided', () => {
      renderFormBase({});
      expect(screen.queryByTestId('form-title')).not.toBeInTheDocument();
    });

    it('should show loading state', () => {
      renderFormBase({
        isLoading: true,
        onSave: jest.fn(),
        onCancel: jest.fn(),
      });
      // Save button should have loading state
      const primaryButton = screen.getByTestId('primary-button');
      expect(primaryButton).toHaveAttribute('data-loading', 'true');

      // Cancel button should be disabled
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });

  describe('when saving the form using the save button', () => {
    it('should trigger onSave if data is valid', async () => {
      const onSave = jest.fn();
      renderFormBase({ onSave, type: FootprintFormType.cardOnly });
      // Fill card number, cvc and expiration
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Card number' }),
        '378282246310005',
      );
      await userEvent.type(screen.getByRole('textbox', { name: 'CVC' }), '123');
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Expiry date' }),
        '09/29',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });

    it('should not trigger onSave if form data has errors', async () => {
      const onSave = jest.fn();
      renderFormBase({ onSave, type: FootprintFormType.cardOnly });

      // Try saving empty form
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(
          screen.getByText('Card number cannot be empty'),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('CVC cannot be empty')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText('Expiry date cannot be empty'),
        ).toBeInTheDocument();
      });

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Card number' }),
        '42',
      );

      // Fill with expired date, invalid card number
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Expiry date' }),
        '09/21',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => {
        expect(screen.getByText('Invalid card number')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText('Date must be valid and in the future'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when closing or canceling the form', () => {
    it('canceling should trigger onCancel', async () => {
      const onCancel = jest.fn();
      renderFormBase({ onCancel });
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it('closing should trigger onClose', async () => {
      const onClose = jest.fn();
      renderFormBase({ onClose });
      await userEvent.click(screen.getByTestId('close-button'));
      expect(screen.getByTestId('close-button')).toBeInTheDocument();

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('closing should show confirmation dialog if form state is dirty', async () => {
      const onClose = jest.fn();
      renderFormBase({ onClose, type: FootprintFormType.cardOnly });
      // Fill card number, cvc and expiration
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Card number' }),
        '378282246310005',
      );

      await userEvent.click(screen.getByTestId('close-button'));
      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Yes'));
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('canceling should show confirmation dialog if form state is dirty', async () => {
      const onCancel = jest.fn();
      renderFormBase({ onCancel, type: FootprintFormType.cardOnly });
      // Fill card number, cvc and expiration
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Card number' }),
        '378282246310005',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(onCancel).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Yes'));
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('when rendering different form types', () => {
    it('should render cardOnly correctly', async () => {
      renderFormBase({ type: FootprintFormType.cardOnly });
      expect(screen.getByText('Card number')).toBeInTheDocument();
      expect(screen.getByText('CVC')).toBeInTheDocument();
      expect(screen.getByText('Expiry date')).toBeInTheDocument();
    });

    it('should render cardAndName correctly', async () => {
      renderFormBase({ type: FootprintFormType.cardAndName });
      expect(screen.getByText('Card number')).toBeInTheDocument();
      expect(screen.getByText('CVC')).toBeInTheDocument();
      expect(screen.getByText('Expiry date')).toBeInTheDocument();
      expect(screen.getByText('Cardholder name')).toBeInTheDocument();
    });

    it('should render cardAndNameAndAddress correctly', async () => {
      renderFormBase({ type: FootprintFormType.cardAndNameAndAddress });
      expect(screen.getByText('Card number')).toBeInTheDocument();
      expect(screen.getByText('CVC')).toBeInTheDocument();
      expect(screen.getByText('Expiry date')).toBeInTheDocument();
      expect(screen.getByText('Cardholder name')).toBeInTheDocument();
      expect(screen.getByText('Address line 1')).toBeInTheDocument();
      expect(screen.getByText('Address line 2 (optional)')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Zip code')).toBeInTheDocument();
    });

    it('should render cardAndZip correctly', async () => {
      renderFormBase({ type: FootprintFormType.cardAndZip });
      expect(screen.getByText('Card number')).toBeInTheDocument();
      expect(screen.getByText('CVC')).toBeInTheDocument();
      expect(screen.getByText('Expiry date')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Zip code')).toBeInTheDocument();
    });
  });
});
