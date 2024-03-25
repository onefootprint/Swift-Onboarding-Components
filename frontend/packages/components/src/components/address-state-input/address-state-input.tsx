import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressStateInputProps = InputProps;

const AddressStateInput = ({ className, ...props }: AddressStateInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'state' });
  const error = errors.state;

  return (
    <Input
      className={cx('fp-state-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('state', {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressStateInput;
