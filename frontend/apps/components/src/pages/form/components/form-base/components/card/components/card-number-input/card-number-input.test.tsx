import { screen, userEvent, waitFor } from '@onefootprint/test-utils';

import { renderComponents } from '../../../../../../../../config/tests';
import type { CardNumberInputProps } from './card-number-input';
import CardNumberInput from './card-number-input';

const renderCardNumberInput = ({ hasError, hint, label, value }: Partial<CardNumberInputProps>) =>
  renderComponents(<CardNumberInput hasError={hasError} hint={hint} label={label} value={value} />);

const getCardNumberInput = () => screen.getByLabelText('Card number') as HTMLInputElement;

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
      expect(firstInput.getAttribute('data-has-error')).toEqual('true');
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
    it('should display error message for invalid card number', async () => {
      const hint = 'This card number is not valid!';
      renderCardNumberInput({ hint, hasError: true });
      const input = getCardNumberInput();
      await userEvent.type(input, '1111');
      await userEvent.tab();
      await waitFor(() => {
        const errorMessage = screen.getByText(hint);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('brands', () => {
    describe('visa', () => {
      it('should format correctly', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '4242424242424242');
        await waitFor(() => {
          expect(input.value).toEqual('4242 4242 4242 4242');
        });
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '42424242');
        expect(input.value).toEqual('4242 4242 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '4242424242424242');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'visa' })).toBeInTheDocument();
        });
      });
    });

    describe('mastercard', () => {
      it('should format correctly', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '5555555555554444');
        await waitFor(() => {
          expect(input.value).toEqual('5555 5555 5555 4444');
        });
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '5555 5555');
        expect(input.value).toEqual('5555 5555 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '5555555555554444');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'mastercard' })).toBeInTheDocument();
        });
      });
    });

    describe('amex', () => {
      it('should format correctly', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '378282246310005');
        await waitFor(() => {
          expect(input.value).toEqual('3782 822463 10005');
        });
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '3782822463');
        expect(input.value).toEqual('3782 822463 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '378282246310005');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'amex' })).toBeInTheDocument();
        });
      });
    });

    describe('discover', () => {
      it('should format correctly', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '6011111111111117');
        await waitFor(() => {
          expect(input.value).toEqual('6011 1111 1111 1117');
        });
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '60111111');
        expect(input.value).toEqual('6011 1111 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '6011111111111117');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'discover' })).toBeInTheDocument();
        });
      });
    });

    describe('diners', () => {
      it('should format correctly', () => {
        renderCardNumberInput({ value: '30569309025904' });
        const input = getCardNumberInput();
        expect(input.value).toEqual('3056 930902 5904');
      });

      it('should format correctly when typing', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '3056 930932');
        expect(input.value).toEqual('3056 930932 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '30569309025904');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'dinersclub' })).toBeInTheDocument();
        });
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
        await userEvent.type(input, '35301113');
        expect(input.value).toEqual('3530 1113 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '3530111333300000');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'jcb' })).toBeInTheDocument();
        });
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
        await userEvent.type(input, '62000000');
        expect(input.value).toEqual('6200 0000 ');
      });

      it('should render the brand icon', async () => {
        renderCardNumberInput({});
        const input = getCardNumberInput();
        await userEvent.type(input, '6200000000000005');
        await waitFor(() => {
          expect(screen.getByRole('img', { name: 'unionpay' })).toBeInTheDocument();
        });
      });
    });
  });
});
