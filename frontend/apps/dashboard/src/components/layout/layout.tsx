import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

import Gate from './components/gate';
import PrivateLayout from './components/private-layout';
import PublicLayout from './components/public-layout';

export type LayoutProps = {
  children: React.ReactNode;
  name?: string;
};

const Layout = ({ children, name = 'default' }: LayoutProps) => {
  const router = useRouter();
  const { isLoggedIn } = useSession();

  // hybrid pages, can be public or private
  if (router.pathname === '/auth' || router.pathname === '/logout') {
    return <PublicLayout>{children}</PublicLayout>;
  }

  return (
    <Gate>
      {isLoggedIn ? (
        <PrivateLayout name={name}>{children}</PrivateLayout>
      ) : (
        <PublicLayout>{children}</PublicLayout>
      )}
    </Gate>
  );
};

export default Layout;
