import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO from '../../../components/seo';
import PenguinBanner from './sections/banner';
import Experience from './sections/experience';
import FeaturedCards from './sections/featured-cards';
import Hero from './sections/hero';
import Problems from './sections/problems';
import QuoteSection from './sections/quote-section';
import Solutions from './sections/solutions';

const RealEstate = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.auto',
  });
  return (
    <>
      <SEO title={t('html-title')} slug="/industries/auto" />
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        illustration="/industries/illustrations/auto.svg"
      />
      <FeaturedCards />
      <Problems />
      <Solutions />
      <QuoteSection />
      <Experience />
      <PenguinBanner />
    </>
  );
};

export default RealEstate;
