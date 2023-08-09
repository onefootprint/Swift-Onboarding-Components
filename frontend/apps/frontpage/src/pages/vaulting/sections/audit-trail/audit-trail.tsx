import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';

const AuditTrail = () => {
  const { t } = useTranslation('pages.vaulting.audit-trail');
  return (
    <StyledContainer>
      <Title>
        <AuditTrailImage>
          <Image
            src="/vaulting/audit-trail/audit-trail-section.png"
            width={360}
            height={178}
            alt=""
          />
        </AuditTrailImage>
        <TitleContainer>
          <SectionTitle variant="display-1">{t('title')}</SectionTitle>
          <SectionSubtitle maxWidth={500}>{t('subtitle')}</SectionSubtitle>
        </TitleContainer>
      </Title>
      <DesktopTimeline
        src="/vaulting/audit-trail/audit-trail-timeline.png"
        width={874}
        height={320}
        alt=""
      />
      <MobileTimeline>
        <Image
          src="/vaulting/audit-trail/audit-trail-timeline.png"
          width={874}
          height={320}
          alt=""
        />
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

const AuditTrailImage = styled.div`
  position: relative;
  height: 174px;
  width: 360px;
  mask: radial-gradient(
    80% 85% at 50% 0%,
    black 0%,
    black 75%,
    transparent 100%
  );
  mask-mode: alpha;
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
  mask: radial-gradient(
    60% 100% at 50% 0%,
    black 0%,
    black 90%,
    transparent 100%
  );
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
