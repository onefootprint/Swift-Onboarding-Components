import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
} from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import BlankLayout, { BlankLayoutProps } from './blank-layout';

const originalState = useStore.getState();
const useRouterSpy = createUseRouterSpy();

describe('<BlankLayout />', () => {
  const renderBlankLayout = ({
    children = 'Blank Layout',
  }: Partial<BlankLayoutProps>) =>
    customRender(<BlankLayout>{children}</BlankLayout>);

  beforeEach(() => {
    useStore.setState({
      data: {
        auth: '1',
        user: {
          id: 'org_rb_jDESK4Wm2DkIbSRhIdlwJT',
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          logoUrl: null,
          name: 'Acme',
          isSandboxRestricted: true,
        },
        meta: {
          createdNewTenant: false,
          isFirstLogin: false,
          requiresOnboarding: false,
        },
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  it('should render correctly', () => {
    useRouterSpy({ pathname: '/onboarding' });
    renderBlankLayout({ children: 'Blank Layout' });
    expect(screen.getByText('Blank Layout')).toBeInTheDocument();
  });

  describe('when clicking on the logout button', () => {
    it('should logout the user', async () => {
      const push = jest.fn();
      useRouterSpy({ pathname: '/onboarding', push });

      const dataBeforeLogout = useStore.getState().data;
      expect(dataBeforeLogout).toBeDefined();

      renderBlankLayout({ children: 'Blank Layout' });
      const logoutButton = screen.getByText('Log out');
      await userEvent.click(logoutButton);

      expect(push).toHaveBeenCalledWith('/logout');
    });
  });
});
