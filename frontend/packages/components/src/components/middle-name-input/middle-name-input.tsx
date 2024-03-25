import { isName } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type MiddleNameInputProps = InputProps;

const MiddleNameInput = ({ className, ...props }: MiddleNameInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'middle-name' });
  const error = errors.middleName;

  return (
    <Input
      autoComplete="additional-name"
      className={cx('fp-middle-name-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register('middleName', {
        validate: (value = '') =>
          value === '' || isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default MiddleNameInput;
