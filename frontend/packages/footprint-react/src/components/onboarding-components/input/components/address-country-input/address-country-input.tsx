/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { SelectHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type AddressCountryInputProps = SelectHTMLAttributes<HTMLSelectElement>;

const identifier = 'id.country';

const AddressCountryInput = ({
  className,
  onChange,
  ...props
}: AddressCountryInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'country' });

  const {
    form: { register },
  } = useFootprint();

  return (
    <select
      autoComplete="country"
      className={cx('fp-country-input', className)}
      {...props}
      {...register(identifier, { onChange, required: t('errors.required') })}
    >
      <option value="US">United States</option>
    </select>
  );
};

export default AddressCountryInput;
