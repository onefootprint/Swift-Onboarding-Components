import { useTranslation } from '@onefootprint/hooks';
import { LinkButton } from '@onefootprint/ui';
import React, { useState } from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';

const getFullName = (firstName: string | null, lastName: string | null) =>
  firstName && lastName ? `${firstName} ${lastName}` : '';

const Identity = () => {
  const { t } = useTranslation('pages.my-footprint-identity.identity');
  const { session } = useSessionUser();
  const [isSSNVisible, setSSNVisibility] = useState(false);
  if (!session) {
    return null;
  }
  const {
    data: { firstName, lastName, ssn, dob },
  } = session;

  const handleToggleSSN = () => {
    setSSNVisibility(!isSSNVisible);
  };

  const getSSN = () => {
    if (ssn) {
      return isSSNVisible ? ssn : '•••••••••';
    }
    return '-';
  };

  const fullName = getFullName(firstName, lastName);

  return (
    <FieldGroup>
      <Field label={t('name.label')} value={fullName} />
      <SSNFieldContainer>
        <Field label={t('ssn.label')} value={getSSN()} />
        {ssn && (
          <LinkButton onClick={handleToggleSSN} size="compact">
            {isSSNVisible ? t('ssn.toggle.hide') : t('ssn.toggle.show')}
          </LinkButton>
        )}
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
