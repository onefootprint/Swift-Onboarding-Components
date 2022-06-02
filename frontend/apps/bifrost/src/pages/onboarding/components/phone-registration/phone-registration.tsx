import { useTranslation } from 'hooks';
import IcoEmail24 from 'icons/ico/ico-email-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ChallengeKind, Events } from 'src/bifrost-machine/types';
import HeaderTitle from 'src/components/header-title';
import useBifrostMachine from 'src/hooks/bifrost/use-bifrost-machine';
import useIdentify from 'src/hooks/identify/use-identify';
import useIdentifyChallenge, {
  IdentifyChallengeResponse,
} from 'src/hooks/identify/use-identify-challenge';
import styled, { css } from 'styled';
import { Button, LinkButton, TextInput, Typography } from 'ui';

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
  const identifyMutation = useIdentify();
  const identifyChallengeMutation = useIdentifyChallenge();

  const handleChangeEmail = () => {
    send({ type: Events.emailChangeRequested });
  };

  const sendSmsChallenge = (phoneNumber: string, userFound: boolean) => {
    identifyChallengeMutation.mutate(
      {
        phoneNumber,
      },
      {
        onSuccess({ challengeToken }: IdentifyChallengeResponse) {
          send({
            type: Events.userIdentifiedByPhone,
            payload: {
              phone: phoneNumber,
              userFound,
              challengeData: {
                challengeKind: ChallengeKind.sms,
                challengeToken,
              },
            },
          });
        },
      },
    );
  };

  const onSubmit = (formData: FormData) => {
    const { phone } = formData;
    // When onboarding a new user, always ask for an SMS challenge, we will register
    // biometrics in another step if needed
    identifyMutation.mutate(
      {
        identifier: { phoneNumber: phone },
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess({ userFound, challengeData }) {
          // userFound=true when we found an account associated with this phone
          // even though we didn't recognize the email in the email-identification page
          if (userFound && challengeData) {
            send({
              type: Events.userIdentifiedByPhone,
              payload: {
                phone,
                userFound,
                challengeData,
              },
            });
          }
          // If this is a new user/phone, send an SMS challenge
          sendSmsChallenge(phone, userFound);
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <EmailCard>
        <IcoEmail24 />
        <Typography variant="label-3" color="primary" sx={{ flexGrow: 1 }}>
          {state.context.email}
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
      <Button
        type="submit"
        fullWidth
        loading={
          identifyMutation.isLoading || identifyChallengeMutation.isLoading
        }
      >
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
