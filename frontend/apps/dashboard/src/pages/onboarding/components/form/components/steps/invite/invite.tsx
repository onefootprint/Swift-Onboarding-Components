import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleKind } from '@onefootprint/types';
import React from 'react';
import useOrg from 'src/hooks/use-org';
import useRoles from 'src/hooks/use-roles';

import Header from '../header';
import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

export type InviteProps = {
  id: string;
  onComplete: () => void;
};

const Invite = ({ id, onComplete }: InviteProps) => {
  const { t } = useTranslation('pages.onboarding.invite');
  const rolesQuery = useRoles(RoleKind.dashboardUser);
  const orgQuery = useOrg();

  return (
    <Container>
      <>
        <Header title={t('title')} subtitle={t('subtitle')} />
        {(rolesQuery.isLoading || orgQuery.isLoading) && <Loading />}
        {rolesQuery.data && orgQuery.data && (
          <Content
            defaultRole={rolesQuery.options[0]}
            org={orgQuery.data}
            id={id}
            onComplete={onComplete}
            roles={rolesQuery.options}
          />
        )}
        {(rolesQuery.error || orgQuery.error) && (
          <Error error={rolesQuery.error || orgQuery.error} />
        )}
      </>
    </Container>
  );
};

const Container = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} ${theme.spacing[7]} ${theme.spacing[7]};
  `}
`;

export default Invite;
