import { Shimmer, Stack } from '@onefootprint/ui';

const DuplicatesLoading = () => {
  return (
    <Stack direction="column" gap={4}>
      <Shimmer width="100%" height="20px" />
      <Shimmer width="100%" height="144px" />
      <Shimmer width="100%" height="144px" />
    </Stack>
  );
};

export default DuplicatesLoading;
