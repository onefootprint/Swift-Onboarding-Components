import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

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
      asAdminUser();
    });

    afterAll(() => {
      resetUser();
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
