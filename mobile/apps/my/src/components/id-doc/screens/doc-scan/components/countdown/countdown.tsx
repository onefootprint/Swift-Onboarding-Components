import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import Flash from './components/flash';

export type CountdownProps = {
  value: number;
};

const Countdown = ({ value }: CountdownProps) => {
  return (
    <>
      <Container>
        <Typography variant="display-2" color="quinary">
          {value}
        </Typography>
      </Container>
      <Flash />
    </>
  );
};

const Container = styled.View`
  ${({ theme }) => {
    return css`
      align-items: center;
      background-color: rgba(0, 0, 0, 0.35);
      border-radius: ${theme.borderRadius.full};
      height: 76px;
      justify-content: center;
      width: 76px;
    `;
  }}
`;

export default Countdown;
