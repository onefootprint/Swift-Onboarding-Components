import { Box, Shimmer, Stack } from '@onefootprint/ui';

const Loading = () => (
  <Box>
    <Box width="100%" height="var(--navigation-header-height)" />
    <Stack flexDirection="column" justifyContent="center" alignItems="center" marginBottom={8}>
      <Shimmer height="28px" width="272px" marginBottom={5} />
      <Shimmer height="70px" width="340px" />
    </Stack>
    <Box marginBottom={5}>
      <Shimmer height="331px" width="100%" />
    </Box>
  </Box>
);

export default Loading;
