'use client';

import { IcoArrowRightSmall24 } from '@onefootprint/icons';
import type { TableRow } from '@onefootprint/ui';
import { Box, IconButton, Stack, Table, Text } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerCompany } from '@/config/types';

type T = TFunction<'common'>;
type CompaniesProps = { companies: PartnerCompany[] };

const Companies = ({ companies }: CompaniesProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const columns = [
    { text: t('company'), width: '40%' },
    { text: t('companies.completed-controls'), width: '25%' },
    { text: t('companies.active-playbooks'), width: '25%' },
    { text: '', width: '10%' },
  ];

  const handleSearchChange = (searchText: string) => {
    // TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(searchText);
  };

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
        columns={columns}
        emptyStateText={t('companies.company-empty-state')}
        getAriaLabelForRow={(c: PartnerCompany) => c.name}
        getKeyForRow={(c: PartnerCompany) => c.id}
        hasRowEmphasis={() => true}
        initialSearch=""
        items={companies}
        onChangeSearchText={handleSearchChange}
        renderTr={renderTr(t)}
        searchPlaceholder={t('search-placeholder')}
        onRowClick={handleRowClick}
      />
    </>
  );
};

const renderTr = (t: T) =>
  function Tr({ item }: TableRow<PartnerCompany>) {
    return (
      <>
        <td>{item.name}</td>
        <td>
          {item.controls.value} / {item.controls.total}
        </td>
        <td>{item.activePlaybooks}</td>
        <Box tag="td" display="grid" justifyContent="end" alignItems="center">
          <IconButton aria-label={`${t('open-actions-for')} ${item.name}`}>
            <IcoArrowRightSmall24 />
          </IconButton>
        </Box>
      </>
    );
  };

export default Companies;
