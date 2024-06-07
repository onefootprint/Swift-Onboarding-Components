import { IcoInfo16, IcoUsers16 } from '@onefootprint/icons';
import type { OtherTenantsDuplicateDataSummary } from '@onefootprint/types';
import { Box, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type OtherTenantSummaryProps = {
  summary: OtherTenantsDuplicateDataSummary;
  isSameTenantDataEmpty?: boolean;
};

const OtherTenantSummary = ({ isSameTenantDataEmpty, summary }: OtherTenantSummaryProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.duplicate-data.other-tenants-summary',
  });
  const { numMatches, numTenants } = summary;

  return (
    <OtherTenantsSummaryContainer>
      <Box
        backgroundColor="secondary"
        borderRadius="full"
        width="24px"
        height="24px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <IcoUsers16 />
      </Box>
      <Text variant="body-3" testID="other-tenant-summary">
        <Trans
          i18nKey={
            isSameTenantDataEmpty
              ? 'pages.entity.duplicate-data.other-tenants-summary.description-empty-same-tenant'
              : 'pages.entity.duplicate-data.other-tenants-summary.description'
          }
          values={{
            numMatches,
            numTenants,
          }}
        />
      </Text>
      {numMatches > 0 && (
        <Tooltip text={t('tooltip')}>
          <IcoInfo16 />
        </Tooltip>
      )}
    </OtherTenantsSummaryContainer>
  );
};

const OtherTenantsSummaryContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[5]} 0;
  `};
`;

export default OtherTenantSummary;
