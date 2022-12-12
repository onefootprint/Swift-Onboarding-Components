import React from 'react';

import useSession from '../../hooks/use-session';
import PrivateLayout from './components/private-layout';
import PublicLayout from './components/public-layout';

export type LayoutProps = {
  children: React.ReactNode;
  name?: string;
};

const Layout = ({ children, name = 'default' }: LayoutProps) => {
  const { isLoggedIn } = useSession();
  return isLoggedIn ? (
    <PrivateLayout name={name}>{children}</PrivateLayout>
  ) : (
    <PublicLayout>{children}</PublicLayout>
  );
};

export default Layout;
