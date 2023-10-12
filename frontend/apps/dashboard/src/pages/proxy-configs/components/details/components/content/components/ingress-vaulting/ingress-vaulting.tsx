import { useTranslation } from '@onefootprint/hooks';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { CodeInline, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import { Field } from 'src/components';

type IngressVaultingProps = {
  proxyConfig: ProxyConfigDetails;
};

const IngressVaulting = ({ proxyConfig }: IngressVaultingProps) => {
  const { t } = useTranslation('pages.proxy-configs.details.ingress-vaulting');
  if (!proxyConfig.ingressContentType) {
    return (
      <Typography variant="body-3" as="div" color="tertiary">
        {t('empty')}
      </Typography>
    );
  }

  return (
    <>
      <Field label={t('content-type.label')} childrenSx={{ color: 'tertiary' }}>
        {proxyConfig.ingressContentType?.toUpperCase()}
      </Field>
      {proxyConfig.ingressRules.map(({ token, target }) => (
        <Fragment key={token}>
          <Field label={t('token')}>
            <CodeInline>{token}</CodeInline>
          </Field>
          <Field label={t('target')}>
            <CodeInline>{target}</CodeInline>
          </Field>
        </Fragment>
      ))}
    </>
  );
};

export default IngressVaulting;
