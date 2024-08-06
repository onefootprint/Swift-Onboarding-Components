import themes from '@onefootprint/design-tokens';
import { screen, userEvent } from '@onefootprint/test-utils';
import { useState } from 'react';

import { renderComponents } from '../../../../../../../../config/tests';
import type { CardCvcProps } from './card-cvc';
import CardCvc from './card-cvc';

const Wrapper = ({
  hasError,
  numDigits = 4,
  hint,
  testID = 'card-cvc-input-test-id',
  value = '',
}: Partial<CardCvcProps>) => {
  const [cvcLength, setCvcLength] = useState(numDigits);
  const [val, setValue] = useState<string>(value);
  const handleChangeText = (text: string) => {
    setValue(text);
  };

  return (
    <>
      <button onClick={() => setCvcLength(3)} type="button">
        Change to 3 digits
      </button>
      <CardCvc
        numDigits={cvcLength}
        hasError={hasError}
        hint={hint}
        testID={testID}
        onChangeText={handleChangeText}
        value={val}
      />
    </>
  );
};

const renderCardCvc = ({ hasError, numDigits, hint, testID, value }: Partial<CardCvcProps>) =>
  renderComponents(<Wrapper hasError={hasError} numDigits={numDigits} hint={hint} testID={testID} value={value} />);

describe('<CardCvc />', () => {
  it('should add a test id attribute', () => {
    renderCardCvc({ testID: 'card-cvc-input-test-id' });
    expect(screen.getByTestId('card-cvc-input-test-id')).toBeInTheDocument();
  });

  it('should not accept non numeric value', () => {
    renderCardCvc({ value: 'abcde' });
    expect(screen.queryByDisplayValue('abcde')).not.toBeInTheDocument();
  });

  it('should accept numeric value', () => {
    renderCardCvc({ value: '567' });
    expect(screen.getByDisplayValue('567')).toBeInTheDocument();
  });

  it('should show only three digits when max is set to 3 digits', () => {
    renderCardCvc({ value: '5678', numDigits: 3 });
    expect(screen.queryByDisplayValue('5678')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('567')).toBeInTheDocument();
  });

  it('should show only four digits when max is set to 4 digits', () => {
    renderCardCvc({ value: '56789', numDigits: 4 });
    expect(screen.queryByDisplayValue('56789')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('5678')).toBeInTheDocument();
  });

  it('should be able to change the CVC by passing prop on the fly', async () => {
    renderCardCvc({ numDigits: 4 });
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '56789');
    expect(screen.queryByDisplayValue('56789')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('5678')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Change to 3 digits' });
    await userEvent.click(button);

    expect(screen.queryByDisplayValue('5678')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('567')).toBeInTheDocument();
  });

  it('should show "123" as placeholder text when max is set to 3 digits', () => {
    renderCardCvc({ numDigits: 3 });
    expect(screen.queryByPlaceholderText('1234')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
  });

  it('should show "1234" as placeholder text when max is set to 3 digits', () => {
    renderCardCvc({ numDigits: 4 });
    expect(screen.queryByPlaceholderText('123')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234')).toBeInTheDocument();
  });

  it('should show hint', () => {
    renderCardCvc({ hint: 'hint' });
    expect(screen.getByText('hint')).toBeInTheDocument();
  });

  it('should show hint in error styling when there is an error', () => {
    renderCardCvc({ hint: 'hint', hasError: true });
    const hint = screen.getByText('hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveStyle({
      color: themes.light.color.error,
    });
  });
});
