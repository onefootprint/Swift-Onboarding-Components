import { isName } from '@onefootprint/core';
import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type FirstNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.first_name';

const FirstNameInput = ({ className, ...props }: FirstNameInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'first-name' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="given-name"
      className={cx('fp-first-name-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default FirstNameInput;
