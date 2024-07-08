import React from 'react';
import { useTranslation } from 'react-i18next';

import Banner from 'src/components/banner';
import SEO from '../../components/seo';
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
      <SEO title={t('html-title')} description={t('description')} slug="/" />
      <Hero />
      <Customize />
      <Control />
      <Verify />
      <Leverage />
      <Quotes />
      <Banner title={t('banner.title')} />
    </>
  );
};

export default NewHome;
