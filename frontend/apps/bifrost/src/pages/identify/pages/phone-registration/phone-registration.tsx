import {
  HeaderTitle,
  NavigationHeader,
  useSignupChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoEmail24 } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import { Events } from 'src/utils/state-machine/identify/types';
import styled, { css } from 'styled-components';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import PhoneRegistrationForm from './components/phone-registration-form';

const PhoneRegistration = () => {
  const { t } = useTranslation('pages.phone-registration');
  const showRequestErrorToast = useRequestErrorToast();
  const [state, send] = useIdentifyMachine();
  const { email } = state.context;
  const signupChallengeMutation = useSignupChallenge();
  const { isLoading } = signupChallengeMutation;

  const handleChangeEmail = () => {
    send({ type: Events.emailChangeRequested });
  };

  const handleNavToPrevPage = () => {
    send({ type: Events.navigatedToPrevPage });
  };

  const handleSubmit = (formData: { phone: string }) => {
    const { phone } = formData;
    signupChallengeMutation.mutate(
      { phoneNumber: phone },
      {
        onSuccess({ challengeData }) {
          send({
            type: Events.phoneIdentificationCompleted,
            payload: {
              phone,
              userFound: false,
              challengeData,
            },
          });
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
          onClick: handleNavToPrevPage,
        }}
      />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
      {email && (
        <EmailCard>
          <EmailCardContent>
            <Box>
              <StyledIcoEmail24 />
            </Box>
            <Typography variant="label-3" color="primary" data-private>
              {email}
            </Typography>
          </EmailCardContent>
          <LinkButton size="compact" onClick={handleChangeEmail}>
            {t('email-card.cta')}
          </LinkButton>
        </EmailCard>
      )}
      <PhoneRegistrationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
};

const EmailCard = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[8]};
    padding: ${theme.spacing[5]};

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
    margin-right: ${theme.spacing[4]};
    position: relative;
    top: ${theme.spacing[1]};
  `}
`;

export default PhoneRegistration;
