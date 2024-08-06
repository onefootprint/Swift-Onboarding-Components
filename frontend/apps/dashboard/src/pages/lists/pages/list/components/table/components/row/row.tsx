import { useIntl } from '@onefootprint/hooks';
import type { List } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type RowProps = {
  list: List;
};

const Row = ({ list }: RowProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'list.table.row',
  });
  const { name, alias, entriesCount, usedInPlaybook, createdAt } = list;
  const { formatDateWithTime } = useIntl();

  return (
    <>
      <td>{name}</td>
      <td>{alias}</td>
      <td>{entriesCount ?? 0}</td>
      <td>
        {usedInPlaybook ? (
          <Badge variant="success">{t('used-in-rules.yes')}</Badge>
        ) : (
          <Badge variant="error">{t('used-in-rules.no')}</Badge>
        )}
      </td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
    </>
  );
};

export default Row;
