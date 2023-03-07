import '@typeform/embed/build/css/popup.css';

import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { Box, media, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import LinkButton from 'src/components/linking-button';
import styled, { css } from 'styled-components';

import Banner from '../../banner';
import InfoDialog from '../../info-dialog';
import CheckedRow from '../components/checked-row';
import FeatureRow from '../components/feature-row';
import TableHeader from '../components/table-header';

const CorePlan = () => {
  const { t } = useTranslation('pages.pricing');

  const [showDialogBanner, setShowDialogBanner] = useState(false);

  const handleClickTriggeBanner = () => {
    setShowDialogBanner(true);
  };

  const handleClose = () => {
    setShowDialogBanner(false);
  };

  return (
    <TableContainer>
      <Banner
        title={t('core-plan.promo.title')}
        cta={t('core-plan.promo.cta')}
        handleClickTrigger={handleClickTriggeBanner}
        hideSparkles
      />
      <InfoDialog
        dialogTitle={t('core-plan.promo.dialog.title')}
        open={showDialogBanner}
        onClose={handleClose}
      >
        {t('core-plan.promo.dialog.content')}
      </InfoDialog>
      <Content>
        <TableHeader
          title={t('core-plan.title')}
          subtitle={t('core-plan.subtitle')}
          microtitle={t('core-plan.micro-title')}
        />
        <PricingTable>
          <FeatureRow
            title={t('core-plan.price-table.KYC.title')}
            cost={0.5}
            unitFirst={t('units.verification')}
            hideBorderBottom
          />

          <FeatureRow
            title={t('core-plan.price-table.pii-storage.title')}
            cost={0.03}
            unitFirst={t('units.person')}
            unitSecond={t('units.month')}
          />
        </PricingTable>
        <Box>
          <Box>
            <Typography variant="label-1" sx={{ marginLeft: 3 }}>
              {t('core-plan.features.title')}
            </Typography>
            <CheckedRow>{t('core-plan.features.nitro-enclaves')}</CheckedRow>
            <CheckedRow>{t('core-plan.features.isolated-compute')}</CheckedRow>
            <CheckedRow>
              {t('core-plan.features.encryption-and-tokenization')}
            </CheckedRow>
            <CheckedRow>{t('core-plan.features.access-control')}</CheckedRow>
            <CheckedRow>{t('core-plan.features.audit-logs')}</CheckedRow>
            <CheckedRow>{t('core-plan.features.idv-kyc')}</CheckedRow>
            <CheckedRow>{t('core-plan.features.face-id')}</CheckedRow>
            <CheckedRow>{t('core-plan.features.dashboard')}</CheckedRow>
            <CheckedRow>{t('core-plan.features.one-click')}</CheckedRow>
            <CheckedRow>
              {t('core-plan.features.step-up-verification')}
            </CheckedRow>
            <CheckedRow>{t('core-plan.features.ofac')}</CheckedRow>
          </Box>
          <Box sx={{ marginBottom: 8, marginTop: 4 }}>
            <SoonFeature>
              <Label>
                <Typography variant="label-4" color="secondary">
                  {t('core-plan.one-click-kyc.label')}
                </Typography>
              </Label>
              <Typography variant="label-2">
                {t('core-plan.one-click-kyc.title')}
              </Typography>

              <Typography variant="body-2" color="secondary">
                {t('core-plan.one-click-kyc.details')}
              </Typography>
            </SoonFeature>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <LinkButton href={`${DASHBOARD_BASE_URL}/sign-up`}>
              {t('cta')}
            </LinkButton>
          </Box>
        </Box>
      </Content>
    </TableContainer>
  );
};

const PricingTable = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[4]};
  `}
`;

const TableContainer = styled.div`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    overflow: hidden;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    padding: ${theme.spacing[8]} ${theme.spacing[4]};
    padding-bottom: ${theme.spacing[4]};

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[7]};
    `}
  `}
`;

const SoonFeature = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
  `}
`;

const Label = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.compact};
    background-color: ${theme.backgroundColor.quaternary};
    margin-bottom: ${theme.spacing[2]};
  `}
`;

export default CorePlan;
