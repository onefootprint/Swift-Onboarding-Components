import IcoLock16 from 'icons/ico/ico-lock-16';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const EncryptedByFootprint = () => (
  <Container>
    <IcoLock16 color="success" />
    <TextContainer>
      <Typography sx={{ marginLeft: 2 }} variant="body-4" color="primary">
        Encrypted in your Footprint Vault
      </Typography>
    </TextContainer>
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]}px;
  `}
`;

export default EncryptedByFootprint;
