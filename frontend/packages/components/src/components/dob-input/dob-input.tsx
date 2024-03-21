import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type DobInputProps = InputProps;

const DobInput = ({ className, ...props }: DobInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="bday"
      className={cx('fp-dob-input', className)}
      inputMode="numeric"
      label={t('dob.label')}
      {...props}
      {...form.register('id.dob')}
    />
  );
};

export default DobInput;
