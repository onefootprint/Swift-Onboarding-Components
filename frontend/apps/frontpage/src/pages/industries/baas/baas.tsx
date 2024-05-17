import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO from '../../../components/seo';
import IntroCard from '../components/intro-card';
import PenguinBanner from './sections/banner';
import Experience from './sections/experience';
import FeaturedCards from './sections/featured-cards';
import Hero from './sections/hero';
import Problems from './sections/problems';
import QuoteSection from './sections/quote-section';
import Solutions from './sections/solutions';

const RealEstate = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.baas',
  });
  return (
    <>
      <SEO title={t('html-title')} slug="/industries/baas" />
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        illustration="/industries/illustrations/baas.svg"
      />
      <IntroCard>{t('intro.content')}</IntroCard>
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
