import { customRender, screen } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAdminUser, resetUser } from 'src/config/tests';

import { useStore } from '../../hooks/use-session';
import type { LayoutProps } from './layout';
import Layout from './layout';
import {
  withEntities,
  withGhostPosts,
  withLogout,
  withOrg,
  withOrgAuthRoles,
  withRiskSignals,
} from './layout.test.config';

const originalState = useStore.getState();

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<Layout />', () => {
  const renderLayout = ({ children = 'Foo', name }: Partial<LayoutProps>) =>
    customRender(<Layout name={name}>{children}</Layout>);

  beforeAll(() => {
    withEntities();
    withOrg();
    withRiskSignals();
    withGhostPosts();
  });

  describe('when the user is NOT logged in', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl('/authentication/sign-in');
      useStore.setState(originalState);
    });

    it('should render the public layout', async () => {
      renderLayout({});
      const element = await screen.findByTestId('public-layout');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when the user is logged in', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl('/users');
      asAdminUser();
      withOrgAuthRoles();
      withLogout();
    });

    afterAll(() => {
      resetUser();
    });

    it('should render the default template', async () => {
      renderLayout({ name: 'default' });
      const element = await screen.findByTestId('private-default-layout');
      expect(element).toBeInTheDocument();
    });

    it('should render the blank template', async () => {
      renderLayout({ name: 'blank' });
      const element = await screen.findByTestId('private-blank-layout');
      expect(element).toBeInTheDocument();
    });
  });
});
