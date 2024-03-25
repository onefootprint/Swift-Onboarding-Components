import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
} from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type DobInputProps = InputProps;

const DobInput = ({ className, ...props }: DobInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'dob' });
  const error = errors.dob;

  return (
    <Input
      autoComplete="bday"
      className={cx('fp-dob-input', className)}
      hasError={!!error}
      inputMode="numeric"
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('dob', {
        required: t('errors.required'),
        validate: (value = '') => {
          if (isDobInTheFuture(value)) {
            return t('errors.future-date');
          }
          if (isDobTooYoung(value)) {
            return t('errors.too-young');
          }
          if (isDobTooOld(value)) {
            return t('errors.too-old');
          }
          return true;
        },
      })}
    />
  );
};

export default DobInput;
