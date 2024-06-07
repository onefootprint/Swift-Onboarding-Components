import { createUseRouterSpy, customRender, screen } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import type { BlankLayoutProps } from './blank-layout';
import BlankLayout from './blank-layout';

const useRouterSpy = createUseRouterSpy();

describe('<BlankLayout />', () => {
  const renderBlankLayout = ({ children = 'Blank Layout' }: Partial<BlankLayoutProps>) =>
    customRender(<BlankLayout>{children}</BlankLayout>);

  beforeEach(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  it('should render correctly', () => {
    useRouterSpy({ pathname: '/onboarding' });
    renderBlankLayout({ children: 'Blank Layout' });
    expect(screen.getByText('Blank Layout')).toBeInTheDocument();
  });
});
