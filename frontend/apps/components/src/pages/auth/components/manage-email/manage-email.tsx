import { useTranslation } from '@onefootprint/hooks';
import { EmailForm } from '@onefootprint/idv-elements';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import type { HeaderProps } from '../../types';

type ManagePhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const noop = () => undefined;

const ManageEmail = ({ children, Header }: ManagePhoneProps) => {
  const { t } = useTranslation('pages.auth');

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
