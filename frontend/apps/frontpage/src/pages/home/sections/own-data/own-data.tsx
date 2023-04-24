import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCheckCircle24,
  IcoDatabase24,
  IcoEye24,
  IcoLock24,
} from '@onefootprint/icons';
import { Container } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React from 'react';

import Blob from '../../components/blobs/blobs';
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

const OwnData = () => {
  const { t } = useTranslation('pages.home.own-data-section');
  return (
    <Container as="section" id="own-data">
      <StripedBackground color="#3CA3DC" />
      <DetailsLayout title={t('title')} subtitle={t('subtitle')}>
        <FeatureStack>
          <FeatureElement
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
          >
            <IcoLock24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
          >
            <IcoEye24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-3.title')}
            body={t('features.feature-3.body')}
          >
            <IcoDatabase24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-4.title')}
            body={t('features.feature-4.body')}
          >
            <IcoCheckCircle24 />
          </FeatureElement>
        </FeatureStack>
        <DynamicMobileIllustration />
        <DynamicTabletIllustration />
        <DynamicDesktopIllustration />
      </DetailsLayout>
      <Blob color="#e6f4fb" height={40} width={50} top={10} left={60} />
    </Container>
  );
};

export default OwnData;
