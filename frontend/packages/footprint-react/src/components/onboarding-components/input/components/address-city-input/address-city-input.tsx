import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type AddressCityInputProps = InputHTMLAttributes<HTMLInputElement>;

const AddressCityInput = ({ className, ...props }: AddressCityInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'city' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="address-level2"
      className={cx('fp-city-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register('id.city', {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressCityInput;
