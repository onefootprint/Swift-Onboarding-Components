import { isSsn9 } from '@onefootprint/core';
import cx from 'classnames';
import Cleave from 'cleave.js';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type SSN9INputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.ssn9';

const SSN9INput = ({ className, ...props }: SSN9INputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'ssn-9' });
  const {
    form: { register },
  } = useFootprint();

  useEffect(() => {
    const cleave = new Cleave('.fp-ssn-9-input', {
      numericOnly: true,
      delimiters: ['-', '-'],
      blocks: [3, 2, 4],
    });
    return () => {
      cleave.destroy();
    };
  });

  return (
    <input
      className={cx('fp-ssn-9-input', className)}
      maxLength={11}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => isSsn9(value) || t('errors.invalid'),
      })}
    />
  );
};

export default SSN9INput;
