import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type AddressLine2InputProps = InputHTMLAttributes<HTMLInputElement>;

const AddressLine2Input = ({ className, ...props }: AddressLine2InputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'address-line2' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="address-line2"
      className={cx('fp-address-line2-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register('id.address_line2')}
    />
  );
};

export default AddressLine2Input;
