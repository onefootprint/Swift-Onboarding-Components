import { useTranslation } from '@onefootprint/hooks';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import Field from 'src/components/field';
import Fieldset from 'src/components/fieldset';

type CustomHeadersProps = {
  proxyConfig: ProxyConfigDetails;
};

const CustomHeaders = ({ proxyConfig }: CustomHeadersProps) => {
  const { t } = useTranslation('pages.proxy-configs.details.custom-headers');
  const shouldShow =
    proxyConfig.headers.length > 0 || proxyConfig.secretHeaders.length > 0;

  return shouldShow ? (
    <Fieldset title={t('title')}>
      {proxyConfig.secretHeaders.map(({ name }) => (
        <Fragment key={name}>
          <Field label={t('name')}>{name}</Field>
          <Field label={t('value')}>
            <Badge variant="info">{t('secret')}</Badge>
          </Field>
        </Fragment>
      ))}
      {proxyConfig.headers.map(({ name, value }) => (
        <Fragment key={value}>
          <Field label={t('name')}>{name}</Field>
          <Field label={t('value')}>{value}</Field>
        </Fragment>
      ))}
    </Fieldset>
  ) : null;
};

export default CustomHeaders;
