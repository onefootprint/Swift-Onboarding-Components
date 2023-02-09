import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';

import { useStore } from '../../hooks/use-session';
import Layout, { LayoutProps } from './layout';

const originalState = useStore.getState();

const useRouterSpy = createUseRouterSpy();

describe('<Layout />', () => {
  const renderLayout = ({ children = 'Foo', name }: Partial<LayoutProps>) =>
    customRender(<Layout name={name}>{children}</Layout>);

  describe('when the user is NOT logged', () => {
    beforeEach(() => {
      useRouterSpy({ pathname: '/login' });
      useStore.setState(originalState);
    });

    it('should render the public layout', () => {
      renderLayout({});
      expect(screen.getByTestId('public-layout')).toBeInTheDocument();
    });
  });

  describe('when the user is logged', () => {
    beforeEach(() => {
      useRouterSpy({ pathname: '/users' });
      useStore.setState({
        data: {
          auth: '1',
          user: {
            id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
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

    it('should render the default template', () => {
      renderLayout({ name: 'default' });
      expect(screen.getByTestId('private-default-layout')).toBeInTheDocument();
    });

    it('should render the blank template', () => {
      renderLayout({ name: 'blank' });
      expect(screen.getByTestId('private-blank-layout')).toBeInTheDocument();
    });
  });
});
