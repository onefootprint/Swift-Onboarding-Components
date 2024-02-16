import { COUNTRIES } from '@onefootprint/global-constants';
import { Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsPhoneValid } from '../../../../utils';
import PhoneForm from '../../../phone-form';
import { ActionKind } from '../../queries/use-user-challenge';
import type { IdentifyVariant } from '../../state/types';
import type { HeaderProps } from '../../types';
import UpdateVerifyPhone from './update-verify-phone';

type UpdatePhoneProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  actionKind: ActionKind;
  identifyVariant: IdentifyVariant;
  onSuccess: (newPhone: string) => void;
};

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isSandbox = isTest || !isProd;
const handlePhoneValidation = (s: string) => checkIsPhoneValid(s, isSandbox);

enum Screen {
  collect,
  verify,
}

const UpdatePhone = ({
  Header,
  authToken,
  actionKind,
  onSuccess,
  identifyVariant,
}: UpdatePhoneProps) => {
  const { t } = useTranslation('identify');
  const [screen, setScreen] = useState<Screen>(Screen.collect);
  const [phone, setPhone] = useState<string>('');

  const actionKindToHeader: Record<ActionKind, string> = {
    // Maybe add some information that the company requires primary phone?
    [ActionKind.addPrimary]: t('phone-step.add-primary-title'),
    [ActionKind.replace]: t('phone-step.replace-title'),
  };
  const title = actionKindToHeader[actionKind];

  if (screen === Screen.collect || !phone) {
    return (
      <Stack direction="column" gap={7}>
        <Header title={title} subtitle={t('phone-step.subtitle')} />
        <PhoneForm
          defaultPhone={phone}
          isLoading={false}
          onSubmit={({ phoneNumber }) => {
            setPhone(phoneNumber);
            setScreen(Screen.verify);
          }}
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
      actionKind={actionKind}
      identifyVariant={identifyVariant}
      onChallengeVerificationSuccess={() => onSuccess(phone)}
      onBack={() => {
        setScreen(Screen.collect);
      }}
    />
  );
};

export default UpdatePhone;
