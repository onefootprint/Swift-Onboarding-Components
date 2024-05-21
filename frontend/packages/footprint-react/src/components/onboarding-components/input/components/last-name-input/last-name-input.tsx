import { isName } from '@onefootprint/core';
import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type LastNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.last_name';

const LastNameInput = ({ className, ...props }: LastNameInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'last-name' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="family-name"
      className={cx('fp-last-name-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default LastNameInput;
