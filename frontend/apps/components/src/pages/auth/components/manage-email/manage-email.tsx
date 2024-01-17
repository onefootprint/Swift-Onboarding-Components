import { EmailForm } from '@onefootprint/idv';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderProps } from '../../types';

type ManagePhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const noop = () => undefined;

const ManageEmail = ({ children, Header }: ManagePhoneProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth',
  });

  return (
    <>
      <Stack direction="column" gap={7}>
        <Header title={t('enter-email')} />
        <EmailForm
          defaultEmail={undefined}
          isLoading={false}
          onSubmit={noop}
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

export default ManageEmail;
