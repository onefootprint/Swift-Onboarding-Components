import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media } from '@onefootprint/ui';
import React from 'react';

import FeatureRow from '../components/feature-row';
import TableHeader from '../components/table-header';

const AddOns = () => {
  const { t } = useTranslation('pages.pricing');
  return (
    <TableContainer>
      <TableHeader
        title={t('add-ons.title')}
        microtitle={t('add-ons.micro-title')}
      />
      <Box sx={{ marginBottom: 5, marginTop: 5 }}>
        <FeatureRow
          title={t('core-plan.price-table.KYB.title')}
          cost={5}
          unitFirst={t('units.verification')}
        />
        <FeatureRow
          title={t('core-plan.price-table.non-identity-data-vaulting.title')}
          details={t(
            'core-plan.price-table.non-identity-data-vaulting.details',
          )}
          cost={0.03}
          unitFirst={t('units.person')}
          unitSecond={t('units.month')}
        />
        <FeatureRow
          title={t('core-plan.price-table.vault-proxy.title')}
          details={t('core-plan.price-table.vault-proxy.details')}
          cost={0.05}
          unitFirst={t('units.person')}
          unitSecond={t('units.month')}
        />
        <FeatureRow
          title={t('add-ons.features.drivers-license')}
          cost={1}
          unitFirst={t('units.scan')}
        />
        <FeatureRow
          title={t('add-ons.features.continuous-ofac.title')}
          cost={0.03}
          unitFirst={t('units.person')}
          unitSecond={t('units.month')}
        />
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
