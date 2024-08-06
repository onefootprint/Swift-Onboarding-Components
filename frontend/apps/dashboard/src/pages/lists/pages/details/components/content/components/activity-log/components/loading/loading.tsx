import { Shimmer, Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Stack gap={4} direction="column">
    <Container>
      <Shimmer height="27px" width="300px" />
    </Container>
    <Shimmer height="20px" width="100%" />
  </Stack>
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
