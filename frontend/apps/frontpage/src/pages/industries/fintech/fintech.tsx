import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO from '../../../components/seo';
import Banner from '../components/banner';
import IntroCard from '../components/intro-card';
import Experience from './sections/experience';
import FeaturedCards from './sections/featured-cards';
import Hero from './sections/hero';
import Problems from './sections/problems';
import QuoteSection from './sections/quote-section';
import Solutions from './sections/solutions';

const RealEstate = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.fintech',
  });
  return (
    <>
      <SEO
        title={t('html-title')}
        slug="/industries/fintech"
        image="/og-img-fintech.png"
      />
      <Hero
        title={t('hero.title')}
        illustration="/industries/illustrations/fintech.svg"
      />
      <IntroCard>{t('hero.subtitle')}</IntroCard>
      <FeaturedCards />
      <Problems />
      <Solutions />
      <QuoteSection />
      <Experience />
      <Banner
        title={t('banner.title')}
        primaryButton={t('banner.primary-button')}
        secondaryButton={t('banner.secondary-button')}
        imgSrc="/home/banner/onboard.jpg"
      />
    </>
  );
};

export default RealEstate;
