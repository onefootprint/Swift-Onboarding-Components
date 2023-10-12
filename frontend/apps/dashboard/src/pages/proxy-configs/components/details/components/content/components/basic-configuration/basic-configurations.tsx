import { useTranslation } from '@onefootprint/hooks';
import type { ProxyConfigDetails } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';

type BasicConfigurationProps = {
  proxyConfig: ProxyConfigDetails;
};

const BasicConfiguration = ({ proxyConfig }: BasicConfigurationProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.details.basic-configuration',
  );

  return (
    <>
      <Field label={t('name')}>{proxyConfig.name}</Field>
      <Field label={t('url')}>{proxyConfig.url}</Field>
      <Field label={t('method')}>{proxyConfig.method}</Field>
      <Field label={t('access-reason')}>{proxyConfig.accessReason}</Field>
    </>
  );
};

export default BasicConfiguration;
