import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import SEO from '../../components/seo';
import SplitLayoutSheet from './components/desktop-layout-sheet';
import MobileLayoutSheet from './components/mobile-layout-sheet';
import DeveloperExperience from './components/sections/developer-experience/developer-experience';
import Hero from './components/sections/hero';
import PenguinBanner from './components/sections/penguin-banner';
import StoreData from './components/sections/store-data';

const KYC = () => {
  const { t } = useTranslation('pages.kyc');

  return (
    <>
      <SEO title={t('html-title')} slug="/kyc" />
      <Hero />
      <SplitLayoutSheet />
      <MobileLayoutSheet />
      <DeveloperExperience />
      <StoreData />
      <PenguinBanner />
    </>
  );
};

export default KYC;
