import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40, IcoFaceid24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';

export type VerificationProps = {
  isWaiting?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  isRetry?: boolean;
  onComplete: () => void;
};

const Verification = ({
  isWaiting,
  isLoading,
  isSuccess,
  isRetry,
  onComplete,
}: VerificationProps) => {
  const { t } = useTranslation(
    'components.login-challenge.biometric.verification',
  );
  const hasCta = !isWaiting && !isSuccess;

  if (isSuccess) {
    return (
      <Container>
        <SuccessContainer>
          <IcoCheckCircle40 color="success" />
          <Typography variant="label-3" color="success">
            {t('success')}
          </Typography>
        </SuccessContainer>
      </Container>
    );
  }

  return (
    <Container>
      <IconContainer>
        {/* TODO: https://linear.app/footprint/issue/FP-2910 */}
        <IcoFaceid24 />
      </IconContainer>
      {isWaiting && (
        <Typography
          variant="label-3"
          color="secondary"
          sx={{ marginBottom: 6 }}
        >
          {t('loading')}
        </Typography>
      )}
      {hasCta && (
        <Button onClick={onComplete} size="compact" loading={isLoading}>
          {isRetry ? t('cta-retry') : t('cta')}
        </Button>
      )}
    </Container>
  );
};

const SuccessContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    align-items: center;
    margin: ${theme.spacing[5]} 0;
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    box-shadow: ${theme.elevation[1]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[7]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
  `}
`;

export default Verification;
