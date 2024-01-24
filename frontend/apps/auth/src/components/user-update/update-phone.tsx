import { COUNTRIES } from '@onefootprint/global-constants';
import { checkIsPhoneValid, PhoneForm } from '@onefootprint/idv';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderProps } from '@/src/types';

type FormData = { phoneNumber: string };
type UpdatePhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  onSubmit: (props: string) => void;
};

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isSandbox = isTest || !isProd;
const handlePhoneValidation = (s: string) => checkIsPhoneValid(s, isSandbox);

const UpdatePhone = ({ children, Header, onSubmit }: UpdatePhoneProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const handleFormSubmit = (formData: FormData) => {
    onSubmit(formData.phoneNumber);
  };

  return (
    <>
      <Stack direction="column" gap={7}>
        <Header title={t('enter-phone')} />
        <PhoneForm
          defaultPhone={undefined}
          isLoading={false}
          onSubmit={handleFormSubmit}
          options={COUNTRIES}
          validator={handlePhoneValidation}
          texts={{
            cta: t('continue'),
            phoneInvalid: t('phone-step.form.input-invalid'),
            phoneLabel: t('phone-step.form.input-label'),
            phoneRequired: t('phone-step.form.input-required'),
          }}
        />
      </Stack>
      {children}
    </>
  );
};

export default UpdatePhone;
