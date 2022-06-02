import React, { useState } from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled';
import { Button } from 'ui';

const LivenessCheck = () => {
  const [retryCount, setRetryCount] = useState<number>(0);

  const handleClick = () => {
    // TODO: launch biometric check. If liveness check fails, increment the retry count
    setRetryCount(retryCount + 1);
  };

  const copies = {
    firstAttempt: {
      headerTitle: 'Liveness check',
      headerSubtitle: "We need to verify that you're a real person.",
      buttonLabel: 'Launch Face ID',
    },
    retry: {
      headerTitle: 'Face not recognized',
      headerSubtitle:
        'We were not able to recognize your face. Please try again.',
      buttonLabel: 'Try Face ID again',
    },
  };
  const { headerTitle, headerSubtitle, buttonLabel } =
    retryCount === 0 ? copies.firstAttempt : copies.retry;

  return (
    <Container>
      <HeaderTitle title={headerTitle} subtitle={headerSubtitle} />
      <Button onClick={handleClick} fullWidth>
        {buttonLabel}
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default LivenessCheck;
