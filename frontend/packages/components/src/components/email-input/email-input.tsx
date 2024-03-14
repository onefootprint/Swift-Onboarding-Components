import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type EmailInputProps = InputProps;

const EmailInput = ({ className, ...props }: EmailInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="email"
      className={cx('fp-email-input', className)}
      label={t('first-name.label')}
      type="email"
      {...props}
      {...form.register('id.email', { required: true })}
    />
  );
};

export default EmailInput;
