import { isSsn4 } from '@onefootprint/core';
import cx from 'classnames';
import Cleave from 'cleave.js';
import get from 'lodash/get';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type SSN4InputProps = InputProps;

const identifier = 'id.ssn4';

const SSN4Input = ({ className, ...props }: SSN4InputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'ssn-4' });
  const error = get(errors, identifier);

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
    <Input
      className={cx('fp-ssn-4-input', className)}
      hasError={!!error}
      label={t('label')}
      maxLength={4}
      message={error?.message}
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
