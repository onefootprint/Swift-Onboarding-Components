import { useTranslation } from '@onefootprint/hooks';
import { IcoCrosshair24, IcoPlusBig24, IcoShield24 } from '@onefootprint/icons';
import { Container } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React from 'react';

import Blob from '../../components/blobs';
import FeatureElement from '../../components/feature-element';
import FeaturesStack from '../../components/features-stack';
import DetailsLayout from '../../components/layout/details-layout';
import StripedBackground from '../../components/layout/striped-background';

const DynamicDesktopIllustration = dynamic(
  () => import('./components/desktop-illustration'),
);
const DynamicTabletIllustration = dynamic(
  () => import('./components/tablet-illustration'),
);

const DynamicMobileIllustration = dynamic(
  () => import('./components/mobile-illustration'),
);

const Accurate = () => {
  const { t } = useTranslation('pages.home.accurate-section');

  return (
    <Container as="section" id="details">
      <StripedBackground color="#4A24DB" />
      <DetailsLayout title={t('title')} subtitle={t('subtitle')}>
        <FeaturesStack>
          <FeatureElement
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
          >
            <IcoShield24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
          >
            <IcoCrosshair24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-3.title')}
            body={t('features.feature-3.body')}
          >
            <IcoPlusBig24 />
          </FeatureElement>
        </FeaturesStack>
        <DynamicDesktopIllustration />
        <DynamicTabletIllustration />
        <DynamicMobileIllustration />
      </DetailsLayout>
      <Blob color="#e9e5f7" height={40} width={50} top={10} left={30} />
    </Container>
  );
};

export default Accurate;
