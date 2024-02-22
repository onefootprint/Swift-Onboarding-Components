import { useRequestErrorToast } from '@onefootprint/hooks';
import type { GetAuthRolesOrg } from '@onefootprint/types';
import { Tooltip, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';
import useAssumeAuthRole from 'src/hooks/use-assume-auth-role';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

import ButtonGroup from '../button-group';

type DataProps = {
  authToken: string;
  organizations: GetAuthRolesOrg[];
};

const Data = ({ authToken, organizations }: DataProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.organizations' });
  const { logIn } = useSession();
  const router = useRouter();
  const assumeRoleMutation = useAssumeAuthRole();
  const showErrorToast = useRequestErrorToast();

  const handleClick = (tenantId: string) => () => {
    assumeRoleMutation.mutate(
      { tenantId, authToken },
      {
        async onSuccess() {
          await logIn({ auth: authToken });
          router.push(DEFAULT_PUBLIC_ROUTE);
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
          <Tooltip
            key={organization.id}
            text={t('errors.auth-method-not-supported', {
              orgName: organization.name,
            })}
            position="right"
            disabled={organization.isAuthMethodSupported}
          >
            <EllipsisButton
              disabled={!organization.isAuthMethodSupported}
              onClick={handleClick(organization.id)}
              type="button"
            >
              {organization.name}
            </EllipsisButton>
          </Tooltip>
        ))}
      </ButtonGroup>
    </>
  );
};

const EllipsisButton = styled.button`
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default Data;
