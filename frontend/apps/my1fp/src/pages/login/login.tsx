import footprint from 'footprint';
import { useTranslation } from 'hooks';
import { useRouter } from 'next/router';
import React from 'react';
import { getErrorMessage, RequestError } from 'request';
import styled, { css } from 'styled-components';
import {
  FootprintButton,
  FootprintLogo,
  LinkButton,
  Typography,
  useToast,
} from 'ui';

import useUserSession from '../../hooks/use-session-user';
import useUserDecrypt, {
  UserDecryptResponse,
} from '../../hooks/use-user-decrypt';
import attributes from './login.constants';

const Login = () => {
  const router = useRouter();
  const toast = useToast();
  const userMutation = useUserDecrypt();
  const { logIn } = useUserSession();
  const { t } = useTranslation('pages.login');

  const saveInSessionAndGoToHome = (
    authToken: string,
    response: UserDecryptResponse,
  ) => {
    logIn({
      data: {
        firstName: response.firstName,
        lastName: response.lastName,
        dob: response.dob,
        email: response.email,
        phoneNumber: response.phoneNumber,
        streetAddress: response.streetAddress,
        streetAddress2: response.streetAddress2,
        city: response.city,
        state: response.state,
        country: response.country,
        zip: response.zip,
      },
      biometric: {},
      metadata: {},
      authToken,
    });
    router.push('/');
  };

  const handleClick = () => {
    footprint.show({
      onAuthenticated: (authToken: string) => {
        userMutation.mutate(
          { authToken, attributes },
          {
            onSuccess(data) {
              saveInSessionAndGoToHome(authToken, data);
            },
            onError: (error: RequestError) => {
              toast.show({
                description: getErrorMessage(error),
                title: 'Uh-oh!',
                variant: 'error',
              });
            },
          },
        );
      },
    });
  };

  return (
    <Container>
      <FootprintLogo />
      <Inner>
        <Typography variant="label-1" color="primary" sx={{ marginY: 8 }}>
          {t('instructions')}
        </Typography>
        <FootprintButton
          fullWidth
          onClick={handleClick}
          text="Continue with Footprint"
          loading={userMutation.isLoading}
        />
        <TextContainer>
          <Typography variant="caption-2" color="tertiary">
            {t('footer.by-continuing')}
          </Typography>
          <LinkButton
            size="xxTiny"
            href="https://www.onefootprint.com/terms-of-service"
            target="_blank"
          >
            {t('footer.terms-of-service')}
          </LinkButton>
          <Typography variant="caption-2" color="tertiary">
            {t('footer.and')}
          </Typography>
          <LinkButton
            size="xxTiny"
            href="https://www.onefootprint.com/privacy-policy"
            target="_blank"
          >
            {t('footer.privacy-policy')}
          </LinkButton>
        </TextContainer>
      </Inner>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
`;

const Inner = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]}px;
    text-align: center;

    > * {
      display: inline;
      margin-right: ${theme.spacing[2]}px;
    }
  `}
`;

export default Login;
