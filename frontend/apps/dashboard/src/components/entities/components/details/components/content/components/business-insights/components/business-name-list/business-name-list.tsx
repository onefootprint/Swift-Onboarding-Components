import { BusinessName } from '@onefootprint/types';
import { Table, TableRow } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Row from './components/row';

type BusinessNameListProps = {
  data: BusinessName[];
};

const BusinessNameList = ({ data }: BusinessNameListProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.name.table',
  });

  const columns = [
    { text: t('header.name'), width: '42%' },
    { text: t('header.type'), width: '22%' },
    { text: t('header.notes'), width: '36%' },
  ];

  return (
    <Table<BusinessName>
      aria-label={t('aria-label')}
      columns={columns}
      emptyStateText={t('empty-state')}
      getKeyForRow={(bn: BusinessName) => `${bn.name} ${bn.kind}`}
      items={data}
      renderTr={renderTr}
    />
  );
};

const renderTr = ({ item }: TableRow<BusinessName>) => <Row businessName={item} />;

export default BusinessNameList;
