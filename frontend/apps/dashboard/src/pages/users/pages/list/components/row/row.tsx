import type { Entity } from '@onefootprint/types';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { StatusBadge } from 'src/components';

import Tags from './components/tags';

type RowProps = {
  entity: Entity;
};

const Row = ({ entity }: RowProps) => (
  <>
    <td>
      <CodeInline isPrivate truncate>
        {entity.id}
      </CodeInline>
    </td>
    <td>
      <StatusBadge
        status={entity.status}
        requiresManualReview={entity.requiresManualReview}
      />
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
        {new Date(entity.startTimestamp).toLocaleString('en-us', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Typography>
    </td>
    <td>
      <Tags
        onWatchlist={entity.watchlistCheck?.status === 'fail'}
        onManualReview={entity.requiresManualReview}
      />
    </td>
  </>
);

export default Row;
