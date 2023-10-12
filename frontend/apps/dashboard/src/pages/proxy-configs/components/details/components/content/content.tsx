import { useTranslation } from '@onefootprint/hooks';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import Edit from 'src/pages/proxy-configs/components/details/components/content/components/edit';
import * as Forms from 'src/pages/proxy-configs/components/form';

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
  const { t } = useTranslation('pages.proxy-configs.details');

  const sections = [
    {
      title: t('basic-configuration.title'),
      Component: BasicConfiguration,
      Form: Forms.BasicConfiguration,
    },
    {
      title: t('custom-headers.title'),
      Component: CustomHeaders,
      Form: Forms.CustomHeaderValues,
    },
    {
      title: t('client-certificate.title'),
      Component: ClientCertificate,
      Form: Forms.ClientIdentity,
    },
    {
      title: t('pinned-server-certificates.title'),
      Component: PinnedServerCertificates,
      Form: Forms.PinnedServerCertificates,
    },
    {
      title: t('ingress-vaulting.title'),
      Component: IngressVaulting,
      Form: Forms.IngressVaulting,
    },
  ];

  return (
    <Box testID="proxy-configs-details-content">
      {sections.map(({ title, Form, Component }) => (
        <Edit title={title} proxyConfig={proxyConfig} Form={Form} key={title}>
          <Component proxyConfig={proxyConfig} />
        </Edit>
      ))}
    </Box>
  );
};

export default Content;
