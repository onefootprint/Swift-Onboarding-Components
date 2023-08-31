import React from 'react';

import PageNav from './components/page-nav';
import staticAPIData from './data/api-docs.json';
import getNavigation from './utils/get-navigation/get-navigation';

type ApiReferenceLayoutProps = {
  children: React.ReactNode;
};

const staticNavigation = getNavigation(staticAPIData);
// const staticPreviewNavigation = getNavigation(staticPreviewAPIData);

const ApiReferenceLayout = ({ children }: ApiReferenceLayoutProps) => (
  <>
    <PageNav navigation={staticNavigation} />
    {children}
  </>
);

export default ApiReferenceLayout;
