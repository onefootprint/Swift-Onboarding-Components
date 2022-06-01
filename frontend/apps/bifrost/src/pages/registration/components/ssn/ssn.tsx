import { useInputMask, useTranslation } from 'hooks';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoLock24 from 'icons/ico/ico-lock-24';
import IcoShield24 from 'icons/ico/ico-shield-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Events, UserData, UserDataAttribute } from 'src/bifrost-machine/types';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/bifrost/use-bifrost-machine';
import styled, { css } from 'styled';
import { Button, TextInput } from 'ui';

import useSyncData from '../../hooks/use-sync-data';
import Disclaimer from './components/disclaimer';

type FormData = Required<Pick<UserData, UserDataAttribute.ssn>>;

const SSN = () => {
  const inputMasks = useInputMask('en');
  const [, send] = useBifrostMachine();
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
      <Header title={t('title')} subtitle={t('subtitle')} />
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
