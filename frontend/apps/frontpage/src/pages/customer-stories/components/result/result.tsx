import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type ResultsProps = {
  children: React.ReactNode;
};

const Results = ({ children }: ResultsProps) => (
  <Container>{children}</Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    ul {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[2]};
    }
    && {
      li {
        border-radius: ${theme.borderRadius.default};
        background-color: ${theme.backgroundColor.primary};
        border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
        list-style-type: none;
        background-image: url('/decorative-elements/heart.svg');
        background-repeat: no-repeat;
        background-size: ${theme.spacing[7]} ${theme.spacing[7]};
        background-position: ${theme.spacing[5]} ${theme.spacing[5]};
        padding: ${theme.spacing[4]} ${theme.spacing[5]} ${theme.spacing[4]}
          calc(${theme.spacing[9]} + ${theme.spacing[5]});
      }
    }
  `}
`;

export default Results;
