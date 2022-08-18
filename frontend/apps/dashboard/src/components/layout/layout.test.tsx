import React from 'react';
import { createUseRouterSpy, customRender, screen } from 'test-utils';

import { useStore } from '../../hooks/use-session-user';
import Layout, { LayoutProps } from './layout';

const originalState = useStore.getState();

const useRouterSpy = createUseRouterSpy();

describe('<Layout />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/lorem' });
  });

  const renderLayout = ({ children = 'Foo' }: Partial<LayoutProps>) =>
    customRender(<Layout>{children}</Layout>);

  describe('when the user is NOT logged', () => {
    beforeEach(() => {
      useStore.setState(originalState);
    });

    it('should render the public layout', () => {
      renderLayout({});
      expect(screen.getByTestId('public-layout')).toBeInTheDocument();
    });
  });

  describe.skip('when the user is logged', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          tenantName: 'Footprint',
          sandboxRestricted: false,
          auth: '1',
          email: 'lorem',
        },
      });
    });
    it('should render the private layout', () => {
      renderLayout({});
      expect(screen.getByTestId('private-layout')).toBeInTheDocument();
    });
  });
});
