import { Events } from '@src/types/bifrost-machine';
import { useTranslation } from 'hooks';
import IcoEmail24 from 'icons/ico/ico-email-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled';
import { Button, LinkButton, TextInput, Typography } from 'ui';

import useIdentifyPhone, {
  IdentifyPhoneRequest,
  IdentifyPhoneResponse,
} from './hooks/use-identify-phone';

type FormData = {
  phone: string;
};

const PhoneRegistration = () => {
  const [state, send] = useBifrostMachine();
  const { t } = useTranslation('pages.registration.phone-registration');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const identifyPhoneMutation = useIdentifyPhone();

  const handleChangeEmail = () => {
    send({ type: Events.changeEmail });
  };

  const onSubmit = (formData: FormData) => {
    const payload: IdentifyPhoneRequest = {
      phoneNumber: formData.phone,
    };
    identifyPhoneMutation.mutate(payload, {
      onSuccess({ challengeToken, phoneNumberLastTwo }: IdentifyPhoneResponse) {
        send({
          type: Events.phoneSubmitted,
          payload: {
            challengeToken,
            phoneNumberLastTwo,
          },
        });
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <EmailCard>
        <IcoEmail24 />
        <Typography variant="label-3" color="primary" sx={{ flexGrow: 1 }}>
          {state.context.registration.email}
        </Typography>
        <LinkButton size="tiny" onClick={handleChangeEmail}>
          {t('email-card.cta')}
        </LinkButton>
      </EmailCard>
      <TextInput
        hasError={!!errors.phone}
        hintText={errors.phone && t('form.phone-input.error')}
        label={t('form.phone-input.label')}
        placeholder={t('form.phone-input.placeholder')}
        {...register('phone', { required: true })}
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

const EmailCard = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[1]}px;
    display: flex;
    gap: ${theme.spacing[4]}px;
    padding: ${theme.spacing[5]}px;
  `}
`;

export default PhoneRegistration;
