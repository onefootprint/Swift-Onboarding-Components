import '@typeform/embed/build/css/popup.css';

import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { Box, media, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import LinkButton from 'src/components/link-button';
import styled, { css } from 'styled-components';

import InfoDialog from '../../info-dialog';
import Banner from '../components/banner';
import CheckedRow from '../components/checked-row';
import FeatureRow from '../components/feature-row';
import TableHeader from '../components/table-header';
import Calculator from './components/calculator';

const CorePlan = () => {
  const { t } = useTranslation('pages.pricing');
  const [showDialogCredits, setShowDialogCredits] = useState(false);
  const [showDialogKYC, setShowDialogKYC] = useState(false);
  const [showDialogBanner, setShowDialogBanner] = useState(false);

  const handleClickTriggerCredits = () => {
    setShowDialogCredits(true);
  };

  const handleClickTriggerKYC = () => {
    setShowDialogKYC(true);
  };

  const handleClickTriggeBanner = () => {
    setShowDialogBanner(true);
  };

  const handleClose = () => {
    setShowDialogCredits(false);
    setShowDialogKYC(false);
    setShowDialogBanner(false);
  };

  return (
    <TableContainer>
      <Banner
        title={t('core-plan.promo.title')}
        cta={t('core-plan.promo.cta')}
        handleClickTrigger={handleClickTriggeBanner}
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
            title={t('core-plan.price-table.footprint-credit.title')}
            moreDetailsCta={t('core-plan.price-table.footprint-credit.cta')}
            handleClickTrigger={handleClickTriggerCredits}
            labelRight="25 ¢"
          />
          <InfoDialog
            dialogTitle={t(
              'core-plan.price-table.footprint-credit.dialog.title',
            )}
            open={showDialogCredits}
            onClose={handleClose}
          >
            {t('core-plan.price-table.footprint-credit.dialog.content')}
          </InfoDialog>
          <Box sx={{ marginTop: 2, marginBottom: 4 }}>
            <FeatureRow
              title={t('core-plan.price-table.secure-pii-storage.title')}
              credits={1}
              unitFirst={t('units.person')}
              unitSecond={t('units.year')}
              noBorderBottom
            />
            <FeatureRow
              title={t('core-plan.price-table.standard-KYC.title')}
              credits={2}
              unitFirst={t('units.person')}
              noBorderBottom
            />
            <FeatureRow
              title={t('core-plan.price-table.one-click-KYC.title')}
              details={t('core-plan.price-table.one-click-KYC.details')}
              labelRight={t('labels.coming-soon')}
              moreDetailsCta={t('core-plan.price-table.one-click-KYC.cta')}
              handleClickTrigger={handleClickTriggerKYC}
              noBorderBottom
            />
            <InfoDialog
              dialogTitle={t(
                'core-plan.price-table.one-click-KYC.dialog.title',
              )}
              open={showDialogKYC}
              onClose={handleClose}
            >
              {t('core-plan.price-table.one-click-KYC.dialog.content')}
            </InfoDialog>
          </Box>
          <Calculator />
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

export default CorePlan;
