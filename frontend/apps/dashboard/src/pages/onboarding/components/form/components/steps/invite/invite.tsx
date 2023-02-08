import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import useRoles from 'src/hooks/use-roles';
import styled, { css } from 'styled-components';

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
  const rolesQuery = useRoles();

  return (
    <Container>
      <>
        <Header title={t('title')} subtitle={t('subtitle')} />
        {rolesQuery.isLoading && <Loading />}
        {rolesQuery.data && (
          <Content
            defaultRole={rolesQuery.options[0]}
            id={id}
            onComplete={onComplete}
            roles={rolesQuery.options}
          />
        )}
        {rolesQuery.error && <Error error={rolesQuery.error} />}
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
