import { useTranslation } from '@onefootprint/hooks';
import { createFontStyles, media } from '@onefootprint/ui';
import { createPopup } from '@typeform/embed';
import React from 'react';
import styled, { css } from 'styled-components';

import Plan from './components/plan';

const { toggle: togglePII } = createPopup('BIMSHCit');
const { toggle: toggleKYCAndPII } = createPopup('DUKcgN9Q');

const DesktopPlans = () => {
  const { t } = useTranslation('pages.pricing.plans');

  return (
    <Container>
      <Features>
        <header />
        <div>{t('features.nitro-enclaves')}</div>
        <div>{t('features.isolated-compute')}</div>
        <div>{t('features.encryption-and-tokenization')}</div>
        <div>{t('features.access-control')}</div>
        <div>{t('features.audit-logs')}</div>
        <div>{t('features.idv-kyc')}</div>
        <div>{t('features.face-id')}</div>
        <div>{t('features.dashboard')}</div>
        <div>{t('features.one-click')}</div>
        <div>{t('features.first-year-free')}</div>
      </Features>
      <PIIContainer>
        <Plan
          title={t('options.pii.title')}
          subtitle={t('options.pii.subtitle')}
          price={t('options.pii.pricing')}
          cta={t('options.pii.cta')}
          features={{
            nitroEnclaves: true,
            isolatedCompute: true,
            encryptionAndTokenization: true,
            accessControl: true,
            auditLogs: true,
            idvKyc: false,
            faceId: false,
            dashboard: false,
            oneClick: false,
            firstYearFree: false,
          }}
          onCtaClick={togglePII}
        />
      </PIIContainer>
      <KYCAndPIIContainer>
        <Plan
          title={t('options.kyc-and-pii.title')}
          subtitle={t('options.kyc-and-pii.subtitle')}
          price={t('options.kyc-and-pii.pricing')}
          cta={t('options.kyc-and-pii.cta')}
          features={{
            nitroEnclaves: true,
            isolatedCompute: true,
            encryptionAndTokenization: true,
            accessControl: true,
            auditLogs: true,
            idvKyc: true,
            faceId: true,
            dashboard: true,
            oneClick: true,
            firstYearFree: true,
          }}
          onCtaClick={toggleKYCAndPII}
        />
      </KYCAndPIIContainer>
    </Container>
  );
};

const Container = styled.div`
  display: none;
  grid-template-columns: 296px 348px 348px;

  ${media.greaterThan('md')`
    display: grid;
  `}
`;

const Column = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
    ${createFontStyles('body-2')};
    display: grid;
    grid-template-rows: [header] 264px [row] 56px [row] 80px [row] 56px [row] 56px [row] 56px [row] 56px [row] 80px [row] 80px [row] 56px [row] 56px;
    padding: ${theme.spacing[7]}px;
    padding-bottom: unset;

    &:first-child {
      padding-left: unset;
    }

    > div {
      padding: ${theme.spacing[5]}px 0;
    }

    > div:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]}px solid
        ${theme.borderColor.tertiary};
    }
  `}
`;

const Features = styled(Column)`
  ${({ theme }) => css`
    div:last-child {
      color: ${theme.color.success};
    }
  `}
`;

const PlanContainer = styled(Column)`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};

    > div {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
`;

const PIIContainer = styled(PlanContainer)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[2]}px 0 0 ${theme.borderRadius[2]}px;
    border-right: unset;
  `}
`;

const KYCAndPIIContainer = styled(PlanContainer)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: 0 ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0;
  `}
`;

export default DesktopPlans;
