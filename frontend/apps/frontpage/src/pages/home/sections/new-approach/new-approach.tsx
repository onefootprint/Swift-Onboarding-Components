import { useTranslation } from '@onefootprint/hooks';
import {
  IcoArrowDown24,
  IcoChartUp24,
  IcoCode224,
  IcoSparkles24,
} from '@onefootprint/icons';
import { Container } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React from 'react';

import Blob from '../../components/blobs';
import FeatureElement from '../../components/feature-element';
import FeatureStack from '../../components/features-stack';
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

const NewApproach = () => {
  const { t } = useTranslation('pages.home.new-approach-section');
  return (
    <Container as="section" id="details">
      <StripedBackground color="#3BBAC2" />
      <DetailsLayout title={t('title')} subtitle={t('subtitle')}>
        <FeatureStack>
          <FeatureElement
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
          >
            <IcoChartUp24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
          >
            <IcoArrowDown24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-3.title')}
            body={t('features.feature-3.body')}
          >
            <IcoCode224 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-4.title')}
            body={t('features.feature-4.body')}
          >
            <IcoSparkles24 />
          </FeatureElement>
        </FeatureStack>
        <DynamicDesktopIllustration />
        <DynamicTabletIllustration />
        <DynamicMobileIllustration />
      </DetailsLayout>
      <Blob color="#ebfcfe" height={40} width={40} top={10} left={80} />
    </Container>
  );
};

export default NewApproach;
