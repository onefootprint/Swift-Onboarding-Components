import { Container, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import IllustrationContainer from '../../components/illustration-section-title/container';
import Rectangle from '../../components/illustration-section-title/rectangle/rectangle';
import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';

const AuditTrail = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.vaulting.audit-trail',
  });
  return (
    <StyledContainer>
      <Title>
        <IllustrationContainer>
          <Rectangle top={32} left={32} width={80} height={12} />
          <Rectangle top={26} left={124} width={24} height={24} />
          <Rectangle top={32} left={164} width={160} height={12} />
          <Rectangle top={56} left={134} width={4} height={24} />
          <Rectangle top={92} left={32} width={80} height={12} />
          <Rectangle top={86} left={124} width={24} height={24} />
          <Rectangle top={92} left={164} width={160} height={12} />
        </IllustrationContainer>
        <TitleContainer>
          <SectionTitle variant="display-2">{t('title')}</SectionTitle>
          <SectionSubtitle maxWidth="500px">{t('subtitle')}</SectionSubtitle>
        </TitleContainer>
      </Title>
      <DesktopTimeline src="/vaulting/audit-trail/audit-trail-timeline.png" width={874} height={320} alt="" />
      <MobileTimeline>
        <Image src="/vaulting/audit-trail/audit-trail-timeline.png" width={874} height={320} alt="" />
      </MobileTimeline>
    </StyledContainer>
  );
};

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

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    width: 100%;
    align-items: center;
    text-align: center;
    position: relative;
  `}
`;

const DesktopTimeline = styled(Image)`
  display: none;

  ${media.greaterThan('md')`
      display: block;
    `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[10]});
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: 100%;
    align-items: center;
    text-align: center;
    position: relative;
  `}
`;

const MobileTimeline = styled.div`
  display: block;
  height: 320px;
  width: 100%;
  position: relative;
  mask: radial-gradient(100% 100% at 0% 0%, black 0%, transparent 100%);
  mask-mode: alpha;

  img {
    position: absolute;
    left: -118px;
    top: 0;
    width: 200%;
    object-fit: contain;
  }

  ${media.greaterThan('md')`
      display: none;
    `}
`;

export default AuditTrail;
