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
  docScanForOptionalSsn?: string;
};

const AuthorizedScopes = ({
  allowUsResidents,
  allowInternationalResidents,
  canAccessData,
  docScanForOptionalSsn,
}: AuthorizedScopesProps) => {
  const { t } = useTranslation('pages.playbooks.details.authorized-scopes');
  const ssn =
    canAccessData.includes(CollectedKycDataOption.ssn9) ||
    canAccessData.includes(CollectedKycDataOption.ssn4);
  const usLegalStatus = canAccessData.includes(
    CollectedKycDataOption.usLegalStatus,
  );
  const idDoc =
    !!docScanForOptionalSsn ||
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
          canAccessData={canAccessData}
          displayScopes={usResidentDisplayScopes}
          docScanForOptionalSsn={docScanForOptionalSsn}
          title={t('us-residents.title')}
        />
      )}
      {allowInternationalResidents && (
        <Section
          canAccessData={['document.passport.require_selfie']}
          displayScopes={['document', 'selfie']}
          title={t('non-us-residents.title')}
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
