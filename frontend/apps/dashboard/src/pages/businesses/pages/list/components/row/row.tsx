import { BusinessDI, type Entity } from '@onefootprint/types';
import { CodeInline, Text } from '@onefootprint/ui';
import { FieldOrPlaceholder, StatusBadge } from 'src/components';
import Tags from './components/tags';

type RowProps = {
  entity: Entity;
};

const Row = ({ entity }: RowProps) => {
  return (
    <>
      <td aria-label="field or placeholder">
        <FieldOrPlaceholder data={entity.data.find(item => item.identifier === BusinessDI.name)?.value} />
      </td>
      <td>
        <CodeInline isPrivate>{entity.id}</CodeInline>
      </td>
      <td aria-label="status badge">
        <StatusBadge status={entity.status} />
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
};

export default Row;
