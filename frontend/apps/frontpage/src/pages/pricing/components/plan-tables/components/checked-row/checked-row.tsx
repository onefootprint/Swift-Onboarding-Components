import { IcoCheckCircle24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type CheckedRowTypes = {
  children: string;
};

const CheckedRow = ({ children }: CheckedRowTypes) => (
  <CheckedRowContainer>
    <IcoCheckCircle24 />
    <Typography variant="body-2" as="p">
      {children}
    </Typography>
  </CheckedRowContainer>
);

const CheckedRowContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[5]} ${theme.spacing[3]};
    border-bottom: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};

    svg {
      flex-shrink: 0;
    }

    &:last-child {
      border: none;
    }
  `}
`;

export default CheckedRow;
