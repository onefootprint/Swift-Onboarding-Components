import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type FirstNameInputProps = InputProps;

const FirstNameInput = ({ className, ...props }: FirstNameInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="given-name"
      className={cx('fp-first-name-input', className)}
      label={t('first-name.label')}
      {...props}
      {...form.register('id.first_name')}
    />
  );
};

export default FirstNameInput;
