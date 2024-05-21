import { isName } from '@onefootprint/core';
import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type MiddleNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.middle_name';

const MiddleNameInput = ({ className, ...props }: MiddleNameInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'middle-name' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="additional-name"
      className={cx('fp-middle-name-input', className)}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        validate: value => value === '' || isName(value) || t('errors.invalid'),
      })}
    />
  );
};

export default MiddleNameInput;
