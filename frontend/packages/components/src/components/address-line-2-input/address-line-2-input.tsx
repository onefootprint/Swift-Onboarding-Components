import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressLine2InputProps = InputProps;

const AddressLine2Input = ({ className, ...props }: AddressLine2InputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="address-line2"
      className={cx('fp-address-line2-input', className)}
      label={t('address-line2.label')}
      {...props}
      {...form.register('id.address_line2')}
    />
  );
};

export default AddressLine2Input;
