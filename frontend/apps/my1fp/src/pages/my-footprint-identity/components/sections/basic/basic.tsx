import { useTranslation } from 'hooks';
import React from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';

import VerifyEmail from './components/verify-email';

const getFullName = (firstName: string | null, lastName: string | null) =>
  firstName && lastName ? `${firstName} ${lastName}` : '';

const Basic = () => {
  const { t } = useTranslation('pages.my-footprint-identity.basic');
  const { data } = useSessionUser();
  if (!data) {
    return null;
  }

  const { firstName, lastName, email, phoneNumber, isEmailVerified } = data;
  const fullName = getFullName(firstName, lastName);
  const shouldShowVerifyEmailButton = !isEmailVerified;

  return (
    <FieldGroup>
      <Field label={t('name.label')} value={fullName} />
      <EmailFieldContainer>
        <Field label={t('email.label')} value={email} />
        {shouldShowVerifyEmailButton && <VerifyEmail />}
      </EmailFieldContainer>
      <Field label={t('phone.label')} value={phoneNumber} />
    </FieldGroup>
  );
};

const EmailFieldContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default Basic;
