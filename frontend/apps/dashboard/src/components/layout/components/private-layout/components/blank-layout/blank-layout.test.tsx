import { customRender, mockRouter, screen } from '@onefootprint/test-utils';
import { asAdminUser, resetUser } from 'src/config/tests';

import type { BlankLayoutProps } from './blank-layout';
import BlankLayout from './blank-layout';

describe('<BlankLayout />', () => {
  const renderBlankLayout = ({ children = 'Blank Layout' }: Partial<BlankLayoutProps>) =>
    customRender(<BlankLayout>{children}</BlankLayout>);

  beforeEach(() => {
    mockRouter.setCurrentUrl('/onboarding');
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  it('should render correctly', () => {
    renderBlankLayout({ children: 'Blank Layout' });
    expect(screen.getByText('Blank Layout')).toBeInTheDocument();
  });
});
