import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { Organization, OrgAssumeRoleResponse } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

import ButtonGroup from '../button-group';
import useAssumeRole from './hooks/use-assume-role';

type DataProps = {
  authToken: string;
  organizations: Organization[];
};

const Data = ({ authToken, organizations }: DataProps) => {
  const { t } = useTranslation('pages.organizations');
  const { logIn } = useSession();
  const router = useRouter();
  const assumeRoleMutation = useAssumeRole();
  const showErrorToast = useRequestErrorToast();

  const handleClick = (tenantId: string) => () => {
    assumeRoleMutation.mutate(
      { tenantId, authToken },
      {
        onSuccess({ user, tenant }: OrgAssumeRoleResponse) {
          logIn({
            auth: authToken,
            user,
            org: tenant,
            meta: {
              isFirstLogin: false,
              requiresOnboarding: false,
              createdNewTenant: false,
            },
          });
          router.push('/users');
        },
        onError: showErrorToast,
      },
    );
  };

  return (
    <>
      <Typography
        variant="label-1"
        color="primary"
        sx={{ marginTop: 8, marginBottom: 3, textAlign: 'center' }}
      >
        {t('title')}
      </Typography>
      <ButtonGroup>
        {organizations.map(organization => (
          <button
            key={organization.id}
            onClick={handleClick(organization.id)}
            type="button"
          >
            {organization.name}
          </button>
        ))}
      </ButtonGroup>
    </>
  );
};

export default Data;
