import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { Organization } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
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
        async onSuccess() {
          await logIn({ auth: authToken });
          router.push('/users');
        },
        onError: showErrorToast,
      },
    );
  };

  useEffect(() => {
    if (organizations.length === 1) {
      // If this user only belongs to one org, automatically log in
      handleClick(organizations[0].id)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, organizations]);

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
