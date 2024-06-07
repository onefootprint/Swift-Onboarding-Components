/* eslint-disable react/jsx-props-no-spreading */
import type { InputProps } from '@onefootprint/ui';
import { InternalInput } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardIcon from './components/card-icon';

export type CardNumberInputProps = Omit<
  InputProps,
  'autoComplete' | 'inputMode' | 'mask' | 'value' | 'maxLength' | 'minLength' | 'placeholder' | 'size' | 'type'
> & {
  value?: string;
};

const CardNumberInput = forwardRef<HTMLInputElement, CardNumberInputProps>(
  ({ hasError, hint, onChange, label, value, ...props }: CardNumberInputProps, ref) => {
    const { t } = useTranslation('common', {
      keyPrefix: 'pages.secure-form.card.form.number',
    });
    const [brand, setBrand] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBrand(creditcardutils.parseCardType(event.target.value));
      onChange?.(event);
    };

    return (
      <InternalInput
        {...props}
        autoComplete="cc-number"
        className="fp-input-credit-card"
        hasError={hasError}
        hint={hint}
        inputMode="numeric"
        label={label ?? t('label')}
        mask={{ creditCard: true }}
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

export default CardNumberInput;
