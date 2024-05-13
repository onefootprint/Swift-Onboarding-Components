import cx from 'classnames';
import get from 'lodash/get';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressLine2InputProps = InputProps;

const identifier = 'id.address_line2';

const AddressLine2Input = ({ className, ...props }: AddressLine2InputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'address-line2' });
  const error = get(errors, identifier);

  return (
    <Input
      autoComplete="address-line2"
      className={cx('fp-address-line2-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier)}
    />
  );
};

export default AddressLine2Input;
