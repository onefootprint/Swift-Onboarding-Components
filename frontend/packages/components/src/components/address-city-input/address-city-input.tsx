import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressCityInputProps = InputProps;

const AddressCityInput = ({ className, ...props }: AddressCityInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'city' });
  const error = errors.city;

  return (
    <Input
      autoComplete="address-level2"
      className={cx('fp-city-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('city', {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressCityInput;
