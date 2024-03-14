import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type SSN4InputProps = InputProps;

const SSN4Input = ({ className, ...props }: SSN4InputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      className={cx('fp-ssn-4-input-input', className)}
      label={t('ssn-4.label')}
      {...props}
      {...form.register('id.ssn4')}
    />
  );
};

export default SSN4Input;
