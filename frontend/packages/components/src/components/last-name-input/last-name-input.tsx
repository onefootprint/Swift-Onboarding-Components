import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type LastNameInputProps = InputProps;

const LastNameInput = ({ className, ...props }: LastNameInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="family-name"
      className={cx('fp-last-name-input', className)}
      label={t('last-name.label')}
      {...props}
      {...form.register('id.last_name')}
    />
  );
};

export default LastNameInput;
