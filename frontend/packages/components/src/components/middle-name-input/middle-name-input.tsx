import { isName } from '@onefootprint/core';
import cx from 'classnames';
import get from 'lodash/get';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type MiddleNameInputProps = InputProps;

const identifier = 'id.middle_name';

const MiddleNameInput = ({ className, ...props }: MiddleNameInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'middle-name' });
  const error = get(errors, identifier);

  return (
    <Input
      autoComplete="additional-name"
      className={cx('fp-middle-name-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        validate: value => value === '' || isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default MiddleNameInput;
