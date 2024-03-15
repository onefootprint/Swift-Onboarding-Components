import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type SSN9INputProps = InputProps;

const SSN9INput = ({ className, ...props }: SSN9INputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      className={cx('fp-ssn-9-input', className)}
      label={t('ssn-9.label')}
      {...props}
      {...form.register('id.ssn9')}
    />
  );
};

export default SSN9INput;
