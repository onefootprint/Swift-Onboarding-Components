import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { checkIsPhoneValid, PhoneForm } from '@onefootprint/idv';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import type { HeaderProps } from '../../types';

type ManagePhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const isLive = false;
const handlePhoneValidation = (s: string) => checkIsPhoneValid(s, !isLive);
const noop = () => undefined;

const ManagePhone = ({ children, Header }: ManagePhoneProps) => {
  const { t } = useTranslation('pages.auth');

  return (
    <>
      <Stack direction="column" gap={7}>
        <Header title={t('enter-phone')} />
        <PhoneForm
          defaultPhone={undefined}
          isLoading={false}
          onSubmit={noop}
          options={COUNTRIES}
          validator={handlePhoneValidation}
          texts={{
            cta: t('continue'),
            phoneInvalid: t('email-step.form.input-invalid'),
            phoneLabel: t('email-step.form.input-label'),
            phoneRequired: t('email-step.form.input-required'),
          }}
        />
      </Stack>
      {children}
    </>
  );
};

export default ManagePhone;
