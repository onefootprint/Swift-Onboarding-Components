import { isSsn4 } from '@onefootprint/core';
import cx from 'classnames';
import Cleave from 'cleave.js';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type SSN4InputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.ssn4';

const SSN4Input = ({ className, ...props }: SSN4InputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'ssn-4' });
  const {
    form: { register },
  } = useFootprint();

  useEffect(() => {
    const cleave = new Cleave('.fp-ssn-9-input', {
      numericOnly: true,
      blocks: [4],
    });
    return () => {
      cleave.destroy();
    };
  });

  return (
    <input
      className={cx('fp-ssn-4-input', className)}
      maxLength={4}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => isSsn4(value) || t('errors.invalid'),
      })}
    />
  );
};

export default SSN4Input;
