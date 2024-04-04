import { Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Container>
    <Shimmer sx={{ width: '300px', height: '27px' }} />
    <Shimmer sx={{ width: '100%', height: '20px' }} />
    <Shimmer sx={{ width: '100%', height: '20px' }} />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    padding-bottom: ${theme.spacing[3]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default Loading;
