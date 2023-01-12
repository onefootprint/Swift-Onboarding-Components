import { useTranslation } from '@onefootprint/hooks';
import { Box, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
      <Box sx={{ marginBottom: 5 }} />
      <FeatureRow
        title={t('add-ons.features.drivers-license')}
        credits={4}
        unitFirst={t('units.scan')}
      />

      <FeatureRow
        title={t('add-ons.features.kyb')}
        credits={16}
        unitFirst={t('units.business')}
      />
      <FeatureRow
        title={t('add-ons.features.data-vaulting.title')}
        details={t('add-ons.features.data-vaulting.details')}
        credits={1}
        unitFirst={t('units.person')}
        unitSecond={t('units.year')}
      />
      <FeatureRow
        title={t('add-ons.features.kba')}
        credits={4}
        unitFirst={t('units.person')}
      />
      <FeatureRow
        title={t('add-ons.features.vault-proxy.title')}
        details={t('add-ons.features.vault-proxy.details')}
        credits={4}
        unitFirst={t('units.person')}
      />
      <FeatureRow
        title={t('add-ons.features.continuous-ofac.title')}
        labelRight={t('labels.contact-us')}
      />
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
