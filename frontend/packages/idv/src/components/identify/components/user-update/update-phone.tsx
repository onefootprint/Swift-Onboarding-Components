import { COUNTRIES } from '@onefootprint/global-constants';
import type { TFunction } from 'i18next';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsPhoneValid } from '../../../../utils';
import { useL10nContext } from '../../../l10n-provider';
import type { IdentifyVariant } from '../../state/types';
import type { HeaderProps } from '../../types';
import { UpdateAuthMethodActionKind } from '../../types';
import PhonePageStructure from '../phone-page-structure';
import UpdateVerifyPhone from './update-verify-phone';

type UpdatePhoneProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  actionKind: UpdateAuthMethodActionKind;
  identifyVariant: IdentifyVariant;
  onSuccess: (newPhone: string) => void;
};

enum Screen {
  collect = 'collect',
  verify = 'verify',
}

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isSandbox = isTest || !isProd;
const handlePhoneValidation = (s: string) => checkIsPhoneValid(s, isSandbox);

const getHeaderTitle = (
  t: TFunction<'identify'>,
  kind: UpdateAuthMethodActionKind,
): string =>
  kind === UpdateAuthMethodActionKind.replace // Maybe add some information that the company requires primary phone?
    ? t('phone-step.replace-title')
    : t('phone-step.add-primary-title');

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
  const l10n = useL10nContext();

  const handleOnSubmit = useCallback((phoneNumber: string) => {
    setPhone(phoneNumber);
    setScreen(Screen.verify);
  }, []);

  if (screen === Screen.collect || !phone) {
    return (
      <PhonePageStructure
        countries={COUNTRIES}
        defaultPhone={phone}
        Header={Header}
        isLoading={false}
        l10n={l10n}
        onSubmit={handleOnSubmit}
        phoneValidator={handlePhoneValidation}
        texts={{
          headerTitle: getHeaderTitle(t, actionKind),
          headerSubtitle: t('phone-step.subtitle'),
          cta: t('continue'),
          phoneInvalid: t('phone-step.form.input-invalid'),
          phoneLabel: t('phone-number'),
          phoneRequired: t('phone-step.form.input-required'),
        }}
      />
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
