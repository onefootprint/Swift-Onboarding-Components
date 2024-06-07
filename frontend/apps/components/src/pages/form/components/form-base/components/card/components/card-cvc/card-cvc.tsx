/* eslint-disable react/jsx-props-no-spreading */
import type { InputProps } from '@onefootprint/ui';
import { InternalInput } from '@onefootprint/ui';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

export enum CvcLength {
  three = 3,
  four = 4,
}

export type CardCvcProps = Omit<
  InputProps,
  'autoComplete' | 'inputMode' | 'mask' | 'value' | 'maxLength' | 'minLength' | 'placeholder' | 'size' | 'type'
> & {
  numDigits: CvcLength;
  invalidMessage?: string;
  value?: string;
};

const CardCvc = forwardRef<HTMLInputElement, CardCvcProps>(
  ({ numDigits, hasError, hint, onChange, onBlur, label, value, ...props }: CardCvcProps, ref) => {
    const { t } = useTranslation('common', {
      keyPrefix: 'pages.secure-form.card.form.cvc',
    });

    return (
      <InternalInput
        {...props}
        width="100%"
        autoComplete="cc-csc"
        className="fp-input-cvc"
        hasError={hasError}
        hint={hint}
        inputMode="numeric"
        label={label ?? t('label')}
        mask={{
          numericOnly: true,
          blocks: [numDigits === CvcLength.three ? 3 : 4],
        }}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={numDigits === CvcLength.three ? '123' : '1234'}
        ref={ref}
        size="default"
        value={value}
        key={numDigits}
      />
    );
  },
);

export default CardCvc;
