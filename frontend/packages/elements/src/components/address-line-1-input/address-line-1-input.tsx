import cx from 'classnames';
import get from 'lodash/get';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressLine1InputProps = InputProps;

const identifier = 'id.address_line1';

const AddressLine1Input = ({ className, ...props }: AddressLine1InputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'address-line1' });
  const error = get(errors, identifier);

  return (
    <Input
      autoComplete="address-line1"
      className={cx('fp-address-line1-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressLine1Input;
