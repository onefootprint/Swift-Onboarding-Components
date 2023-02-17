import { useTranslation } from '@onefootprint/hooks';
import { Button, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type LoginWithDifferentAccountProps = {
  showMissingPhoneLabel?: boolean;
  onClick: () => void;
};

const LoginWithDifferentAccount = ({
  showMissingPhoneLabel,
  onClick,
}: LoginWithDifferentAccountProps) => {
  const { t } = useTranslation('components.login-with-different-account');

  return (
    <Container>
      <Divider />
      <ButtonContainer>
        {showMissingPhoneLabel && (
          <Typography
            variant="caption-2"
            color="tertiary"
            sx={{ textAlign: 'center' }}
          >
            {t('missing-phone')}
          </Typography>
        )}
        <Button fullWidth onClick={onClick} variant="secondary" sx={{}}>
          {t('cta')}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};
  `}
`;

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

export default LoginWithDifferentAccount;
