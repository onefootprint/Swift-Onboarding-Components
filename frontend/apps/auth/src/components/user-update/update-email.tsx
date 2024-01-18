import { useTranslation } from '@onefootprint/hooks';
import { EmailForm } from '@onefootprint/idv';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import type { HeaderProps } from '@/src/types';

type ManagePhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  onSubmit: (props: string) => void;
};

const UpdateEmail = ({ children, Header, onSubmit }: ManagePhoneProps) => {
  const { t } = useTranslation('auth');

  const handleFormSubmit = (formData: { email: string }) => {
    onSubmit(formData.email);
  };

  return (
    <>
      <Stack direction="column" gap={7}>
        <Header title={t('enter-email')} />
        <EmailForm
          defaultEmail={undefined}
          isLoading={false}
          onSubmit={handleFormSubmit}
          texts={{
            cta: t('continue'),
            emailIsRequired: t('email-step.form.input-required'),
            emailLabel: t('email-step.form.input-label'),
            emailPlaceholder: t('email-step.form.input-placeholder'),
          }}
        />
      </Stack>
      {children}
    </>
  );
};

export default UpdateEmail;
