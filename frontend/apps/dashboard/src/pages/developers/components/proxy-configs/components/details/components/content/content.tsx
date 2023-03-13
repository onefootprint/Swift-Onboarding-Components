import type { ProxyConfigDetails } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import Edit from 'src/pages/developers/components/proxy-configs/components/details/components/content/components/edit';

import * as Forms from '@/proxy-configs/components/form';

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
  const sections = [
    {
      title: 'Basic configuration',
      Component: BasicConfiguration,
      Form: Forms.BasicConfiguration,
    },
    {
      title: 'Custom headers',
      Component: CustomHeaders,
      Form: Forms.CustomHeaderValues,
    },
    {
      title: 'Client certificates',
      Component: ClientCertificate,
      Form: Forms.ClientIdentity,
    },
    {
      title: 'Pinned server certificates',
      Component: PinnedServerCertificates,
      Form: Forms.PinnedServerCertificates,
    },
    {
      title: 'Ingress vaulting',
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
