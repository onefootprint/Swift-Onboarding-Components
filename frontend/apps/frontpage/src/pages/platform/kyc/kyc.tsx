import { useTranslation } from 'react-i18next';

import Banner from '../../../components/banner';
import DeveloperExperience from '../../../components/developer-experience';
import SEO from '../../../components/seo';
import SplitLayoutSheet from './components/desktop-layout-sheet';
import MobileLayoutSheet from './components/mobile-layout-sheet';
import Hero from './components/sections/hero';
import StoreData from './components/sections/store-data';

const KYC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyc' });

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/platform/kyc" />
      <Hero />
      <SplitLayoutSheet />
      <MobileLayoutSheet />
      <DeveloperExperience />
      <StoreData />
      <Banner title={t('banner.title')} />
    </>
  );
};

export default KYC;
