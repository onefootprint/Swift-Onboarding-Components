import { IcoDownload16 } from '@onefootprint/icons';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { LinkButton, Text } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import kebabCase from 'lodash/kebabCase';
import { useTranslation } from 'react-i18next';
import { Field } from 'src/components';

export type ClientCertificateProps = {
  proxyConfig: ProxyConfigDetails;
};

const ClientCertificate = ({ proxyConfig }: ClientCertificateProps) => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'details.client-certificate',
  });

  const handleClick = (content: string) => () => {
    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });
    const nameInkebabCase = kebabCase(proxyConfig.name);
    saveAs(blob, `${nameInkebabCase}-client-certificate.crt`);
  };

  return proxyConfig.clientCertificate ? (
    <Field label={t('certificate')}>
      <LinkButton iconComponent={IcoDownload16} onClick={handleClick(proxyConfig.clientCertificate)}>
        {t('download')}
      </LinkButton>
    </Field>
  ) : (
    <Text variant="body-3">{t('empty')}</Text>
  );
};

export default ClientCertificate;
