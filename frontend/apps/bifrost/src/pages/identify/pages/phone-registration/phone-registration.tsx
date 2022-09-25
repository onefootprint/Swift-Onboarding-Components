import { ChallengeKind } from '@onefootprint/types';
import { HeaderTitle, NavigationHeader } from 'footprint-elements';
import { useRequestErrorToast, useTranslation } from 'hooks';
import { IcoEmail24 } from 'icons';
import React from 'react';
import useIdentify from 'src/pages/identify/hooks/use-identify';
import useIdentifyChallenge from 'src/pages/identify/hooks/use-identify-challenge';
import { Events } from 'src/utils/state-machine/identify/types';
import styled, { css } from 'styled-components';
import { Box, LinkButton, Typography } from 'ui';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import PhoneRegistrationForm from './components/phone-registration-form';

const PhoneRegistration = () => {
  const showRequestErrorToast = useRequestErrorToast();
  const [state, send] = useIdentifyMachine();
  const { t } = useTranslation('pages.phone-registration');

  const identifyMutation = useIdentify();
  const identifyChallengeMutation = useIdentifyChallenge();

  const handleChangeEmail = () => {
    send({ type: Events.emailChangeRequested });
  };

  const getNewPhoneChallenge = (phone: string, userFound: boolean) => {
    const { identifyType } = state.context;
    identifyChallengeMutation.mutate(
      { phoneNumber: phone, identifyType },
      {
        onSuccess({ challengeToken, retryDisabledUntil }) {
          send({
            type: Events.phoneIdentificationCompleted,
            payload: {
              phone,
              userFound,
              challengeData: {
                challengeKind: ChallengeKind.sms,
                challengeToken,
                retryDisabledUntil,
              },
            },
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleSubmit = (formData: { phone: string }) => {
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
      <PhoneRegistrationForm
        onSubmit={handleSubmit}
        isLoading={
          identifyMutation.isLoading || identifyChallengeMutation.isLoading
        }
      />
    </>
  );
};

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
