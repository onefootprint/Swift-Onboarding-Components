import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import useOrg from 'src/hooks/use-org';
import styled, { css } from 'styled-components';

import Header from '../header';
import Error from './components/error';
import Form from './components/form';
import Loading from './components/loading';

export type CompanyDataProps = {
  id: string;
  onComplete: () => void;
};

const CompanyData = ({ id, onComplete }: CompanyDataProps) => {
  const orgQuery = useOrg();
  const { t } = useTranslation('pages.onboarding.company-data');

  return (
    <Container>
      <>
        <Header title={t('title')} subtitle={t('subtitle')} />
        {orgQuery.isLoading && <Loading />}
        {orgQuery.data && (
          <Form id={id} onComplete={onComplete} organization={orgQuery.data} />
        )}
        {orgQuery.error && <Error error={orgQuery.error} />}
      </>
    </Container>
  );
};

const Container = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} ${theme.spacing[7]} ${theme.spacing[7]};
  `}
`;

export default CompanyData;
