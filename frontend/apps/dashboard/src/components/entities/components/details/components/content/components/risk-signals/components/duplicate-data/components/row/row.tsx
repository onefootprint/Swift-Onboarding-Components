import { IcoUsers16 } from '@onefootprint/icons';
import type {
  DuplicateDataItem,
  OtherTenantsDuplicateDataSummary,
} from '@onefootprint/types';
import { Box, CodeInline, Tag, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';
import useSession from 'src/hooks/use-session';
import getTruncatedName from 'src/utils/get-truncated-name';
import styled, { css } from 'styled-components';

export type SameTenantDuplicateDataItemRow = {
  sameTenant: DuplicateDataItem | undefined;
};

export type OtherTenantsDuplicateDataSummaryRow = {
  otherTenant: {
    data: OtherTenantsDuplicateDataSummary;
    isSameTenantEmpty: boolean;
  };
};

export type DuplicateDataTableRowItem =
  | SameTenantDuplicateDataItemRow
  | OtherTenantsDuplicateDataSummaryRow;

export type RowProps = {
  duplicateDataTableRowItem: DuplicateDataTableRowItem;
};

const Row = ({ duplicateDataTableRowItem }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.duplicate-data',
  });
  const {
    data: { org },
  } = useSession();

  if ('otherTenant' in duplicateDataTableRowItem) {
    const {
      isSameTenantEmpty,
      data: { numMatches, numTenants },
    } = duplicateDataTableRowItem.otherTenant;
    return (
      <td colSpan={4} aria-label="other tenants duplicate data">
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
                isSameTenantEmpty
                  ? 'pages.entity.risk-signals.duplicate-data.other-tenants-summary.description-empty-same-tenant'
                  : 'pages.entity.risk-signals.duplicate-data.other-tenants-summary.description'
              }
              values={{
                numMatches,
                numTenants,
              }}
            />
          </Text>
        </OtherTenantsSummaryContainer>
      </td>
    );
  }

  if (
    'sameTenant' in duplicateDataTableRowItem &&
    !duplicateDataTableRowItem.sameTenant
  ) {
    return (
      <td colSpan={4} aria-label="no same tenant duplicate data">
        <Text variant="body-3" color="secondary">
          {t('empty-same-tenant', { orgName: org?.name ?? '' })}
        </Text>
      </td>
    );
  }

  if (
    'sameTenant' in duplicateDataTableRowItem &&
    duplicateDataTableRowItem.sameTenant
  ) {
    const { dupeKinds, fpId, status, startTimestamp, data } =
      duplicateDataTableRowItem.sameTenant;

    return (
      <>
        <td>
          <Text variant="body-3" truncate>
            {getTruncatedName(data)}
          </Text>
        </td>
        <td>
          <CodeInline isPrivate truncate>
            {fpId}
          </CodeInline>
        </td>
        <td>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            paddingTop={4}
            paddingBottom={4}
          >
            {dupeKinds.map(kind => (
              <Tag key={kind}>{t(`dupe-kinds.${kind}` as ParseKeys)}</Tag>
            ))}
          </Box>
        </td>
        <td aria-label="status badge">
          <StatusBadge status={status} />
        </td>
        <td>
          <Text variant="body-3" color="primary" truncate>
            {new Date(startTimestamp).toLocaleString('en-us', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Text>
        </td>
      </>
    );
  }

  return null;
};

const OtherTenantsSummaryContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

export default Row;
