import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedKycDataOption } from '@onefootprint/types';
import React from 'react';
import {
  basicInformationFields,
  usResidentDisplayScopes,
} from 'src/pages/playbooks/utils/machine/types';

import Section from './components/section';

export type AuthorizedScopesProps = {
  allowInternationalResidents: boolean;
  allowUsResidents: boolean;
  canAccessData: string[];
};

const AuthorizedScopes = ({
  allowUsResidents,
  allowInternationalResidents,
  canAccessData,
}: AuthorizedScopesProps) => {
  const { t } = useTranslation(
    'pages.playbooks.details.content.data-collection',
  );
  const ssn =
    canAccessData.includes(CollectedKycDataOption.ssn9) ||
    canAccessData.includes(CollectedKycDataOption.ssn4);
  const usLegalStatus = canAccessData.includes(
    CollectedKycDataOption.usLegalStatus,
  );
  const idDoc =
    canAccessData.filter(scope => scope.includes('document'))?.length > 0;

  return (
    <Container>
      <Section
        displayScopes={basicInformationFields}
        canAccessData={canAccessData}
        title={t('basic-information')}
      />
      {(ssn || usLegalStatus || idDoc) && allowUsResidents && (
        <Section
          displayScopes={usResidentDisplayScopes}
          canAccessData={canAccessData}
          title={t('us-residents')}
        />
      )}
      {allowInternationalResidents && (
        <Section
          displayScopes={usResidentDisplayScopes}
          canAccessData={canAccessData}
          title={t('non-us-residents')}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
  `}
`;

export default AuthorizedScopes;
