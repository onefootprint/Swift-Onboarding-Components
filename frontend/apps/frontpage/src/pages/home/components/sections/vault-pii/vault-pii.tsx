import { primitives } from '@onefootprint/design-tokens';
import {
  IcoCreditcard16,
  IcoFileText16,
  IcoUserCircle16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, Grid, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import SectionTitle from '../../section-title/section-title';
import CircularBeam from './components/circular-beam/circular-beam';
import HorizontalCard from './components/horizontal-card';
import CustomDataIllustration from './components/illustrations/custom-data/custom-data';
import IdDataIllustration from './components/illustrations/id-data-illustration';
import PaymentCardData from './components/illustrations/payment-card-data/payment-card-data';
import VerticalCard from './components/vertical-card';

const VaultPii = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home.vault-pii' });

  return (
    <Section id="vault">
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        cta={t('cta')}
        iconSrc="/home/vault-pii/ico-illustrated-safe-40.svg"
        isOnDarkSection
        href="/vaulting"
      />
      <Container>
        <CardLayouts
          marginTop={10}
          columns={['1fr']}
          rows={['fit-content']}
          gap={5}
        >
          <HorizontalCard
            gridArea="top"
            title={t('identity-data.title')}
            subtitle={t('identity-data.subtitle')}
            icon={IcoUserCircle16}
          >
            <IdDataIllustration />
          </HorizontalCard>
          <VerticalCard
            gridArea="bottom-1"
            title={t('card-data.title')}
            subtitle={t('card-data.subtitle')}
            iconComponent={IcoCreditcard16}
          >
            <PaymentCardData />
          </VerticalCard>
          <VerticalCard
            gridArea="bottom-2"
            title={t('custom-data.title')}
            subtitle={t('custom-data.subtitle')}
            iconComponent={IcoFileText16}
          >
            <CustomDataIllustration />
          </VerticalCard>
          <Outer speed={10} delay={0} diameter={1300} />
          <Center speed={5} delay={1} diameter={1100} />
          <Inner speed={5} delay={3} diameter={800} />
        </CardLayouts>
      </Container>
    </Section>
  );
};

const Section = styled.div`
  ${({ theme }) => css`
    background-color: ${primitives.Gray900};
    color: ${primitives.Gray0};
    padding: ${theme.spacing[12]} 0;
    position: relative;
    overflow-x: clip;
  `}
`;

const CardLayouts = styled(Grid.Container)`
  isolation: isolate;
  grid-template-areas:
    'top'
    'bottom-1'
    'bottom-2';

  ${media.greaterThan('md')`
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'top top'
      'bottom-1 bottom-2';
  `}
`;

const Outer = styled(CircularBeam)`
  position: absolute;
  right: -120px;
  top: -120px;
  z-index: 0;
`;

const Center = styled(CircularBeam)`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const Inner = styled(CircularBeam)`
  position: absolute;
  right: 120px;
  top: 100px;
  z-index: 0;
`;

export default VaultPii;
