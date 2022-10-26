import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import { createPopup } from '@typeform/embed';
import React from 'react';
import styled, { css } from 'styled-components';

import Plan from './components/plan';

const { toggle: togglePII } = createPopup('BIMSHCit');
const { toggle: toggleKYCAndPII } = createPopup('DUKcgN9Q');

const MobilePlans = () => {
  const { t } = useTranslation('pages.pricing.plans');

  return (
    <Container>
      <PIIContainer>
        <Plan
          cta={t('options.pii.cta')}
          features={[
            t('features.nitro-enclaves'),
            t('features.isolated-compute'),
            t('features.encryption-and-tokenization'),
            t('features.access-control'),
            t('features.audit-logs'),
          ]}
          onCtaClick={togglePII}
          price={t('options.pii.pricing')}
          subtitle={t('options.pii.subtitle')}
          title={t('options.pii.title')}
        />
      </PIIContainer>
      <KYCAndPIIContainer>
        <Plan
          cta={t('options.kyc-and-pii.cta')}
          features={[
            t('features.idv-kyc'),
            t('features.face-id'),
            t('features.dashboard'),
            t('features.one-click'),
            t('features.first-year-free'),
          ]}
          onCtaClick={toggleKYCAndPII}
          price={t('options.kyc-and-pii.pricing')}
          subtitle={t('options.kyc-and-pii.subtitle')}
          title={t('options.kyc-and-pii.title')}
          featureTitle={t('options.kyc-and-pii.features.title')}
        />
      </KYCAndPIIContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      display: none;
    `}
  `}
`;

const PlanContainer = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default}px;
  `}
`;

const PIIContainer = styled(PlanContainer)``;

const KYCAndPIIContainer = styled(PlanContainer)`
  ${({ theme }) => css`
    li:last-child {
      p {
        color: ${theme.color.success};
      }

      path {
        fill: ${theme.color.success};
      }
    }
  `}
`;

export default MobilePlans;
