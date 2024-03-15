import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressZipInputProps = InputProps;

const AddressZipInput = ({ className, ...props }: AddressZipInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="postal-code"
      className={cx('fp-zip-input', className)}
      label={t('zip.label')}
      {...props}
      {...form.register('id.zip')}
    />
  );
};

export default AddressZipInput;
