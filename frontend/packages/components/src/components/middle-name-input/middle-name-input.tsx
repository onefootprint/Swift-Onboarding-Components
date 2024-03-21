import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type MiddleNameInputProps = InputProps;

const MiddleNameInput = ({ className, ...props }: MiddleNameInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="additional-name"
      className={cx('fp-middle-name-input', className)}
      label={t('middle-name.label')}
      {...props}
      {...form.register('id.middle_name')}
    />
  );
};

export default MiddleNameInput;
