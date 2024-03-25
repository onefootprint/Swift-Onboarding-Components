import { isName } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type LastNameInputProps = InputProps;

const LastNameInput = ({ className, ...props }: LastNameInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'last-name' });
  const error = errors.lastName;

  return (
    <Input
      autoComplete="family-name"
      className={cx('fp-last-name-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('lastName', {
        required: t('errors.required'),
        validate: (value = '') => isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default LastNameInput;
