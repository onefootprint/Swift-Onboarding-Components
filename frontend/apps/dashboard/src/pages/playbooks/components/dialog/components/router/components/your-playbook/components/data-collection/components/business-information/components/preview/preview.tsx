import styled, { css } from '@onefootprint/styled';
import React from 'react';

type PreviewProps = {
  startEditing: () => void;
};

const Preview = ({ startEditing }: PreviewProps) => (
  <Container onClick={startEditing} />
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
  `}
`;

export default Preview;
