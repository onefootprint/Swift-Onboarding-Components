'use client';

import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { TableRow } from '@onefootprint/ui';
import { Box, IconButton, Stack, Table, Text } from '@onefootprint/ui';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerCompany } from '@/config/types';

type CompaniesProps = {
  companies: PartnerCompany[];
};

const Companies = ({ companies }: CompaniesProps) => {
  const router = useRouter();
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-keys' });
  const columns = [
    { text: t('table.header.company'), width: '40%' },
    { text: t('table.header.controls'), width: '25%' },
    { text: t('table.header.active-playbooks'), width: '25%' },
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
          Companies
        </Text>
        <Text tag="p" variant="body-2" maxWidth="580px">
          View all relevant compliance-related information at glance and onboard
          companies quicker.
        </Text>
      </Stack>
      <Table<PartnerCompany>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={t('table.empty-state')}
        getAriaLabelForRow={(c: PartnerCompany) => c.name}
        getKeyForRow={(c: PartnerCompany) => c.id}
        hasRowEmphasis={() => true}
        initialSearch=""
        items={companies}
        onChangeSearchText={handleSearchChange}
        renderTr={renderTr}
        searchPlaceholder="search"
        onRowClick={handleRowClick}
      />
    </>
  );
};

const renderTr = ({ item }: TableRow<PartnerCompany>) => (
  <>
    <td>{item.name}</td>
    <td>
      {item.controls.value} / {item.controls.total}
    </td>
    <td>{item.activePlaybooks}</td>
    <Box tag="td" display="grid" justifyContent="end" alignItems="center">
      <IconButton aria-label={`Open actions for ${item.name}`}>
        <IcoDotsHorizontal24 />
      </IconButton>
    </Box>
  </>
);

export default Companies;
