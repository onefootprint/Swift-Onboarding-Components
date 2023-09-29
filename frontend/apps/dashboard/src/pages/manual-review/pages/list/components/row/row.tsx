import { useTranslation } from '@onefootprint/hooks';
import type {
  Entity,
  VaultEmptyData,
  VaultEncryptedData,
  VaultTextData,
} from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { FieldOrPlaceholder, StatusBadge } from 'src/components';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import getFullName from 'src/utils/get-full-name';

type RowProps = {
  entity: Entity;
};

const Row = ({ entity }: RowProps) => {
  const { t } = useTranslation('pages.users.table.row');
  const { data: vault } = useEntityVault(entity.id, entity);
  const [firstName, middleName, lastName] = [
    vault?.[IdDI.firstName],
    vault?.[IdDI.middleName],
    vault?.[IdDI.lastName],
  ] as (VaultTextData | VaultEncryptedData | VaultEmptyData)[];
  const fullName = getFullName(firstName, middleName, lastName);

  return (
    <>
      <td>
        <FieldOrPlaceholder data={fullName} />
      </td>
      <td>
        <CodeInline isPrivate truncate>
          {entity.id}
        </CodeInline>
      </td>
      <td>
        <StatusBadge
          status={entity.status}
          requiresManualReview={entity.requiresManualReview}
          isOnWatchlist={entity.watchlistCheck?.status === 'fail'}
          shouldShowWatchlistLabel={false}
          watchlistLabel={t('status.on-watchlist')}
        />
      </td>
      <td>
        <FieldOrPlaceholder data={vault?.[IdDI.email]} />
      </td>
      <td>
        <Typography
          variant="body-3"
          color="primary"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {/* We are using the entity's start time stamp as our "Pending since" field 
          until we have more sophisticated info about manual reviews from the BE */}
          {new Date(entity.startTimestamp).toLocaleString('en-us', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Typography>
      </td>
    </>
  );
};

export default Row;
