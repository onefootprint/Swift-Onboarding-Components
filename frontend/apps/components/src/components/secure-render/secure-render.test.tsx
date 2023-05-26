import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import SecureRender, { SecureRenderProps } from './secure-render';

const CARD_VALUE = '4242424242424242';
const CARD_FORMATTED = '4242 4242 4242 4242';
const CARD_HIDDEN = '•••• •••• •••• ••••';

const CARD_AMEX_VALUE = '378282246310005';
const CARD_AMEX_FORMATTED = '3782 822463 10005';
const CARD_AMEX_HIDDEN = '•••• •••••• •••••';

const CARD_CVV_VALUE = '123';
const CARD_CVV_FORMATTED = '123';
const CARD_CVV_HIDDEN = '•••';

const CARD_EXP_DATE = '1223';
const CARD_EXP_DATE_FORMATTED = '12 / 23';
const CARD_EXP_DATE_HIDDEN = '•• / ••';

describe('<SecureRender />', () => {
  const renderSecureRender = ({
    isHidden = false,
    label,
    mask = 'creditCard',
    onShow,
    value = '4242424242424242',
  }: Partial<SecureRenderProps>) =>
    customRender(
      <SecureRender
        isHidden={isHidden}
        label={label}
        mask={mask}
        onShow={onShow}
        value={value}
      />,
    );

  it('should render value', () => {
    renderSecureRender({ value: CARD_CVV_VALUE, isHidden: false, mask: 'cvv' });
    const value = screen.getByText(CARD_CVV_VALUE);
    expect(value).toBeInTheDocument();
  });

  it('should render the label', () => {
    renderSecureRender({ label: 'label', isHidden: false, mask: 'cvv' });
    const customLabel = screen.getByText('label');
    expect(customLabel).toBeInTheDocument();
  });

  it('should hide the card value when isHidden is true', () => {
    renderSecureRender({
      isHidden: true,
      mask: 'creditCard',
      value: CARD_VALUE,
    });
    const hiddenValue = screen.getByText(CARD_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });

  it('should format the card value when isHidden is false', () => {
    renderSecureRender({
      isHidden: false,
      mask: 'creditCard',
      value: CARD_VALUE,
    });
    const formattedValue = screen.getByText(CARD_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should format the amex card value when isHidden is false', () => {
    renderSecureRender({
      isHidden: false,
      mask: 'creditCard',
      value: CARD_AMEX_VALUE,
    });
    const formattedValue = screen.getByText(CARD_AMEX_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should show the right hidden value when amex card is hidden', () => {
    renderSecureRender({
      isHidden: true,
      mask: 'creditCard',
      value: CARD_AMEX_VALUE,
    });
    const hiddenValue = screen.getByText(CARD_AMEX_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });

  it('should format the cvv value when isHidden is false', () => {
    renderSecureRender({
      isHidden: false,
      mask: 'cvv',
      value: CARD_CVV_VALUE,
    });
    const formattedValue = screen.getByText(CARD_CVV_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should hide the cvv value when isHidden is true', () => {
    renderSecureRender({
      isHidden: true,
      mask: 'cvv',
      value: CARD_CVV_VALUE,
    });
    const hiddenValue = screen.getByText(CARD_CVV_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });

  it('should render the copy button when isHidden is false', () => {
    renderSecureRender({
      isHidden: false,
      mask: 'creditCard',
      value: CARD_VALUE,
    });
    const copyButton = screen.getByRole('button');
    expect(copyButton).toBeInTheDocument();
  });

  it('should format the date value when isHidden is false', () => {
    renderSecureRender({
      isHidden: false,
      mask: 'date',
      value: CARD_EXP_DATE,
    });
    const formattedValue = screen.getByText(CARD_EXP_DATE_FORMATTED);
    expect(formattedValue).toBeInTheDocument();
  });

  it('should hide the date value when isHidden is true', () => {
    renderSecureRender({
      isHidden: true,
      mask: 'date',
      value: CARD_EXP_DATE,
    });
    const hiddenValue = screen.getByText(CARD_EXP_DATE_HIDDEN);
    expect(hiddenValue).toBeInTheDocument();
  });
});
