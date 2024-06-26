import { CollectedKycDataOption, type OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { basicInformationFields, usResidentDisplayScopes } from 'src/pages/playbooks/utils/machine/types';
import styled, { css } from 'styled-components';

import Section from './components/section';

export type AuthorizedScopesProps = {
  playbook: OnboardingConfig;
};

const AuthorizedScopes = ({
  playbook: { allowUsResidents, allowInternationalResidents, canAccessData },
}: AuthorizedScopesProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.authorized-scopes',
  });
  const ssn =
    canAccessData.includes(CollectedKycDataOption.ssn9) || canAccessData.includes(CollectedKycDataOption.ssn4);
  const usLegalStatus = canAccessData.includes(CollectedKycDataOption.usLegalStatus);
  const idDoc = canAccessData.filter(scope => scope.includes('document'))?.length > 0;

  return (
    <Container>
      <Section displayScopes={basicInformationFields} canAccessData={canAccessData} title={t('basic-information')} />
      {(ssn || usLegalStatus || idDoc) && allowUsResidents && (
        <Section
          canAccessData={canAccessData}
          displayScopes={usResidentDisplayScopes}
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
