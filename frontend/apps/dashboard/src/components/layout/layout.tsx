import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

import { TRANSITION_ROUTES } from '../../config/constants';
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
