import cx from 'classnames';
import get from 'lodash/get';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../hooks/use-footprint';
import type { SelectProps } from '../internal/select';
import Select from '../internal/select';

export type AddressCountryInputProps = SelectProps;

const identifier = 'id.country';

const AddressCountryInput = ({
  className,
  onChange,
  ...props
}: AddressCountryInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'country' });
  const error = get(errors, identifier);

  return (
    <Select
      autoComplete="country"
      className={cx('fp-country-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      {...props}
      {...register(identifier, { onChange, required: t('errors.required') })}
    >
      <option value="US">United States</option>
    </Select>
  );
};

export default AddressCountryInput;
