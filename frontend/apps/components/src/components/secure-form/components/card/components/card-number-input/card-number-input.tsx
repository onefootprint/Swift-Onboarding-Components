/* eslint-disable react/jsx-props-no-spreading */
import { InputProps, InternalInput } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import React, { forwardRef, useEffect, useState } from 'react';

import CardIcon from './components/card-icon';

export type CardNumberInputProps = Omit<
  InputProps,
  | 'autoComplete'
  | 'inputMode'
  | 'mask'
  | 'value'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'size'
  | 'type'
> & {
  invalidMessage?: string;
  value?: string;
};

const checkIsInvalid = (cardNumber?: string) => {
  if (!cardNumber) {
    return false;
  }
  return !isValidCardNumber(cardNumber);
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
    const brand = creditcardutils.parseCardType(value || '');
    const [blurred, setBlurred] = useState(false);
    const [isInvalid, setIsInvalid] = useState(
      value ? checkIsInvalid(value) : false,
    );
    const inputHasError = hasError || (blurred && isInvalid);
    const errorMessage = blurred && isInvalid ? invalidMessage : undefined;

    useEffect(() => {
      setIsInvalid(value ? checkIsInvalid(value) : false);
    }, [value]);

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setBlurred(true);
      setIsInvalid(checkIsInvalid(event.target.value));
      onBlur?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBlurred(false);
      setIsInvalid(false);
      onChange?.(event);
    };

    return (
      <InternalInput
        {...props}
        autoComplete="cc-number"
        className="fp-input-credit-card"
        hasError={inputHasError}
        hint={errorMessage ?? hint}
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
