import type { ProxyConfigDetails } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { Fieldset } from 'src/components';

import {
  BasicConfiguration,
  ClientCertificate,
  CustomHeaders,
  IngressVaulting,
  PinnedServerCertificates,
} from './components';

type ContentProps = {
  proxyConfig: ProxyConfigDetails;
};

const Content = ({ proxyConfig }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.details',
  });

  const sections = [
    {
      title: t('basic-configuration.title'),
      Component: BasicConfiguration,
    },
    {
      title: t('custom-headers.title'),
      Component: CustomHeaders,
    },
    {
      title: t('client-certificate.title'),
      Component: ClientCertificate,
    },
    {
      title: t('pinned-server-certificates.title'),
      Component: PinnedServerCertificates,
    },
    {
      title: t('ingress-vaulting.title'),
      Component: IngressVaulting,
    },
  ];

  return (
    <Box testID="proxy-configs-details-content">
      {sections.map(({ title, Component }) => (
        <Fieldset title={title} key={title}>
          <Component proxyConfig={proxyConfig} />
        </Fieldset>
      ))}
    </Box>
  );
};

export default Content;
