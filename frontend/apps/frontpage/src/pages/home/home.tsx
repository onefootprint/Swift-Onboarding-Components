import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO from '../../components/seo';
import BannerSection from './sections/banner-section';
import Control from './sections/control';
import Customize from './sections/customize';
import Hero from './sections/hero';
import Leverage from './sections/leverage';
import Quotes from './sections/quotes';
import Verify from './sections/verify';

const NewHome = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

  return (
    <>
      <SEO title={t('html-title')} slug="/" />
      <Hero />
      <Customize />
      <Control />
      <Verify />
      <Leverage />
      <Quotes />
      <BannerSection />
    </>
  );
};

export default NewHome;
