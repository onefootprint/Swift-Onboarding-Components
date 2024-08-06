'use client';

import type { TableRow } from '@onefootprint/ui';
import { Stack, Table, Text } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { searchByPaths } from '@/helpers';
import type { PartnerCompany } from '@/queries/get-partner-partnerships';

type T = TFunction<'common'>;
type CompaniesContentProps = { companies: PartnerCompany[] };

const getColumns = (t: T) => [
  { text: t('company'), width: '40%' },
  { text: t('companies.completed-controls'), width: '25%' },
  { text: t('companies.active-playbooks'), width: '25%' },
];

const clientSearch = searchByPaths<PartnerCompany>(['companyName']);

const CompaniesContent = ({ companies }: CompaniesContentProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [search, setSearch] = useState<string>('');

  const sortedCompanies = companies.slice().sort((a, b) => a.companyName.localeCompare(b.companyName));

  const handleRowClick = (company: PartnerCompany) => {
    router.push(`/app/companies/${company.id}`);
  };

  return (
    <>
      <Stack gap={2} direction="column" marginBottom={7}>
        <Text tag="h2" variant="heading-2">
          {t('companies.companies')}
        </Text>
        <Text tag="p" variant="body-2" maxWidth="580px">
          {t('companies.companies-overview')}
        </Text>
      </Stack>
      <Table<PartnerCompany>
        aria-label={t('companies.company-table-aria-label')}
        columns={getColumns(t)}
        emptyStateText={t('companies.company-empty-state')}
        getAriaLabelForRow={c => c.companyName}
        getKeyForRow={c => c.id}
        hasRowEmphasis={() => true}
        initialSearch=""
        items={clientSearch(sortedCompanies, search)}
        onChangeSearchText={setSearch}
        onRowClick={handleRowClick}
        renderTr={renderTr}
        searchPlaceholder={t('search-placeholder')}
      />
    </>
  );
};

const renderTr = ({ item }: TableRow<PartnerCompany>) => (
  <>
    <td>{item.companyName}</td>
    <td>
      {item.numControlsComplete} / {item.numControlsTotal}
    </td>
    <td>{item.numActivePlaybooks}</td>
  </>
);

export default CompaniesContent;
