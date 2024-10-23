import { Box, Divider, Shimmer, Stack } from '@onefootprint/ui';

const Loading = () => (
  <Box tag="section" testID="entity-loading" paddingTop={7}>
    <Box marginBottom={5}>
      <Breadcrumb />
    </Box>
    <Box marginBottom={5}>
      <Header />
    </Box>
    <Box marginBottom={5}>
      <Divider />
    </Box>
    <Box marginBottom={9}>
      <Vault />
    </Box>
  </Box>
);

const Breadcrumb = () => (
  <Stack gap={3}>
    <Shimmer height="24px" width="52px" />
    <Shimmer height="24px" width="4px" />
    <Shimmer height="24px" width="65px" />
  </Stack>
);

const Header = () => (
  <Stack justifyContent="space-between">
    <Stack gap={3}>
      <Shimmer height="28px" width="63px" />
      <Shimmer height="28px" width="228px" />
      <Shimmer height="28px" width="59px" />
      <Shimmer height="28px" width="111px" />
    </Stack>
    <Stack justifyContent="flex-end" gap={3}>
      <Shimmer height="28px" width="137px" />
      <Shimmer height="28px" width="95px" />
      <Shimmer height="28px" width="28px" />
    </Stack>
  </Stack>
);

const Vault = () => (
  <Box gap={5} display="grid" gridTemplateColumns="repeat(2, 1fr)">
    <Box>
      <Shimmer height="317px" minWidth="264px" />
    </Box>
    <Box>
      <Shimmer height="317px" minWidth="264px" />
    </Box>
    <Box>
      <Shimmer height="235px" minWidth="264px" />
    </Box>
    <Box>
      <Shimmer height="235px" minWidth="264px" />
    </Box>
  </Box>
);

export default Loading;
