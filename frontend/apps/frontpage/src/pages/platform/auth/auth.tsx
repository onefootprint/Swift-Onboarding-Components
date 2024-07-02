import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO from '../../../components/seo';
import MakeItYours from './components/make-it-yours';
import EndlessBenefits from './components/sections/endless-benefits/endless-benefits';
import Hero from './components/sections/hero';
import PenguinBannerAuth from './components/sections/penguin-banner-auth';
import Secure from './components/sections/secure';

const KYC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.auth' });

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/auth" />
      <Hero />
      <Secure />
      <MakeItYours />
      <EndlessBenefits />
      <PenguinBannerAuth />
    </>
  );
};

export default KYC;
