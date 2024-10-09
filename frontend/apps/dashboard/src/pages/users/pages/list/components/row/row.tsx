import type { Entity } from '@onefootprint/types';
import { CodeInline, Text } from '@onefootprint/ui';
import { StatusBadge } from 'src/components';
import getTruncatedName from 'src/utils/get-truncated-name';
import Tags from '../tags';

type RowProps = {
  entity: Entity;
};

const Row = ({ entity }: RowProps) => (
  <>
    <td>
      <Text variant="body-3" truncate>
        {getTruncatedName(entity.data)}
      </Text>
    </td>
    <td>
      <CodeInline isPrivate truncate>
        {entity.id}
      </CodeInline>
    </td>
    <td aria-label="status badge">
      <StatusBadge status={entity.status} requiresManualReview={entity.requiresManualReview} />
    </td>
    <td>
      <Text variant="body-3" color="primary" truncate>
        {new Date(entity.lastActivityAt).toLocaleString('en-us', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Text>
    </td>
    <td aria-label="tags">
      <Tags entity={entity} />
    </td>
  </>
);

export default Row;
