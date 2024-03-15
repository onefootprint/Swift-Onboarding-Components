import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type AddressStateInputProps = InputProps;

const AddressStateInput = ({ className, ...props }: AddressStateInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      className={cx('fp-state-input', className)}
      label={t('state.label')}
      {...props}
      {...form.register('id.state')}
    />
  );
};

export default AddressStateInput;
