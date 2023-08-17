import styled, { css } from '@onefootprint/styled';
import React from 'react';

type EditingProps = {
  stopEditing: () => void;
};

const Editing = ({ stopEditing }: EditingProps) => (
  // placeholder
  <EditingContainer onClick={stopEditing} />
);

const EditingContainer = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
  `};
`;

export default Editing;
