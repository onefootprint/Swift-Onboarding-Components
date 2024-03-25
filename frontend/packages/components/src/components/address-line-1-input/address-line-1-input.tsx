import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressLine1InputProps = InputProps;

const AddressLine1Input = ({ className, ...props }: AddressLine1InputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'address-line1' });
  const error = errors.addressLine1;

  return (
    <Input
      autoComplete="address-line1"
      className={cx('fp-address-line1-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('addressLine1', {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressLine1Input;
