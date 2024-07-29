import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

import { DOCS_SITE_LOGIN_ROUTE, TRANSITION_ROUTES } from '../../config/constants';
import Gate from './components/gate';
import ModeSwitcher from './components/mode-switcher';
import PrivateLayout from './components/private-layout';
import PublicLayout from './components/public-layout';

export type LayoutProps = {
  children: React.ReactNode;
  name?: string;
};

const Layout = ({ children, name = 'default' }: LayoutProps) => {
  const router = useRouter();
  const { isLoggedIn } = useSession();

  if (TRANSITION_ROUTES.includes(router.pathname)) {
    return <PublicLayout>{children}</PublicLayout>;
  }
  if (router.pathname === DOCS_SITE_LOGIN_ROUTE) {
    // The docs login screen is a little special - it requires the Gate to make sure the user is logged into
    // the dashboard, but it should be rendered on the blank canvas of PublicLayout.
    return (
      <Gate>
        <PublicLayout>{children}</PublicLayout>
      </Gate>
    );
  }
  return (
    <Gate>
      {isLoggedIn ? (
        <ModeSwitcher>
          <PrivateLayout name={name}>{children}</PrivateLayout>
        </ModeSwitcher>
      ) : (
        <PublicLayout>{children}</PublicLayout>
      )}
    </Gate>
  );
};

export default Layout;
