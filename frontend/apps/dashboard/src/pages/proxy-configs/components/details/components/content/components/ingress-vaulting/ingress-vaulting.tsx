import type { ProxyConfigDetails } from '@onefootprint/types';
import { CodeInline, Text } from '@onefootprint/ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'src/components';

type IngressVaultingProps = {
  proxyConfig: ProxyConfigDetails;
};

const IngressVaulting = ({ proxyConfig }: IngressVaultingProps) => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'details.ingress-vaulting',
  });
  if (!proxyConfig.ingressContentType) {
    return (
      <Text variant="body-3" tag="div" color="tertiary">
        {t('empty')}
      </Text>
    );
  }

  return (
    <>
      <Field label={t('content-type.label')}>{proxyConfig.ingressContentType?.toUpperCase()}</Field>
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
