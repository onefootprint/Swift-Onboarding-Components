import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type AddressZipInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.zip';

const AddressZipInput = ({ className, ...props }: AddressZipInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'zip' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="postal-code"
      className={cx('fp-zip-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressZipInput;
