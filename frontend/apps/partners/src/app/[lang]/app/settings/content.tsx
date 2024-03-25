'use client';

import type { Member, Organization } from '@onefootprint/types';
import type { TableRow } from '@onefootprint/ui';
import { Badge, Button, Divider, Stack, Table, Text } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { InputTextForm, LogoManager, OverlayFieldSet } from '../components';
import OverlayInvite from './components/overlay-invite';

type T = TFunction<'common'>;
type SettingsPageContentProps = { members: Member[] };

const organization = {
  name: 'Organization name',
  logoUrl: undefined,
} as unknown as Organization;

const getColumns = (t: T) => [
  { id: 'email', text: t('email'), width: '25%' },
  { id: 'lastActive', text: t('last-active'), width: '20%' },
  { id: 'role', text: t('role'), width: '40%' },
  { id: 'status', text: '', width: '7.5%' },
  { id: 'actions', text: '', width: '5%' },
];

const SettingsPageContent = ({ members }: SettingsPageContentProps) => {
  // const router = useRouter();
  const { t } = useTranslation('common');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleSearchChange = (searchText: string) => {
    // TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(searchText);
  };

  const handleRowClick = (member: Member) => {
    console.log('# member', member); // eslint-disable-line no-console
    // router.push(`/app/companies/${member.id}`);
  };

  return (
    <>
      <Text tag="h2" variant="heading-2" marginBottom={7}>
        {t('settings')}
      </Text>

      <Stack gap={2} direction="column" marginBottom={4}>
        <Text variant="label-1" tag="h3">
          {t('business-profile')}
        </Text>
        <Text variant="body-3" color="secondary" marginBottom={4}>
          {t('manage-your-business-details')}
        </Text>
        <Divider marginBottom={7} />
      </Stack>

      <Stack gap={7} direction="column" marginBottom={10}>
        <LogoManager organization={organization} />
        <Stack gap={11} flexWrap="wrap">
          <OverlayFieldSet
            dialogHeader={
              'Evolve'
                ? t('companies.edit-company-name')
                : t('companies.add-company-name')
            }
            dialogCancel={t('cancel')}
            dialogDelete={t('delete')}
            dialogSave={t('save')}
            label={t('companies.company-name')}
            value="Evolve"
          >
            {({ id, handleSubmit }) => (
              <InputTextForm
                formId={id}
                label={t('companies.company-name')}
                requiredMsg={t('required')}
                value="Evolve"
                onSubmit={name => handleSubmit({ name })}
              />
            )}
          </OverlayFieldSet>
          <OverlayFieldSet
            dialogHeader={
              'https://www.getevolved.com'
                ? t('companies.edit-company-website')
                : t('companies.add-company-website')
            }
            dialogCancel={t('cancel')}
            dialogDelete={t('delete')}
            dialogSave={t('save')}
            label={t('companies.company-website')}
            value="https://www.getevolved.com"
          >
            {({ id, handleSubmit }) => (
              <InputTextForm
                formId={id}
                label={t('companies.company-website')}
                onSubmit={websiteUrl => handleSubmit({ websiteUrl })}
                requiredMsg={t('required')}
                value="https://www.getevolved.com"
              />
            )}
          </OverlayFieldSet>
        </Stack>
      </Stack>

      <Stack justifyContent="space-between" marginBottom={5}>
        <div>
          <Text variant="label-1" tag="h3">
            {t('team')}
          </Text>
          <Text variant="body-3" color="secondary">
            {t('manage-team-roles')}
          </Text>
        </div>
        <Button variant="secondary" onClick={() => setIsInviteOpen(true)}>
          {t('invite-teammates')}
        </Button>
      </Stack>
      <Divider marginBottom={7} />

      <Table<Member>
        aria-label={t('companies.company-table-aria-label')}
        columns={getColumns(t)}
        emptyStateText={t('companies.company-empty-state')}
        getAriaLabelForRow={c => c.email}
        getKeyForRow={c => c.id}
        hasRowEmphasis={() => true}
        initialSearch=""
        items={members}
        onChangeSearchText={handleSearchChange}
        onRowClick={handleRowClick}
        renderTr={renderTr(t)}
        searchPlaceholder={t('search-placeholder')}
      />
      <OverlayInvite
        defaultRole={{ label: '', value: '', description: undefined }}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={() => undefined}
        roles={[]}
      />
    </>
  );
};

const renderTr = (t: T) =>
  function Tr({ item: member }: TableRow<Member>) {
    const { email, firstName, lastName } = member;
    const lastLoginAt = member.rolebinding?.lastLoginAt;
    // const isMemberCurrentUser = session.data?.id === id;
    // const shouldShowActions = !isMemberCurrentUser;
    return (
      <>
        <Td>
          {firstName ? `${firstName} ${lastName}` : '-'}
          <Text variant="body-3" color="tertiary">
            {email}
          </Text>
        </Td>
        <Td>{lastLoginAt || '-'}</Td>
        <Td>{member.role.name}</Td>
        <Td>
          {!lastLoginAt && <Badge variant="warning">{t('pending')}</Badge>}
        </Td>
        <Td>Action</Td>
      </>
    );
  };

const Td = styled.td`
  && {
    height: 56px;
  }
`;

export default SettingsPageContent;
