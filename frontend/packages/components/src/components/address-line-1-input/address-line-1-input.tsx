import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressLine1InputProps = InputProps;

const AddressLine1Input = ({ className, ...props }: AddressLine1InputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="address-line1"
      className={cx('fp-address-line1-input', className)}
      label={t('address-line1.label')}
      {...props}
      {...form.register('id.address_line1')}
    />
  );
};

export default AddressLine1Input;
