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
import { ScreenState, isCollectScreen } from './helpers';
import UpdateVerifyPhone from './update-verify-phone';

type UpdatePhoneProps = {
  actionKind: UpdateAuthMethodActionKind;
  authToken: string;
  Header: (props: HeaderProps) => JSX.Element;
  identifyVariant: IdentifyVariant;
  onSuccess: (newPhone: string) => void;
};

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isSandbox = isTest || !isProd;
const handlePhoneValidation = (s: string) => checkIsPhoneValid(s, isSandbox);

const getHeaderTitle = (t: TFunction<'identify'>, kind: UpdateAuthMethodActionKind): string =>
  kind === UpdateAuthMethodActionKind.replace // Maybe add some information that the company requires primary phone?
    ? t('phone-step.replace-title')
    : t('phone-step.add-primary-title');

const UpdatePhone = ({ Header, authToken, actionKind, onSuccess, identifyVariant }: UpdatePhoneProps) => {
  const { t } = useTranslation('identify');
  const [screen, setScreen] = useState<ScreenState>(ScreenState.collect);
  const [phone, setPhone] = useState<string>('');
  const l10n = useL10nContext();

  const handleOnSubmit = useCallback((phoneNumber: string) => {
    setPhone(phoneNumber);
    setScreen(ScreenState.verify);
  }, []);

  if (isCollectScreen(screen) || !phone) {
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
          cta: t('phone-step.verify-with-sms'),
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
        setScreen(ScreenState.collect);
      }}
    />
  );
};

export default UpdatePhone;
