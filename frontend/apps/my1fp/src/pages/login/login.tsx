import footprint from 'footprint';
import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { FootprintButton, FootprintLogo, LinkButton, Typography } from 'ui';

// TODO: Remove public key
footprint.init({ publicKey: 'ob_config_pk_fKWziZsm0tB847ujvMlYT6' });

const Login = () => {
  const { t } = useTranslation('pages.login');
  const handleClick = async () => {
    await footprint.show();
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
