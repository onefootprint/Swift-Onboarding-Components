import type React from 'react';

import BlankLayout from './components/blank-layout';
import DefaultLayout from './components/default-layout';

type PrivateLayoutProps = {
  children: React.ReactNode;
  name: string;
};

const PrivateLayout = ({ children, name }: PrivateLayoutProps) =>
  name === 'default' ? <DefaultLayout>{children}</DefaultLayout> : <BlankLayout>{children}</BlankLayout>;

export default PrivateLayout;
