import { AuthorizedOrg } from '@onefootprint/types';
import { useTranslation } from 'hooks';
import React from 'react';
import styled from 'styled-components';
import { LoadingIndicator, Typography } from 'ui';

import VerifiedAccountCard from './components/verified-account-card';
import useGetAuthorizedOrgs from './hooks/use-authorized-orgs';

const AccountsVerified = () => {
  const { t } = useTranslation('pages.my-footprint-identity.access-logs');
  const authorizedOrgsQuery = useGetAuthorizedOrgs();
  const { data } = authorizedOrgsQuery;

  if (authorizedOrgsQuery.isLoading) {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }

  if (!data?.length) {
    return <Typography variant="body-3">{t('empty')}</Typography>;
  }

  return (
    <Container>
      {data.map((org: AuthorizedOrg) => (
        <VerifiedAccountCard org={org} key={org.id} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export default AccountsVerified;
