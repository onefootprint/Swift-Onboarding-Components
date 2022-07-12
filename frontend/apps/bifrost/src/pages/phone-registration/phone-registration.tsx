import { useRequestErrorToast, useTranslation } from 'hooks';
import IcoEmail24 from 'icons/ico/ico-email-24';
import React from 'react';
import { useForm } from 'react-hook-form';
import HeaderTitle from 'src/components/header-title';
import NavigationHeader from 'src/components/navigation-header';
import useIdentify from 'src/hooks/identify/use-identify';
import useIdentifyChallenge from 'src/hooks/identify/use-identify-challenge';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import { ChallengeKind } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Box, Button, LinkButton, PhoneInput, Typography } from 'ui';

type FormData = {
  phone: string;
};

const PhoneRegistration = () => {
  const showRequestErrorToast = useRequestErrorToast();
  const [state, send] = useBifrostMachine();
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

  const sendSmsChallenge = (phoneNumber: string, userFound: boolean) => {
    identifyChallengeMutation.mutate(
      {
        phoneNumber,
      },
      {
        onSuccess({ challengeToken }) {
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
          sendSmsChallenge(phone, userFound);
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
