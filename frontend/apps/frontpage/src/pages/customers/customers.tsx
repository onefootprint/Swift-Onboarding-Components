import React from 'react';
import { useTranslation } from 'react-i18next';
import Banner from 'src/components/banner';

import Seo from '../../components/seo';
import FeaturedCards from './sections/featured-cards';
import Hero from './sections/hero';
import OtherCustomers from './sections/other-customers';

const CustomerStories = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers',
  });
  return (
    <>
      <Seo title={t('html-title')} description={t('html-description')} slug="/customers" />
      <Hero />
      <FeaturedCards />
      <OtherCustomers />
      <Banner title={t('banner.title')} />
    </>
  );
};

export default CustomerStories;
