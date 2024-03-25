import { isSsn4 } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type SSN4InputProps = InputProps;

const SSN4Input = ({ className, ...props }: SSN4InputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'ssn-4' });
  const error = errors.ssn4;

  return (
    <Input
      className={cx('fp-ssn-4-input', className)}
      hasError={!!error}
      label={t('label')}
      maxLength={4}
      message={error?.message}
      {...props}
      {...register('ssn4', {
        required: t('errors.required'),
        validate: (value = '') => isSsn4(value) || t('errors.invalid'),
      })}
    />
  );
};

export default SSN4Input;
