import { HeaderTitle } from 'footprint-ui';
import { useRequestErrorToast, useTranslation } from 'hooks';
import IcoEmail24 from 'icons/ico/ico-email-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import NavigationHeader from 'src/components/navigation-header';
import useIdentify from 'src/pages/identify/hooks/use-identify';
import useIdentifyChallenge from 'src/pages/identify/hooks/use-identify-challenge';
import { ChallengeKind, Events } from 'src/utils/state-machine/identify/types';
import styled, { css } from 'styled-components';
import { Box, Button, LinkButton, PhoneInput, Typography } from 'ui';

import useIdentifyMachine from '../../hooks/use-identify-machine';

type FormData = {
  phone: string;
};

const PhoneRegistration = () => {
  const showRequestErrorToast = useRequestErrorToast();
  const [state, send] = useIdentifyMachine();
  const { t } = useTranslation('pages.phone-registration');
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const identifyMutation = useIdentify();
  const identifyChallengeMutation = useIdentifyChallenge();

  const handleChangeEmail = () => {
    send({ type: Events.emailChangeRequested });
  };

  const getNewPhoneChallenge = (phone: string, userFound: boolean) => {
    identifyChallengeMutation.mutate(
      { phoneNumber: phone },
      {
        onSuccess({ challengeToken }) {
          send({
            type: Events.phoneIdentificationCompleted,
            payload: {
              phone,
              userFound,
              challengeData: {
                challengeKind: ChallengeKind.sms,
                challengeToken,
              },
            },
          });
        },
        onError: showRequestErrorToast,
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
        identifyType: state.context.identifyType,
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess({ userFound, challengeData }) {
          // Need to manually initiate a challenge for this unrecognized number
          if (!userFound || !challengeData) {
            getNewPhoneChallenge(phone, userFound);
          } else {
            send({
              type: Events.phoneIdentificationCompleted,
              payload: {
                phone,
                userFound,
                challengeData,
              },
            });
          }
        },
        onError: showRequestErrorToast,
      },
    );
  };

  return (
    <>
      <NavigationHeader
        button={{
          variant: 'back',
          onClick: handleChangeEmail,
        }}
      />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
      <EmailCard>
        <EmailCardContent>
          <Box>
            <StyledIcoEmail24 />
          </Box>
          <Typography variant="label-3" color="primary">
            {state.context.email}
          </Typography>
        </EmailCardContent>
        <LinkButton size="compact" onClick={handleChangeEmail}>
          {t('email-card.cta')}
        </LinkButton>
      </EmailCard>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <PhoneInput
          hasError={!!errors.phone}
          hintText={errors.phone && t('form.phone-input.error')}
          label={t('form.phone-input.label')}
          placeholder={t('form.phone-input.placeholder')}
          onReset={() => {
            setValue('phone', '');
          }}
          {...register('phone', {
            required: true,
            pattern: /^(\+)?([ 0-9]){10,16}$/,
          })}
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
    </>
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
    border-radius: ${theme.borderRadius[2]}px;
    display: flex;
    gap: ${theme.spacing[4]}px;
    margin-bottom: ${theme.spacing[8]}px;
    padding: ${theme.spacing[5]}px;

    p {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `}
`;

const EmailCardContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
`;

const StyledIcoEmail24 = styled(IcoEmail24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[4]}px;
    position: relative;
    top: ${theme.spacing[1]}px;
  `}
`;

export default PhoneRegistration;
