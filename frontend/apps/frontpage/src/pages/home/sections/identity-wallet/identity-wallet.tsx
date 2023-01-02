import { useTranslation } from '@onefootprint/hooks';
import { IcoActivity24, IcoFilter24, IcoStar24 } from '@onefootprint/icons';
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

const IdentityWallet = () => {
  const { t } = useTranslation('pages.home.identity-wallet');
  return (
    <Container as="section" id="details">
      <StripedBackground color="#FFA450" />
      <DetailsLayout title={t('title')} subtitle={t('subtitle')}>
        <FeatureStack>
          <FeatureElement
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
          >
            <IcoFilter24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
          >
            <IcoActivity24 />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-3.title')}
            body={t('features.feature-3.body')}
          >
            <IcoStar24 />
          </FeatureElement>
        </FeatureStack>
        <DynamicDesktopIllustration />
        <DynamicTabletIllustration />
        <DynamicMobileIllustration />
      </DetailsLayout>
      <Blob color="#feeede" height={40} width={50} top={10} left={40} />
    </Container>
  );
};

export default IdentityWallet;
