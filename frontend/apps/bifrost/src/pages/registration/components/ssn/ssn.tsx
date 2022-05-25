import { useTranslation } from 'hooks';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoLock24 from 'icons/ico/ico-lock-24';
import IcoShield24 from 'icons/ico/ico-shield-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Events } from 'src/bifrost-machine/types';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled';
import { Button, TextInput } from 'ui';

import useUserData, { UserDataRequest } from '../../hooks/use-user-data';
import Disclaimer from './components/disclaimer';

type FormData = {
  ssn: string;
};

const SSN = () => {
  const [state, send] = useBifrostMachine();
  const userDataMutation = useUserData();
  const { t } = useTranslation('pages.registration.ssn');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    // SSN is the last step in the registration, go ahead and send the data
    const {
      firstName,
      lastName,
      dob,
      email,
      streetAddress,
      streetAddress2,
      city,
      state: residentialState,
      country,
      zipCode,
    } = state.context.registration.data;

    const { authToken } = state.context;
    if (!authToken) {
      return;
    }

    const request: UserDataRequest = {
      data: {
        ssn: formData.ssn,
        firstName,
        lastName,
        dob,
        email,
        streetAddress,
        streetAddress2,
        city,
        state: residentialState,
        country,
        zipCode,
      },
      authToken,
    };

    userDataMutation.mutate(request, {
      onSuccess() {
        send({
          type: Events.ssnSubmitted,
          payload: {
            ssn: formData.ssn,
          },
        });
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <TextInput
        hasError={!!errors.ssn}
        hintText={errors.ssn && t('form.ssn.error')}
        label={t('form.ssn.label')}
        placeholder={t('form.ssn.placeholder')}
        {...register('ssn', { required: true })}
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
