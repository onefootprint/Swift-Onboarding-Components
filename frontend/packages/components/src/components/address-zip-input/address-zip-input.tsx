import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressZipInputProps = InputProps;

const AddressZipInput = ({ className, ...props }: AddressZipInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'zip' });
  const error = errors.zip;

  return (
    <Input
      autoComplete="postal-code"
      className={cx('fp-zip-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('zip', {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressZipInput;
