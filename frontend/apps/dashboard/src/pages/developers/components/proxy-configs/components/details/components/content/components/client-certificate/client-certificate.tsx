import { useTranslation } from '@onefootprint/hooks';
import { IcoDownload16 } from '@onefootprint/icons';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import Field from 'src/components/field';
import Fieldset from 'src/components/fieldset';

type ClientCertificateProps = {
  proxyConfig: ProxyConfigDetails;
};

const ClientCertificate = ({ proxyConfig }: ClientCertificateProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.details.client-certificate',
  );

  const handleClick = (content: string) => () => {
    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });
    const nameInkebabCase = kebabCase(proxyConfig.name);
    saveAs(blob, `${nameInkebabCase}-client-certificate.crt`);
  };

  return proxyConfig.clientCertificate ? (
    <Fieldset title={t('title')}>
      <Field label={t('certificate')}>
        <LinkButton
          iconComponent={IcoDownload16}
          onClick={handleClick(proxyConfig.clientCertificate)}
          size="compact"
        >
          {t('download')}
        </LinkButton>
      </Field>
    </Fieldset>
  ) : null;
};

export default ClientCertificate;
