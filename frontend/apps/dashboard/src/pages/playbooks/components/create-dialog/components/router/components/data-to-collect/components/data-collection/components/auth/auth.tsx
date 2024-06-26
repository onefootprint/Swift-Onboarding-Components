import React from 'react';
import styled, { css } from 'styled-components';

import Preview from './components/preview';

const AuthPreview = () => (
  <Container>
    <Preview />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `}
`;

export default AuthPreview;
