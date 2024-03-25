import { isSsn9 } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type SSN9INputProps = InputProps;

const SSN9INput = ({ className, ...props }: SSN9INputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'ssn-9' });
  const error = errors.ssn9;

  return (
    <Input
      className={cx('fp-ssn-9-input', className)}
      hasError={!!error}
      label={t('label')}
      maxLength={11}
      message={error?.message}
      {...props}
      {...register('ssn9', {
        required: t('errors.required'),
        validate: (value = '') => isSsn9(value) || t('errors.invalid'),
      })}
    />
  );
};

export default SSN9INput;
