/* eslint-disable react/jsx-props-no-spreading */
import type { InputProps } from '@onefootprint/ui';
import { InternalInput } from '@onefootprint/ui';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

export type CardExpDateInputProps = Omit<
  InputProps,
  'autoComplete' | 'inputMode' | 'mask' | 'value' | 'maxLength' | 'minLength' | 'placeholder' | 'size' | 'type'
> & {
  invalidMessage?: string;
  value?: string;
};

const CardExpDateInput = forwardRef<HTMLInputElement, CardExpDateInputProps>(
  ({ hasError, hint, invalidMessage, label, value, ...props }: CardExpDateInputProps, ref) => {
    const { t } = useTranslation('common', {
      keyPrefix: 'pages.secure-form.card.form.expiry',
    });

    return (
      <InternalInput
        {...props}
        autoComplete="cc-exp"
        className="fp-input-exp-date"
        hasError={hasError}
        hint={hint}
        inputMode="numeric"
        label={label ?? t('label')}
        mask={{
          date: true,
          datePattern: ['m', 'y'],
        }}
        placeholder="MM / YY"
        ref={ref}
        size="default"
        value={value}
      />
    );
  },
);

export default CardExpDateInput;
