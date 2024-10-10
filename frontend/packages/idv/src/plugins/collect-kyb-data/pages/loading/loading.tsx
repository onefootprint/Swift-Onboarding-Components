import { Box, Shimmer, Stack } from '@onefootprint/ui';
import styled from 'styled-components';

type LoadingProps = { children?: JSX.Element | null };

const Loading = ({ children }: LoadingProps): JSX.Element => (
  <Box>
    <NavHeader />
    <Stack flexDirection="column" justifyContent="center" alignItems="center" marginBottom={8}>
      <Shimmer height="28px" width="272px" marginBottom={5} />
      <Shimmer height="70px" width="340px" />
    </Stack>
    <Box marginBottom={5}>
      <Shimmer height="331px" width="100%" />
    </Box>
    {children}
  </Box>
);

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

export default Loading;
