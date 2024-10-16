import { Shimmer, Stack } from '@onefootprint/ui';

const Loading = () => {
  return (
    <Stack direction="column" gap={5}>
      <Shimmer width="100%" height="363px" />
      <Shimmer width="100%" height="315px" />
    </Stack>
  );
};

export default Loading;
