import { useTranslation } from '@onefootprint/hooks';
import type { Entity } from '@onefootprint/types';
import { BusinessDI } from '@onefootprint/types';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { FieldOrPlaceholder, StatusBadge } from 'src/components';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';

type RowProps = {
  entity: Entity;
};

// TODO: https://linear.app/footprint/issue/FP-3097/business-list-user-list-use-right-function-to-format-date
const Row = ({ entity }: RowProps) => {
  const { t } = useTranslation('pages.businesses.table.row');
  const { data: vault } = useEntityVault(entity.id, entity);

  return (
    <>
      <td>
        <FieldOrPlaceholder
          data={entity.decryptedAttributes[BusinessDI.name]}
        />
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
        <FieldOrPlaceholder data={vault?.[BusinessDI.beneficialOwners]} />
      </td>
      <td>
        <Typography variant="body-3" color="primary">
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
