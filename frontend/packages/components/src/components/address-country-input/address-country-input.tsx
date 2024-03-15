import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressCountryInputProps = InputProps;

const AddressCountryInput = ({
  className,
  onChange,
  ...props
}: AddressCountryInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="country"
      className={cx('fp-country-input', className)}
      label={t('country.label')}
      {...props}
      {...form.register('id.country', { onChange })}
    />
  );
};

export default AddressCountryInput;
