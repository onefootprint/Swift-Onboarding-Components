import { Box, Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const NavigationBar = () => (
  <Container direction="row" align="center" justify="flex-start" gap={3} padding={5}>
    <Dot />
    <Dot />
    <Dot />
  </Container>
);

const Dot = styled(Box)`
  width: 8px;
  height: 8px;
  background-color: #d9d9d9;
  border-radius: 50%;
`;

const Container = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    height: 32px;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;
export default NavigationBar;
