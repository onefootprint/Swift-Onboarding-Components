import type { List } from '@onefootprint/request-types/dashboard';
import { Table as UITable } from '@onefootprint/ui';
// import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
// import useSession from 'src/hooks/use-session';
import Row from './components/row';

type TableProps = {
  data?: List[];
  errorMessage?: string;
  isPending?: boolean;
};

const Table = ({ data, isPending, errorMessage }: TableProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'list' });
  //   const session = useSession();
  //   const router = useRouter();
  //   const filters = useFilters();

  const columns = [
    { id: 'name', text: t('table.header.name'), width: '20%' },
    { id: 'alias', text: t('table.header.alias'), width: '20%' },
    { id: 'entries', text: t('table.header.entries'), width: '20%' },
    {
      id: 'used',
      text: t('table.header.used-in-rules'),
      width: '20%',
    },
    { id: 'created', text: t('table.header.created'), width: '20%' },
  ];

  //   const handleRowClick = (list: List) => {
  //     const mode = session.isLive ? 'live' : 'sandbox';
  //     router.push({
  //       pathname: `/lists/${list.id}`,
  //       query: { ...filters.query, mode },
  //     });
  //   };

  return (
    <UITable<List>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('empty-description')}
      getAriaLabelForRow={list => list.name}
      getKeyForRow={list => list.id}
      isLoading={isPending}
      items={data}
      //   onRowClick={handleRowClick}
      renderTr={({ item: list }) => <Row list={list} />}
    />
  );
};
export default Table;
