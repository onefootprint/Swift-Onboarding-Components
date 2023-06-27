import { screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { renderComponents } from '../../../../../../../../config/tests';
import CardNumberInput, { CardNumberInputProps } from './card-number-input';
import InteractiveCardNumberInput from './card-number-input.test.config';

const renderCardNumberInput = ({
  hasError,
  hint,
  label,
  value,
  invalidMessage,
}: Partial<CardNumberInputProps>) =>
  renderComponents(
    <CardNumberInput
      hasError={hasError}
      hint={hint}
      label={label}
      value={value}
      invalidMessage={invalidMessage}
    />,
  );

const renderInteractiveInput = ({
  invalidMessage,
}: Partial<CardNumberInputProps> = {}) =>
  renderComponents(
    <InteractiveCardNumberInput invalidMessage={invalidMessage} />,
  );

const getCardNumberInput = () =>
  screen.getByLabelText('Card number') as HTMLInputElement;

describe('<CardNumberInput />', () => {
  it('should render the label', () => {
    renderCardNumberInput({ label: 'some label' });
    expect(screen.getByLabelText('some label')).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    renderCardNumberInput({ hint: 'hint' });
    expect(screen.getByText('hint')).toBeInTheDocument();
  });

  describe('when it has an error', () => {
    it('should add an error border to the input', () => {
      renderCardNumberInput({
        hasError: true,
      });

      const firstInput = screen.getByLabelText('Card number');
      expect(firstInput).toHaveStyle({
        borderColor: 'var(--fp-base-inputs-base-hint-error)',
      });
    });
  });

  it('should not accept non numeric value', () => {
    renderCardNumberInput({ value: 'abcde' });
    expect(screen.queryByDisplayValue('abcde')).not.toBeInTheDocument();
  });

  it('should accept numeric value', () => {
    renderCardNumberInput({ value: '4242' });
    expect(screen.getByDisplayValue('4242')).toBeInTheDocument();
  });

  describe('error handling', () => {
    it('should hide error message when user starts typing again', async () => {
      renderInteractiveInput();
      const input = getCardNumberInput();
      await userEvent.type(input, '1111');
      userEvent.tab();
      await waitFor(() => {
        const errorMessage = screen.getByText('Invalid card number');
        expect(errorMessage).toBeInTheDocument();
      });
      await userEvent.type(input, '4242');
      await waitFor(() => {
        const errorMessage = screen.queryByText('Invalid card number');
        expect(errorMessage).not.toBeInTheDocument();
      });
    });

    it('should display custom error message for invalid card number', async () => {
      const customInvalidMessage = 'This card number is not valid!';
      renderInteractiveInput({ invalidMessage: customInvalidMessage });
      const input = getCardNumberInput();
      await userEvent.type(input, '1111');
      userEvent.tab();
      await waitFor(() => {
        const errorMessage = screen.getByText(customInvalidMessage);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('brands', () => {
    describe('visa', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '4242424242424242' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('4242 4242 4242 4242');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '4242 4242');
        expect(input.value).toEqual('4242 4242 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '4242424242424242' });
        expect(screen.getByRole('img', { name: 'visa' })).toBeInTheDocument();
      });
    });

    describe('mastercard', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '5555555555554444' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('5555 5555 5555 4444');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '5555 5555');
        expect(input.value).toEqual('5555 5555 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '5555555555554444' });
        expect(
          screen.getByRole('img', { name: 'mastercard' }),
        ).toBeInTheDocument();
      });
    });

    describe('amex', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '378282246310005' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('3782 822463 10005');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '3782 822463');
        expect(input.value).toEqual('3782 822463 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '378282246310005' });
        expect(screen.getByRole('img', { name: 'amex' })).toBeInTheDocument();
      });
    });

    describe('discover', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '6011111111111117' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('6011 1111 1111 1117');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '6011 1111');
        expect(input.value).toEqual('6011 1111 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '6011111111111117' });
        expect(
          screen.getByRole('img', { name: 'discover' }),
        ).toBeInTheDocument();
      });
    });

    describe('diners', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '3600 0000 0000 08	' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('3600 000000 0008');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '3600 000000');
        expect(input.value).toEqual('3600 000000 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '3600 0000 0000 08	' });
        expect(
          screen.getByRole('img', { name: 'dinersclub' }),
        ).toBeInTheDocument();
      });
    });

    describe('jcb', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '3530111333300000' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('3530 1113 3330 0000');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '3530 1113');
        expect(input.value).toEqual('3530 1113 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '3530111333300000' });
        expect(screen.getByRole('img', { name: 'jcb' })).toBeInTheDocument();
      });
    });

    describe('unionpay', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '6200000000000005' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('6200 0000 0000 0005');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '6200 0000');
        expect(input.value).toEqual('6200 0000 ');
      });

      it('should render the brand icon', () => {
        renderCardNumberInput({ value: '6200000000000005' });
        expect(
          screen.getByRole('img', { name: 'unionpay' }),
        ).toBeInTheDocument();
      });
    });
  });
});
