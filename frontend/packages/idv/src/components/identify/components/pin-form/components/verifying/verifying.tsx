import { AnimatedLoadingSpinner, Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const Verifying = ({ text }: { text: string }) => (
  <Container>
    <Stack justify="center" width="40px" height="40px">
      <AnimatedLoadingSpinner animationStart />
    </Stack>
    <Text variant="label-3">{text}</Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Verifying;
