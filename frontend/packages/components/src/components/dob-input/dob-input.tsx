import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
} from '@onefootprint/core';
import cx from 'classnames';
import Cleave from 'cleave.js';
import get from 'lodash/get';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type DobInputProps = InputProps;

const identifier = 'id.dob';

const DobInput = ({ className, ...props }: DobInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'dob' });
  const error = get(errors, identifier);

  useEffect(() => {
    const cleave = new Cleave('.fp-dob-input', {
      date: true,
      datePattern: ['m', 'd', 'Y'],
      delimiter: '/',
      numericOnly: true,
    });
    return () => {
      cleave.destroy();
    };
  });

  return (
    <Input
      autoComplete="bday"
      className={cx('fp-dob-input', className)}
      hasError={!!error}
      inputMode="numeric"
      label={t('label')}
      message={error?.message}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => {
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
