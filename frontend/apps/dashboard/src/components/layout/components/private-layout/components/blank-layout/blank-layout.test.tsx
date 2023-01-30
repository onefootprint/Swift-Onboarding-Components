import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import BlankLayout, { BlankLayoutProps } from './blank-layout';

const originalState = useStore.getState();

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
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  it('should render correctly', () => {
    renderBlankLayout({ children: 'Blank Layout' });
    expect(screen.getByText('Blank Layout')).toBeInTheDocument();
  });

  describe('when clicking on the logout button', () => {
    it('should logout the user', async () => {
      const dataBeforeLogout = useStore.getState().data;
      expect(dataBeforeLogout).toBeDefined();

      renderBlankLayout({ children: 'Blank Layout' });
      const logoutButton = screen.getByText('Log out');
      await userEvent.click(logoutButton);

      const dataAfterLogout = useStore.getState().data;
      expect(dataAfterLogout).toBeUndefined();
    });
  });
});
