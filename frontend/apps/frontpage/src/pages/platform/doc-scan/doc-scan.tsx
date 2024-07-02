import React from 'react';

import SEO from 'src/components/seo';

import { useTranslation } from 'react-i18next';
import Banner from './components/banner';
import GridCards from './components/grid-cards';
import Hero from './components/hero';
import Leverage from './components/leverage';
import Selfie from './components/selfie';

const DocScan = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.doc-scan' });

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/platform/doc-scan" />
      <Hero />
      <GridCards />
      <Leverage />
      <Selfie />
      <Banner />
    </>
  );
};

export default DocScan;
