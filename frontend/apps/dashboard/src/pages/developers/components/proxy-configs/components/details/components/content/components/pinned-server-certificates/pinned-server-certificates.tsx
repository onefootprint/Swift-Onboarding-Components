import { useTranslation } from '@onefootprint/hooks';
import { IcoDownload16 } from '@onefootprint/icons';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import Field from 'src/components/field';
import Fieldset from 'src/components/fieldset';

type PinnedServerCertificatesProps = {
  proxyConfig: ProxyConfigDetails;
};

const PinnedServerCertificates = ({
  proxyConfig,
}: PinnedServerCertificatesProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.details.pinned-server-certificates',
  );

  const handleClick = (contents: string[]) => () => {
    contents.forEach(content => {
      const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8',
      });
      const nameInkebabCase = kebabCase(proxyConfig.name);
      saveAs(blob, `${nameInkebabCase}-pinned-server-certificate.crt`);
    });
  };

  return (
    <Fieldset title={t('title')}>
      <Field label={t('certificate')}>
        <LinkButton
          iconComponent={IcoDownload16}
          onClick={handleClick(proxyConfig.pinnedServerCertificates)}
          size="compact"
        >
          {t('download', {
            count: proxyConfig.pinnedServerCertificates.length,
          })}
        </LinkButton>
      </Field>
    </Fieldset>
  );
};

export default PinnedServerCertificates;
