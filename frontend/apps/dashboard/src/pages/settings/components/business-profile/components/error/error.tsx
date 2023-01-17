import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import Fieldset from '../fieldset';

export type ErrorProps = {
  message: string;
};

const Error = ({ message }: ErrorProps) => {
  const { t } = useTranslation('notifications');
  return <Fieldset label={t('error')} value={message} />;
};

export default Error;
