import cx from 'classnames';
import get from 'lodash/get';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressStateInputProps = InputProps;

const identifier = 'id.state';

const AddressStateInput = ({ className, ...props }: AddressStateInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'state' });
  const error = get(errors, identifier);

  return (
    <Input
      className={cx('fp-state-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      placeholder={t('placeholder')}
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
      })}
    />
  );
};

export default AddressStateInput;
