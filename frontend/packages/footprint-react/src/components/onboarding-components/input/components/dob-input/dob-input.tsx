import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
} from '@onefootprint/core';
import cx from 'classnames';
import Cleave from 'cleave.js';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type DobInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.dob';

const DobInput = ({ className, ...props }: DobInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'dob' });
  const {
    form: { register },
  } = useFootprint();

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
    <input
      autoComplete="bday"
      className={cx('fp-dob-input', className)}
      inputMode="numeric"
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
