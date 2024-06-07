import React from 'react';
import { useTranslation } from 'react-i18next';

import Fieldset from '../fieldset';

export type ErrorProps = {
  message: string;
};

const ErrorComponent = ({ message }: ErrorProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  return <Fieldset label={t('error')} value={message} />;
};

export default ErrorComponent;
