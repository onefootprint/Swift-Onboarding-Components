import { IcoChevronLeft16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

const BackButton = () => {
  const router = useRouter();
  const handleClick = () => {
    router.back();
  };

  return (
    <Container>
      <LinkButton iconComponent={IcoChevronLeft16} iconPosition="left" onClick={handleClick}>
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
