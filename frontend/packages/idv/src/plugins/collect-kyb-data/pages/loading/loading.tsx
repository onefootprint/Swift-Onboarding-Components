import { Box, Shimmer, Stack } from '@onefootprint/ui';

type LoadingProps = { children?: JSX.Element | null };

const Loading = ({ children }: LoadingProps): JSX.Element => (
  <Box>
    <Box width="100%" height="var(--navigation-header-height)" />
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

export default Loading;
