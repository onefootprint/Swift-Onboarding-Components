/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from '@onefootprint/hooks';
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
      invalidMessage,
      label,
      value,
      ...props
    }: CardNumberInputProps,
    ref,
  ) => {
    const { t } = useTranslation('pages.secure-form.card.form.number');
    const brand = creditcardutils.parseCardType(value || '');
    const [blurred, setBlurred] = useState(false);
    const [isInvalid, setIsInvalid] = useState(
      value ? checkIsInvalid(value) : false,
    );
    const inputHasError = hasError || (blurred && isInvalid);
    const errorMessageText = invalidMessage ?? t('invalid');
    const errorMessage = blurred && isInvalid ? errorMessageText : undefined;

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
        label={label ?? t('label')}
        mask={{ creditCard: true }}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={t('placeholder')}
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
