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

const FinancialInstitutions = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.financial-institutions',
  });
  return (
    <>
      <SEO
        title={t('html-title')}
        slug="/industries/financial-institutions"
        image="/og-img-financial-institutions.png"
        description={t('meta-description')}
      />
      <Hero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        illustration="/industries/illustrations/financial-institutions.svg"
      />
      <IntroCard>{t('intro.content')}</IntroCard>
      <FeaturedCards />
      <Problems />
      <Solutions />
      <QuoteSection />
      <Experience />
      <Banner
        title={t('banner.title')}
        primaryButton={t('banner.primary-button')}
        secondaryButton={t('banner.secondary-button')}
      />
    </>
  );
};

export default FinancialInstitutions;
