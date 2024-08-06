import '../../../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import SandboxBanner from './sandbox-banner';

describe('<SandboxBanner />', () => {
  const renderSandboxBanner = () => {
    customRender(<SandboxBanner />);
  };

  it('should render a banner', () => {
    renderSandboxBanner();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByTestId('sandbox-banner')).toBeInTheDocument();
  });
});
