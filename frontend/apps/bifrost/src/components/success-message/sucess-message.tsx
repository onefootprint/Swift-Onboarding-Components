import { useFootprintJs } from 'footprint-provider';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled-components';
import { Box, LinkButton } from 'ui';

type SuccessMessageProps = {
  children?: React.ReactNode;
};

const SuccessMessage = ({ children }: SuccessMessageProps) => {
  const footprint = useFootprintJs();

  const handleClose = () => {
    footprint.onClose();
  };

  return (
    <Container>
      <Box>
        <HeaderTitle
          title="You&#39;re all set! 😎"
          subtitle="Identity successfully verified."
        />
      </Box>
      {children}
      <LinkButton onClick={handleClose}>Return to site</LinkButton>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: ${theme.spacing[8]}px;
    text-align: center;
  `}
`;

export default SuccessMessage;
