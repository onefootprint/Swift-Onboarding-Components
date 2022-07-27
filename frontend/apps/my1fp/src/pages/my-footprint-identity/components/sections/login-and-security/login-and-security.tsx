import { useTranslation } from 'hooks';
import React from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';

import UserBiometricsInfo from './components/user-biometrics-info/user-biometrics-info';

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
  } = session;

  return (
    <FieldGroup>
      <Field label={t('email.label')} value={email} />
      <Field label={t('phone-number.label')} value={phoneNumber} />
      <UserBiometricsInfo />
    </FieldGroup>
  );
};

export default LoginAndSecurity;
