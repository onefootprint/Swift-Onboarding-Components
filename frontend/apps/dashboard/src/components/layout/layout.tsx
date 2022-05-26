import React from 'react';

import useSessionUser from '../../hooks/use-session-user';
import PrivateLayout from './components/private-layout';
import PublicLayout from './components/public-layout';

export type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { isLoggedIn } = useSessionUser();
  return isLoggedIn ? (
    <PrivateLayout>{children}</PrivateLayout>
  ) : (
    <PublicLayout>{children}</PublicLayout>
  );
};

export default Layout;
