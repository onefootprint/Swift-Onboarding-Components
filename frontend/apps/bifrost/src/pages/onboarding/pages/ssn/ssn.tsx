import { useInputMask, useTranslation } from 'hooks';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoLock24 from 'icons/ico/ico-lock-24';
import IcoShield24 from 'icons/ico/ico-shield-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import HeaderTitle from 'src/components/header-title';
import { Events } from 'src/utils/state-machine/onboarding';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, TextInput } from 'ui';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import useSyncData from '../../hooks/use-sync-data';
import Disclaimer from './components/disclaimer';

type FormData = Required<Pick<UserData, UserDataAttribute.ssn>>;

const SSN = () => {
  const inputMasks = useInputMask('en');
  const [, send] = useOnboardingMachine();
  const syncDataMutation = useSyncData();
  const { t } = useTranslation('pages.registration.ssn');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    const ssn: UserData = {
      ssn: formData.ssn,
    };
    send({
      type: Events.ssnSubmitted,
      payload: {
        ssn: formData.ssn,
      },
    });
    syncDataMutation(ssn);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <TextInput
        hasError={!!errors.ssn}
        hintText={errors.ssn && t('form.ssn.error')}
        label={t('form.ssn.label')}
        mask={inputMasks.ssn}
        placeholder={t('form.ssn.placeholder')}
        type="tel"
        {...register('ssn', { required: true, maxLength: 11 })}
      />
      <Disclaimer
        items={[
          {
            title: t('disclaimer.security.title'),
            description: t('disclaimer.security.description'),
            Icon: IcoShield24,
          },
          {
            title: t('disclaimer.privacy.title'),
            description: t('disclaimer.privacy.description'),
            Icon: IcoLock24,
          },
          {
            title: t('disclaimer.credit-score.title'),
            description: t('disclaimer.credit-score.description'),
            Icon: IcoFileText24,
          },
        ]}
      />
      <Button type="submit" fullWidth>
        {t('form.cta')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default SSN;
