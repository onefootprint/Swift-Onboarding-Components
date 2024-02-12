import { EmailForm } from '@onefootprint/idv';
import { Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderProps } from '../../types';
import UpdateVerifyEmail from './update-verify-email';

type UpdateEmailProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  onSuccess: (newEmail: string) => void;
};

const UpdateEmail = ({ Header, authToken, onSuccess }: UpdateEmailProps) => {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState<string>('');

  if (!email) {
    return (
      <Stack direction="column" gap={7}>
        <Header title={t('enter-email')} />
        <EmailForm
          defaultEmail={undefined}
          isLoading={false}
          onSubmit={({ email: newEmail }) => setEmail(newEmail)}
          texts={{
            cta: t('continue'),
            emailIsRequired: t('email-step.form.input-required'),
            emailLabel: t('email'),
            emailPlaceholder: t('email-step.form.input-placeholder'),
          }}
        />
      </Stack>
    );
  }
  return (
    <UpdateVerifyEmail
      Header={Header}
      email={email}
      authToken={authToken}
      onSuccess={onSuccess}
    />
  );
};

export default UpdateEmail;
