import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { SelectProps } from '../internal/select';
import Select from '../internal/select';

export type AddressCountryInputProps = SelectProps;

const AddressCountryInput = ({
  className,
  onChange,
  ...props
}: AddressCountryInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Select
      autoComplete="country"
      className={cx('fp-country-input', className)}
      label={t('country.label')}
      {...props}
      {...form.register('id.country', { onChange })}
    >
      <option value="US">United States</option>
    </Select>
  );
};

export default AddressCountryInput;
