import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCode224,
  IcoFileText224,
  IcoHeart24,
  IcoLayer0124,
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

const Customizable = () => {
  const { t } = useTranslation('pages.home.customizable-section');
  return (
    <Container as="section" id="details">
      <StripedBackground color="#DB24D4" />
      <DetailsLayout title={t('title')} subtitle={t('subtitle')}>
        <FeatureStack>
          <FeatureElement
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
          >
            <IcoHeart24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
          >
            <IcoLayer0124 />
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
            <IcoFileText224 />
          </FeatureElement>
        </FeatureStack>
        <DynamicDesktopIllustration />
        <DynamicTabletIllustration />
        <DynamicMobileIllustration />
      </DetailsLayout>
      <Blob color="#fbedfb" height={40} width={40} top={10} left={70} />
    </Container>
  );
};

export default Customizable;
