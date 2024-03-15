import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressCityInputProps = InputProps;

const AddressCityInput = ({ className, ...props }: AddressCityInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="address-level2"
      className={cx('fp-city-input', className)}
      label={t('city.label')}
      {...props}
      {...form.register('id.city')}
    />
  );
};

export default AddressCityInput;
