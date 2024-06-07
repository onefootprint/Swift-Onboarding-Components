import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { PinnedServerCertificatesProps } from '.';
import PinnedServerCertificates from '.';
import {
  configWithNoPinnedServerCertificate,
  configWithPinnedServerCertificate,
} from './pinned-server-certificates.test.config';

const renderPinnedServerCertificates = ({ proxyConfig }: PinnedServerCertificatesProps) =>
  customRender(<PinnedServerCertificates proxyConfig={proxyConfig} />);

describe('<PinnedServerCertificates />', () => {
  it('should display certificate when it exists', () => {
    renderPinnedServerCertificates({
      proxyConfig: configWithPinnedServerCertificate,
    });
    expect(screen.getByText('Download pinned server certificate')).toBeInTheDocument();
  });

  it('should display empty text when no pinned server certificate exists', () => {
    renderPinnedServerCertificates({
      proxyConfig: configWithNoPinnedServerCertificate,
    });
    expect(screen.getByText('There are no pinned server certificates')).toBeInTheDocument();
  });
});
