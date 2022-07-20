import { useTranslation } from 'hooks';
import React from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';

import ToggleSSN from './components/toggle-ssn';

const Identity = () => {
  const { t } = useTranslation('pages.my-footprint-identity.identity');
  const { session } = useSessionUser();
  if (!session) {
    return null;
  }

  const {
    data: { ssn, dob },
    metadata: { wasLoggedUsingBiometrics, hasSSNFilled },
  } = session;
  const ssnValue = ssn || '•••••••••';
  const shouldShowSSNToggle = wasLoggedUsingBiometrics && hasSSNFilled;

  return (
    <FieldGroup>
      <SSNFieldContainer>
        <Field
          label={t('ssn.label')}
          value={hasSSNFilled ? ssnValue : undefined}
        />
        {shouldShowSSNToggle && <ToggleSSN />}
      </SSNFieldContainer>
      <Field label={t('dob.label')} value={dob} />
    </FieldGroup>
  );
};

const SSNFieldContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default Identity;
