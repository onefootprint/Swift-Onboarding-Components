import { COUNTRIES } from '@onefootprint/global-constants';
import { Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsPhoneValid } from '../../../../utils';
import PhoneForm from '../../../phone-form';
import type { HeaderProps } from '../../types';
import UpdateVerifyPhone from './update-verify-phone';

type UpdatePhoneProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  onSuccess: (newPhone: string) => void;
};

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isSandbox = isTest || !isProd;
const handlePhoneValidation = (s: string) => checkIsPhoneValid(s, isSandbox);

const UpdatePhone = ({ Header, authToken, onSuccess }: UpdatePhoneProps) => {
  const { t } = useTranslation('identify');
  const [phone, setPhone] = useState<string>('');

  if (!phone) {
    return (
      <Stack direction="column" gap={7}>
        <Header title={t('enter-phone')} />
        <PhoneForm
          defaultPhone={undefined}
          isLoading={false}
          onSubmit={({ phoneNumber }) => setPhone(phoneNumber)}
          options={COUNTRIES}
          validator={handlePhoneValidation}
          texts={{
            cta: t('continue'),
            phoneInvalid: t('phone-step.form.input-invalid'),
            phoneLabel: t('phone-number'),
            phoneRequired: t('phone-step.form.input-required'),
          }}
        />
      </Stack>
    );
  }
  return (
    <UpdateVerifyPhone
      Header={Header}
      phoneNumber={phone}
      authToken={authToken}
      onSuccess={onSuccess}
    />
  );
};

export default UpdatePhone;
