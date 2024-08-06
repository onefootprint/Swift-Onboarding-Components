import { customRender, screen } from '@onefootprint/test-utils';

import type { ClientCertificateProps } from '.';
import ClientCertificate from '.';
import { configWithClientCertificate, configWithNoClientCertificate } from './client-certificate.test.config';

const renderClientCertificate = ({ proxyConfig }: ClientCertificateProps) =>
  customRender(<ClientCertificate proxyConfig={proxyConfig} />);

describe('<ClientCertificate />', () => {
  it('should display certificate when it exists', () => {
    renderClientCertificate({ proxyConfig: configWithClientCertificate });
    expect(screen.getByText('Download client certificate')).toBeInTheDocument();
  });

  it('should display empty text when no pinned server certificate exists', () => {
    renderClientCertificate({ proxyConfig: configWithNoClientCertificate });
    expect(screen.getByText("There's no client certificate authentication (mTLS)")).toBeInTheDocument();
  });
});
