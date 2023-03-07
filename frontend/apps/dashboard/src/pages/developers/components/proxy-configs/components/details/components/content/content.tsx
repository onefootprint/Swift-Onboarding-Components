import type { ProxyConfigDetails } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import BasicConfiguration from './components/basic-configuration';
import ClientCertificate from './components/client-certificate';
import CustomHeaders from './components/custom-headers';
import Footer from './components/footer';
import IngressVaulting from './components/ingress-vaulting';
import PinnedServerCertificates from './components/pinned-server-certificates';

type ContentProps = {
  proxyConfig: ProxyConfigDetails;
};

const Content = ({ proxyConfig }: ContentProps) => (
  <Box>
    <BasicConfiguration proxyConfig={proxyConfig} />
    <CustomHeaders proxyConfig={proxyConfig} />
    <ClientCertificate proxyConfig={proxyConfig} />
    <PinnedServerCertificates proxyConfig={proxyConfig} />
    <IngressVaulting proxyConfig={proxyConfig} />
    <Footer />
  </Box>
);

export default Content;
