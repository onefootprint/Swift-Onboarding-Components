import { isName } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type FirstNameInputProps = InputProps;

const FirstNameInput = ({ className, ...props }: FirstNameInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'first-name' });
  const error = errors.firstName;

  return (
    <Input
      autoComplete="given-name"
      className={cx('fp-first-name-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('firstName', {
        required: t('errors.required'),
        validate: (value = '') => isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default FirstNameInput;
