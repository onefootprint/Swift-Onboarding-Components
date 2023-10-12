import { useTranslation } from '@onefootprint/hooks';
import { IcoDownload16 } from '@onefootprint/icons';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { LinkButton, Typography } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { Field } from 'src/components';

export type PinnedServerCertificatesProps = {
  proxyConfig: ProxyConfigDetails;
};

const PinnedServerCertificates = ({
  proxyConfig,
}: PinnedServerCertificatesProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.details.pinned-server-certificates',
  );
  const shouldShow = proxyConfig.pinnedServerCertificates.length > 0;

  const handleClick = (contents: string[]) => () => {
    contents.forEach(content => {
      const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8',
      });
      const nameInkebabCase = kebabCase(proxyConfig.name);
      saveAs(blob, `${nameInkebabCase}-pinned-server-certificate.crt`);
    });
  };

  return shouldShow ? (
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
  ) : (
    <Typography variant="body-3">{t('empty')}</Typography>
  );
};

export default PinnedServerCertificates;
