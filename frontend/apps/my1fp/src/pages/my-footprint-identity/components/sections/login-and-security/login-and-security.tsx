import { useTranslation } from 'hooks';
import React from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';

import useGetUser, {
  GetUserResponse,
} from '../../../../../hooks/use-get-user/use-get-user';
import { UserIdentification } from '../../../../../hooks/use-session-user/use-session-user';
import UserBiometricsInfo from './components/user-biometrics-info/user-biometrics-info';
import VerifyEmail from './components/verify-email';

const LoginAndSecurity = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security',
  );

  const { session, updateMetadata } = useSessionUser();
  const handleUserQueryResult = (data: GetUserResponse) => {
    if (data) {
      updateMetadata(data);
    }
  };
  useGetUser({ onSuccess: handleUserQueryResult });

  if (!session) {
    return null;
  }

  const {
    data: { email, phoneNumber },
    metadata: { emails, phoneNumbers },
  } = session;

  // TODO: specifically return the phone number associated with id once we get it from BE
  const getPhoneNumberValue = () => phoneNumber;

  // TODO: specifically return the email address associated with id once we get it from BE
  const getEmailValue = () => email;

  return (
    <FieldGroup>
      {emails.map((e: UserIdentification) => (
        <EmailFieldContainer key={e.id}>
          <Field label={t('email.label')} value={getEmailValue()} />
          {!e.isVerified && <VerifyEmail email={e} />}
        </EmailFieldContainer>
      ))}
      {phoneNumbers.map((p: UserIdentification) => (
        <Field
          key={p.id}
          label={t('phone.label')}
          value={getPhoneNumberValue()}
        />
      ))}
      <UserBiometricsInfo />
    </FieldGroup>
  );
};

const EmailFieldContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default LoginAndSecurity;
