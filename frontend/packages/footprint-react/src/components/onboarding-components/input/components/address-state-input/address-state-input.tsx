import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type AddressStateInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.state';

const AddressStateInput = ({ className, ...props }: AddressStateInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'state' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      className={cx('fp-state-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressStateInput;
