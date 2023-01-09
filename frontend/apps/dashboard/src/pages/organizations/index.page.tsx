import { useTranslation } from '@onefootprint/hooks';
import { Organization } from '@onefootprint/types';
import { OrgAssumeRoleResponse } from '@onefootprint/types/src/api/org-assume-role';
import { Table, TableRow } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import TermsAndConditions from 'src/components/terms-and-conditions/terms-and-conditions';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import LogoAndText from '../login/components/logo-and-text';
import OrganizationItem from './components/organization-item';
import useAssumeRole from './hooks/use-assume-role';
import useGetRoles from './hooks/use-get-roles';

const Organizations = () => {
  const { t } = useTranslation('pages.organizations');
  const router = useRouter();
  const authToken = (router.query.token || '') as string;
  const getRoles = useGetRoles(authToken);
  const { logIn } = useSession();
  const assumeRoleMutation = useAssumeRole();

  const handleTenantSelect = (tenantId: string) => {
    assumeRoleMutation.mutate(
      { tenantId, authToken },
      {
        onSuccess({ user, tenant }: OrgAssumeRoleResponse) {
          logIn(authToken, user, tenant);
          router.push('/users');
        },
      },
    );
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <LogoAndText text={t('title')} />
        <Inner>
          <TableContainer>
            <Table<Organization>
              aria-label={t('table.aria-label')}
              columns={[{ text: 'Name' }]}
              hideThead
              items={getRoles.data}
              isLoading={getRoles.isLoading}
              getKeyForRow={(item: Organization) => item.id}
              onRowClick={(item: Organization) => handleTenantSelect(item.id)}
              renderTr={({ item }: TableRow<Organization>) => (
                <OrganizationItem item={item} />
              )}
            />
          </TableContainer>
          <TermsAndConditions />
        </Inner>
      </Container>
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    width: 350px;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
  `}
`;

const TableContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
  `}
`;

export default Organizations;
