import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { ThemedLogoFpCompact } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { GetAuthRoleResponse } from '@onefootprint/types';
import { Container } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useAssumeAuthRole from 'src/hooks/use-assume-auth-role';
import useAuthRoles from 'src/hooks/use-auth-roles';
import useSession from 'src/hooks/use-session';

import NavDropdown from './components/nav-dropdown';

const TopMenuBar = () => {
  const { t } = useTranslation('components.private-layout.nav');
  const { dangerouslyCastedData, logIn } = useSession();
  const assumeRoleMutation = useAssumeAuthRole();
  const showErrorToast = useRequestErrorToast();
  const router = useRouter();
  const {
    isLoading,
    error: tenantsError,
    data: unorderedTenants,
  } = useAuthRoles(dangerouslyCastedData.auth);
  const currTenantId = dangerouslyCastedData.org.id;

  const moveTenantToFront = (
    tenants: GetAuthRoleResponse,
    targetTenantId: string,
  ) => {
    if (!Array.isArray(tenants) || tenants.length === 0) {
      return tenants;
    }
    const currTenantIndex = tenants.findIndex(
      tenant => tenant.id === targetTenantId,
    );
    if (currTenantIndex === -1) {
      return tenants;
    }
    const currTenant = tenants[currTenantIndex];
    const remainingTenants = tenants.filter(
      (_, index) => index !== currTenantIndex,
    );
    return [currTenant, ...remainingTenants];
  };
  const tenants = moveTenantToFront(unorderedTenants ?? [], currTenantId);

  const onAssumeTenant = (tenantId: string) => {
    const authToken = dangerouslyCastedData.auth;
    assumeRoleMutation.mutate(
      { tenantId, authToken },
      {
        async onSuccess() {
          await logIn({ auth: authToken });
          router.reload();
        },
        onError: showErrorToast,
      },
    );
  };

  return (
    <Container>
      <Link href="/users" aria-label={t('users')}>
        <Footprint>
          <ThemedLogoFpCompact color="primary" />
        </Footprint>
      </Link>
      <NavDropdown
        isLoading={isLoading}
        tenants={tenants}
        currTenantId={currTenantId}
        onAssumeTenant={onAssumeTenant}
        user={dangerouslyCastedData.user}
        tenantsError={tenantsError}
      />
    </Container>
  );
};

const Footprint = styled.i`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    align-items: center;
    padding: ${theme.spacing[4]} 0;
  `};
`;

export default TopMenuBar;
