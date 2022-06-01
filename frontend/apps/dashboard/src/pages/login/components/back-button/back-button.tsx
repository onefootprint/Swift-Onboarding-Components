import IcoChevronLeft16 from 'icons/ico/ico-chevron-left-16';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled';
import { LinkButton } from 'ui';

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
    top: ${theme.spacing[9]}px;
    left: ${theme.spacing[9]}px;
  `}
`;

export default BackButton;
