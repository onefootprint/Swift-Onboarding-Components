import { customRender, screen } from '@onefootprint/test-utils';

import type { CustomHeadersProps } from '.';
import CustomHeaders from '.';
import { configWithHeaders, configWithoutHeaders } from './custom-headers.test.config';

const renderCustomHeaders = ({ proxyConfig }: CustomHeadersProps) =>
  customRender(<CustomHeaders proxyConfig={proxyConfig} />);

describe('<CustomHeaders />', () => {
  it('should display custom headers when it exists', () => {
    renderCustomHeaders({ proxyConfig: configWithHeaders });
    const { name, value } = configWithHeaders.headers[0];

    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it('should display empty text when no custom headers exists', () => {
    renderCustomHeaders({ proxyConfig: configWithoutHeaders });

    expect(screen.getByText('There are no custom header values')).toBeInTheDocument();
  });
});
