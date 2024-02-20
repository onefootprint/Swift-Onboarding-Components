import type { Entity } from '@onefootprint/types';
import { BusinessDI } from '@onefootprint/types';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { FieldOrPlaceholder, StatusBadge } from 'src/components';

import Tags from './components/tags';

type RowProps = {
  entity: Entity;
};

const Row = ({ entity }: RowProps) => (
  <>
    <td aria-label="field or placeholder">
      <FieldOrPlaceholder data={entity.decryptedAttributes[BusinessDI.name]} />
    </td>
    <td>
      <CodeInline isPrivate truncate>
        {entity.id}
      </CodeInline>
    </td>
    <td aria-label="status badge">
      <StatusBadge status={entity.status} />
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
        {new Date(entity.lastActivityAt).toLocaleString('en-us', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Typography>
    </td>
    <td aria-label="tags">
      <Tags
        onWatchlist={entity.watchlistCheck?.status === 'fail'}
        onManualReview={entity.requiresManualReview}
      />
    </td>
  </>
);

export default Row;
