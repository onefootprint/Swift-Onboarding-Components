import { useTranslation } from '@onefootprint/hooks';
import type { ProxyConfigDetails } from '@onefootprint/types';
import React, { Fragment } from 'react';
import { Field } from 'src/components';

type IngressVaultingProps = {
  proxyConfig: ProxyConfigDetails;
};

const IngressVaulting = ({ proxyConfig }: IngressVaultingProps) => {
  const { t } = useTranslation('pages.proxy-configs.details.ingress-vaulting');

  return (
    <>
      <Field label={t('content-type')}>
        {proxyConfig.ingressContentType.toUpperCase()}
      </Field>
      {proxyConfig.ingressRules.map(({ token, target }) => (
        <Fragment key={token}>
          <Field label={t('token')}>{token}</Field>
          <Field label={t('target')}>{target}</Field>
        </Fragment>
      ))}
    </>
  );
};

export default IngressVaulting;
