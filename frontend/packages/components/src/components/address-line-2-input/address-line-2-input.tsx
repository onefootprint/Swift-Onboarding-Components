import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressLine2InputProps = InputProps;

const AddressLine2Input = ({ className, ...props }: AddressLine2InputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'address-line2' });
  const error = errors.addressLine2;

  return (
    <Input
      autoComplete="address-line2"
      className={cx('fp-address-line2-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('addressLine2')}
    />
  );
};

export default AddressLine2Input;
