import { AnimatedLoadingSpinner, Box, Shimmer, Stack } from '@onefootprint/ui';

const Loading = () => (
  <Box aria-label="Loading documents" role="progressbar">
    <Breadcrumb />
    <Name />
    <Stack justifyContent="space-between" marginBottom={9}>
      <Stack alignItems="center" gap={4}>
        <Kind />
        <PublicKey />
      </Stack>
      <Box>
        <EditButton />
      </Box>
    </Stack>
    <Stack marginBottom={9} gap={5}>
      <Tabs />
    </Stack>
    <Stack center marginTop={12}>
      <AnimatedLoadingSpinner animationStart size={24} />
    </Stack>
  </Box>
);

const Breadcrumb = () => <Shimmer height="20px" width="132px" marginBottom={8} />;

const Name = () => <Shimmer height="20px" width="100px" marginBottom={4} />;

const Kind = () => <Shimmer height="20px" width="30px" />;

const PublicKey = () => <Shimmer height="20px" width="264px" />;

const EditButton = () => <Shimmer height="20px" width="157px" />;

const Tabs = () => (
  <>
    <Shimmer height="20px" width="105px" />
    <Shimmer height="20px" width="130px" />
    <Shimmer height="20px" width="110px" />
    <Shimmer height="20px" width="37px" />
  </>
);

export default Loading;
