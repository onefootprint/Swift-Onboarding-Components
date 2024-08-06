'use client';

import { IcoChevronDown16, IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { TableRow } from '@onefootprint/ui';
import {
  Badge,
  Box,
  Button,
  Divider,
  Dropdown,
  Stack,
  Table,
  Text,
  useConfirmationDialog,
  useToast,
} from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import { useRouter } from 'next/navigation';
import type { SyntheticEvent } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { Lang } from '@/app/types';
import type { WithConfirm } from '@/helpers';
import { alertError, confirmDeletion, dateFormatter, getErrorMessage, searchByPaths } from '@/helpers';
import type { Session } from '@/hooks';
import { useClientStore } from '@/hooks';
import type { OrganizationMember, PartnerOrganization } from '@/queries';
import { patchPartner, patchPartnerMembers, postPartnerMembers, postPartnerMembersDeactivate } from '@/queries';

import { InputTextForm, LogoManager, OverlayFieldSet } from '../../components';
import OverlayInvite from './components/overlay-invite';

type T = TFunction<'common'>;
type Option = { label: string; value: string };
type SettingsPageContentProps = {
  lang: Lang;
  members: OrganizationMember[];
  partner: PartnerOrganization;
  roles: Option[];
};

const stopPropagation = (e: SyntheticEvent<unknown>) => e.stopPropagation();
const getColumns = (t: T) => [
  { id: 'email', text: t('email'), width: '25%' },
  { id: 'lastActive', text: t('last-active'), width: '20%' },
  { id: 'role', text: t('role'), width: '40%' },
  { id: 'status', text: '', width: '7.5%' },
  { id: 'actions', text: '', width: '5%' },
];

const clientSearch = searchByPaths<OrganizationMember>(['firstName', 'lastName', 'email', 'role.name']);

const amIAdmin = (data?: Session): boolean =>
  data?.user?.scopes.some(x => x.kind === 'compliance_partner_admin') || false;

const SettingsPageContent = ({ lang, members, partner, roles }: SettingsPageContentProps) => {
  const { t } = useTranslation('common');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  const toast = useToast();
  const route = useRouter();
  const confirmationDialog = useConfirmationDialog();
  const withConfirm = confirmDeletion(t, confirmationDialog.open);
  const errorToast = alertError(t, toast.show);
  const { data } = useClientStore(x => x);
  const isAdmin = amIAdmin(data);
  const companyName = partner.name;
  const companyWebsiteUrl = partner.websiteUrl;

  const onDeactivateClick = useCallback(
    (userId: string) => {
      postPartnerMembersDeactivate(userId)
        .then(route.refresh)
        .catch(err => {
          toast.show({
            variant: 'error',
            title: t('user-deactivation-error'),
            description: getErrorMessage(err),
          });
        });
    },
    [route.refresh, t, toast],
  );

  const onRoleChange = useCallback(
    (userId: string, roleId: string) => {
      patchPartnerMembers(userId, roleId)
        .then(route.refresh)
        .catch(err => {
          toast.show({
            variant: 'error',
            title: t('user-deactivation-error'),
            description: getErrorMessage(err),
          });
        });
    },
    [route.refresh, t, toast],
  );

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
        <LogoManager organization={partner} />
        <Stack gap={11} flexWrap="wrap">
          <OverlayFieldSet
            dialogHeader={companyName ? t('companies.edit-company-name') : t('companies.add-company-name')}
            dialogCancel={t('cancel')}
            dialogDelete={t('delete')}
            dialogSave={t('save')}
            label={t('companies.company-name')}
            value={companyName}
          >
            {({ id, closeDialog }) => (
              <InputTextForm
                formId={id}
                label={t('companies.company-name')}
                requiredMsg={t('required')}
                value={companyName}
                onSubmit={name => patchPartner({ name }).then(closeDialog).then(route.refresh).catch(errorToast)}
              />
            )}
          </OverlayFieldSet>
          <OverlayFieldSet
            dialogHeader={companyWebsiteUrl ? t('companies.edit-company-website') : t('companies.add-company-website')}
            dialogCancel={t('cancel')}
            dialogDelete={t('delete')}
            dialogSave={t('save')}
            label={t('companies.company-website')}
            value={companyWebsiteUrl}
          >
            {({ id, closeDialog }) => (
              <InputTextForm
                formId={id}
                label={t('companies.company-website')}
                onSubmit={websiteUrl =>
                  patchPartner({ websiteUrl }).then(closeDialog).then(route.refresh).catch(errorToast)
                }
                requiredMsg={t('required')}
                value={companyWebsiteUrl}
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
        {isAdmin ? (
          <Button variant="secondary" onClick={() => setIsInviteOpen(true)}>
            {t('invite-teammates')}
          </Button>
        ) : null}
      </Stack>
      <Divider marginBottom={7} />

      <Table<OrganizationMember>
        aria-label={t('companies.company-table-aria-label')}
        columns={getColumns(t)}
        emptyStateText={t('companies.company-empty-state')}
        getAriaLabelForRow={c => c.email}
        getKeyForRow={c => c.id}
        hasRowEmphasis={() => true}
        initialSearch=""
        items={clientSearch(members, search)}
        onChangeSearchText={setSearch}
        searchPlaceholder={t('search-placeholder')}
        renderTr={renderTr({
          isAdmin,
          lang,
          onDeactivateClick,
          onRoleChange,
          roles,
          t,
          withConfirm,
        })}
      />
      <OverlayInvite
        roles={roles}
        defaultRole={roles.find(x => x.label.includes('Member')) || roles[0] || { label: '', value: '' }}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={invitations => {
          Promise.all(invitations.map(i => postPartnerMembers(i)))
            .then(() => setIsInviteOpen(false))
            .then(route.refresh)
            .catch(err => {
              toast.show({
                variant: 'error',
                description: getErrorMessage(err),
                title: t('invitation-error', { count: invitations.length }),
              });
            });
        }}
      />
    </>
  );
};

const renderTr = ({
  isAdmin,
  lang,
  onDeactivateClick,
  onRoleChange,
  roles,
  t,
  withConfirm,
}: {
  isAdmin: boolean;
  lang: Lang;
  onDeactivateClick: (userId: string) => void;
  onRoleChange: (userId: string, roleId: string) => void;
  roles: Option[];
  t: T;
  withConfirm: WithConfirm;
}) =>
  function Tr({ item: member }: TableRow<OrganizationMember>) {
    const { email, firstName, lastName } = member;
    const lastLoginAt = member.rolebinding?.lastLoginAt;

    return (
      <>
        <Td>
          {firstName ? `${firstName} ${lastName}` : '-'}
          <Text variant="body-3" color="tertiary">
            {email}
          </Text>
        </Td>
        <Td>{dateFormatter(lang, lastLoginAt) || '-'}</Td>
        {isAdmin ? (
          <Td>
            <Dropdown.Root>
              <Trigger aria-label="new label">
                {member.role.name} <IcoChevronDown16 />
              </Trigger>
              <Dropdown.Content align="end">
                {roles
                  .filter(r => r.label !== member.role.name)
                  .map(r => (
                    <Dropdown.Item
                      data-id={r.value}
                      key={r.value}
                      onSelect={() => onRoleChange(member.id, r.value)}
                      onClick={stopPropagation}
                    >
                      {r.label}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Content>
            </Dropdown.Root>
          </Td>
        ) : (
          <Td>{member.role.name}</Td>
        )}
        <Td>{!lastLoginAt && <Badge variant="warning">{t('pending')}</Badge>}</Td>
        {isAdmin ? (
          <Td>
            <Box tag="div" display="grid" justifyContent="end" alignItems="center">
              <Dropdown.Root>
                <Dropdown.Trigger aria-label={`${t('open-actions-for')} ${member.email}`}>
                  <IcoDotsHorizontal24 />
                </Dropdown.Trigger>
                <Dropdown.Content align="end">
                  <Dropdown.Item
                    onSelect={withConfirm(() => onDeactivateClick(member.id))}
                    onClick={stopPropagation}
                    variant="destructive"
                  >
                    {t('deactivate')}
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Root>
            </Box>
          </Td>
        ) : (
          <Td />
        )}
      </>
    );
  };

const Td = styled.td`
  && {
    height: 56px;
  }
`;

const Trigger = styled(Dropdown.Trigger)`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover,
  &:enabled:hover,
  &[data-state='open'] {
    background: transparent;
  }
`;

export default SettingsPageContent;
