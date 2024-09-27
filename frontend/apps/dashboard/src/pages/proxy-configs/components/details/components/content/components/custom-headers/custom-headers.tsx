import type { ProxyConfigDetails } from '@onefootprint/types';
import { Badge, CodeInline, Text } from '@onefootprint/ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'src/components';

export type CustomHeadersProps = {
  proxyConfig: ProxyConfigDetails;
};

const CustomHeaders = ({ proxyConfig }: CustomHeadersProps) => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'details.custom-headers',
  });
  const shouldShow = proxyConfig.headers.length > 0 || proxyConfig.secretHeaders.length > 0;

  return shouldShow ? (
    <>
      {proxyConfig.secretHeaders.map(({ name }) => (
        <Fragment key={name}>
          <Field label={t('name')}>
            <CodeInline>{name}</CodeInline>
          </Field>
          <Field label={t('value')}>
            <Badge variant="info">{t('secret')}</Badge>
          </Field>
        </Fragment>
      ))}
      {proxyConfig.headers.map(({ name, value }) => (
        <Fragment key={value}>
          <Field label={t('name')}>
            <CodeInline>{name}</CodeInline>
          </Field>
          <Field label={t('value')}>{value}</Field>
        </Fragment>
      ))}
    </>
  ) : (
    <Text variant="body-3">{t('empty')}</Text>
  );
};

export default CustomHeaders;
