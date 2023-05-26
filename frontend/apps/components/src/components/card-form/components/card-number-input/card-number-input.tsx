/* eslint-disable react/jsx-props-no-spreading */
import { InputProps, InternalInput } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import React, { forwardRef, useState } from 'react';

import CardIcon from './components/card-icon';

export type CardNumberInputProps = Omit<
  InputProps,
  | 'autoComplete'
  | 'inputMode'
  | 'mask'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'size'
  | 'type'
> & {
  invalidMessage?: string;
};

const CardNumberInput = forwardRef<HTMLInputElement, CardNumberInputProps>(
  (
    {
      hasError,
      hint,
      onChange,
      onBlur,
      invalidMessage = 'Invalid card number',
      label = 'Card number',
      value,
      ...props
    }: CardNumberInputProps,
    ref,
  ) => {
    const [blurred, setBlurred] = useState(false);
    const brand = creditcardutils.parseCardType(value || '');
    const isValid = isValidCardNumber(value);
    const shouldShowError = blurred && (hasError || !isValid);
    const errorMessage = shouldShowError ? invalidMessage : undefined;

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setBlurred(true);
      onBlur?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBlurred(false);
      onChange?.(event);
    };

    return (
      <InternalInput
        {...props}
        autoComplete="cc-number"
        className="fp-input-credit-card"
        hasError={shouldShowError}
        hint={errorMessage || hint}
        inputMode="numeric"
        label={label}
        mask={{ creditCard: true }}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="1234 5678 9012 3456"
        ref={ref}
        size="default"
        suffixComponent={<CardIcon brand={brand} />}
        value={value}
      />
    );
  },
);

const isValidCardNumber = (value = '') => {
  if (value.length === 0) {
    return true;
  }
  return !!creditcardutils.validateCardNumber(value);
};

export default CardNumberInput;
