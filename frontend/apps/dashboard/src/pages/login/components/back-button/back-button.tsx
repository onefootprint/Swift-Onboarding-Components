import { IcoChevronLeft16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LinkButton } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';

const BackButton = () => {
  const router = useRouter();
  const handleClick = () => {
    router.back();
  };

  return (
    <Container>
      <LinkButton
        size="compact"
        iconComponent={IcoChevronLeft16}
        iconPosition="left"
        onClick={handleClick}
      >
        Back
      </LinkButton>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[9]};
    left: ${theme.spacing[9]};
  `}
`;

export default BackButton;
