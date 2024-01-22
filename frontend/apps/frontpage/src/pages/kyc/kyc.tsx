import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import DeveloperExperience from '../../components/developer-experience';
import PenguinBanner from '../../components/penguin-banner';
import SEO from '../../components/seo';
import SplitLayoutSheet from './components/desktop-layout-sheet';
import MobileLayoutSheet from './components/mobile-layout-sheet';
import Hero from './components/sections/hero';
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
      <PenguinBanner section="kyc" imgSrc="/kyc/penguin-banner/kyc.svg" />
    </>
  );
};

export default KYC;
