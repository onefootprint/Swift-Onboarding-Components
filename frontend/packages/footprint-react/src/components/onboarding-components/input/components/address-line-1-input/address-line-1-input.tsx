import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type AddressLine1InputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.address_line1';

const AddressLine1Input = ({ className, ...props }: AddressLine1InputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'address-line1' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="address-line1"
      className={cx('fp-address-line1-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressLine1Input;
