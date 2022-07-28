import { useTranslation } from 'hooks';
import React from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';

import UserBiometricsInfo from './components/user-biometrics-info/user-biometrics-info';
import VerifyEmail from './components/verify-email';

const LoginAndSecurity = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security',
  );
  const { session } = useSessionUser();
  if (!session) {
    return null;
  }

  const {
    data: { email, phoneNumber },
    metadata: { emails },
  } = session;

  const shouldShowVerifyEmailButton =
    !emails.length || emails.some(e => !e.isVerified);

  // TODO: Add UI support for multiple emails and phone numbers (needs design
  // For now we just assume that there is exactly one email address
  // https://linear.app/footprint/issue/FP-740/support-multiple-user-emails-and-phone-numbers-in-my1fp
  return (
    <FieldGroup>
      <EmailFieldContainer>
        <Field label={t('email.label')} value={email} />
        {shouldShowVerifyEmailButton && <VerifyEmail email={emails[0]} />}
      </EmailFieldContainer>
      <Field label={t('phone.label')} value={phoneNumber} />{' '}
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
