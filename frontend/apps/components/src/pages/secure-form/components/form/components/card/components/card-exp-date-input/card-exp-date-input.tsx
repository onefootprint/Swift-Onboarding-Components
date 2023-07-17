/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from '@onefootprint/hooks';
import { InputProps, InternalInput } from '@onefootprint/ui';
import { isPast, isValid, parse } from 'date-fns';
import React, { forwardRef, useEffect, useState } from 'react';

export type CardExpDateInputProps = Omit<
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

const checkIsInvalid = (dateValue: string) => {
  if (!dateValue) {
    return false;
  }
  const parsedDate = parse(dateValue, 'MM/yy', new Date());
  return isPast(parsedDate) || !isValid(parsedDate);
};

const CardExpDateInput = forwardRef<HTMLInputElement, CardExpDateInputProps>(
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
    }: CardExpDateInputProps,
    ref,
  ) => {
    const { t } = useTranslation('pages.secure-form.card.form.expiry');
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
        autoComplete="cc-exp"
        className="fp-input-exp-date"
        hasError={inputHasError}
        hint={errorMessage ?? hint}
        inputMode="numeric"
        label={label ?? t('label')}
        mask={{
          date: true,
          datePattern: ['m', 'y'],
        }}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="MM / YY"
        ref={ref}
        size="default"
        value={value}
      />
    );
  },
);

export default CardExpDateInput;
