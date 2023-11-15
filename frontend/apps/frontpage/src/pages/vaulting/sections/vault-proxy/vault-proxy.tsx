import { useTranslation } from '@onefootprint/hooks';
import { IcoDollar16, IcoEye16, IcoShield16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, Grid, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import MicroFeatureCard from 'src/pages/home/components/micro-feature-card/micro-feature-card';

import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';
import VaultProxyIllustration from './components/vault-proxy-illustration';

const translations = ['enhanced-security', 'reduced-liability', 'less-money'];
const icons = [IcoShield16, IcoEye16, IcoDollar16];

const VaultProxy = () => {
  const { t } = useTranslation('pages.vaulting.vault-proxy');
  return (
    <StyledContainer>
      <VaultProxyImage>
        <Image
          src="/vaulting/vault-proxy/vault-proxy-section.png"
          width={360}
          height={180}
          alt=""
        />
      </VaultProxyImage>
      <TitleContainer>
        <SectionTitle variant="display-1">{t('title')}</SectionTitle>
        <SectionSubtitle maxWidth={500}>{t('subtitle')}</SectionSubtitle>
      </TitleContainer>
      <VaultProxyIllustration />
      <Cards width="100%">
        {translations.map((translation, index) => (
          <MicroFeatureCard
            key={translation}
            title={t(`bullets.${translation}.title`)}
            subtitle={t(`bullets.${translation}.subtitle`)}
            icon={icons[index]}
          />
        ))}
      </Cards>
    </StyledContainer>
  );
};

const Cards = styled(Grid.Container)`
  grid-template-columns: 1;

  ${media.greaterThan('md')`
    grid-template-columns: repeat(3, 1fr);
    `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[9]});
  `}
`;

const VaultProxyImage = styled.div`
  position: relative;
  height: 174px;
  width: 360px;
  mask: radial-gradient(
    80% 100% at 50% 0%,
    black 0%,
    black 75%,
    transparent 100%
  );
  mask-mode: alpha;
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[11]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[10]};
    align-items: center;

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[15]};
    `}
  `}
`;

export default VaultProxy;
