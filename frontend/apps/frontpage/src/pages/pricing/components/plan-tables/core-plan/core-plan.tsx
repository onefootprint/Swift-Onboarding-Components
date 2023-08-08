import '@typeform/embed/build/css/popup.css';

import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import LinkButton from 'src/components/linking-button';

import * as constants from '../../../utils/constants';
import Banner from '../../banner';
import InfoDialog from '../../info-dialog';
import CheckedRow from '../components/checked-row';
import FeatureRow from '../components/feature-row';
import TableHeader from '../components/table-header';
import PlusBottomBanner from './plus-bottom-banner';

const translationKeys = [
  'nitro-enclaves',
  'isolated-compute',
  'encryption-and-tokenization',
  'access-control',
  'audit-logs',
  'idv-kyc',
  'face-id',
  'dashboard',
  'one-click',
  'step-up-verification',
  'ofac',
];

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
            cost={constants.KYC_COST}
            unitFirst={t('units.verification')}
            hideBorderBottom
          />

          <FeatureRow
            title={t('core-plan.price-table.pii-storage.title')}
            cost={constants.PII_COST}
            unitFirst={t('units.person')}
            unitSecond={t('units.month')}
          />
        </PricingTable>
        <Box>
          <Box>
            <Typography variant="label-1" sx={{ marginLeft: 3 }}>
              {t('core-plan.features.title')}
            </Typography>
            {translationKeys.map(translationKey => (
              <CheckedRow
                key={translationKey}
                title={t(`core-plan.features.${translationKey}`)}
              />
            ))}
          </Box>
          <PlusBottomBanner
            tag={t('core-plan.one-click-kyc.label')}
            title={t('core-plan.one-click-kyc.title')}
            details={t('core-plan.one-click-kyc.details')}
          />
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
