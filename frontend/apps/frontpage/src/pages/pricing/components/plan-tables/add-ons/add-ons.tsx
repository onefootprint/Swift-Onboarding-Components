import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media } from '@onefootprint/ui';
import React from 'react';

import * as constants from '../../../utils/constants';
import FeatureRow from '../components/feature-row';
import TableHeader from '../components/table-header';

const translationKeys = [
  {
    key: 'kyb',
    title: 'add-ons.features.kyb.title',
    cost: constants.KYB_COST,
    unit: 'verification',
  },
  {
    key: 'non-identity-data-vaulting',
    title: 'add-ons.features.non-identity-data-vaulting.title',
    details: 'add-ons.features.non-identity-data-vaulting.details',
    cost: constants.DATA_VAULTING_COST,
    unit: 'person',
    unitSecond: 'month',
  },
  {
    key: 'drivers-license',
    title: 'add-ons.features.drivers-license.title',
    cost: constants.DRIVERS_COST,
    unit: 'scan',
  },
  {
    key: 'vault-proxy',
    title: 'add-ons.features.vault-proxy.title',
    details: 'add-ons.features.vault-proxy.details',
    cost: constants.VAULT_PROXY_COST,
    unit: 'person',
    unitSecond: 'month',
  },
  {
    key: 'continuous-ofac',
    title: 'add-ons.features.continuous-ofac.title',
    cost: constants.CONTINUOUS_OFAC_COST,
    unit: 'person',
    unitSecond: 'month',
  },
  {
    key: 'auth',
    title: 'add-ons.features.auth.title',
    cost: constants.AUTH_COST,
    unit: 'person',
    unitSecond: 'month',
  },
  {
    key: 'embedded-onboarding',
    title: 'add-ons.features.embedded-onboarding.title',
    cost: constants.EMBEDDED_ONBOARDING_COST,
    unit: 'person',
    unitSecond: 'month',
  },
];

const AddOns = () => {
  const { t } = useTranslation('pages.pricing');
  return (
    <TableContainer>
      <TableHeader
        title={t('add-ons.title')}
        microtitle={t('add-ons.micro-title')}
      />
      <Box sx={{ marginBottom: 5, marginTop: 5 }}>
        {translationKeys.map(translationKey => (
          <FeatureRow
            key={translationKey.key}
            title={t(`${translationKey.title}`)}
            details={translationKey.details && t(`${translationKey.details}`)}
            cost={translationKey.cost}
            unitFirst={translationKey.unit && t(`units.${translationKey.unit}`)}
            unitSecond={
              translationKey.unitSecond &&
              t(`units.${translationKey.unitSecond}`)
            }
          />
        ))}
      </Box>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[8]} ${theme.spacing[4]};
    padding-bottom: ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.primary};
    overflow: hidden;

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[7]};
      padding-bottom: ${theme.spacing[4]}
    `};
  `}
`;

export default AddOns;
