import { Shimmer, Stack } from '@onefootprint/ui';

const Loading = () => (
  <Stack direction="column" gap={7}>
    <Stack justify="space-between" align="center">
      <Stack direction="column" gap={2}>
        <Shimmer height="20px" width="36px" />
        <Shimmer height="20px" width="300px" />
      </Stack>
      <Shimmer height="32px" width="51px" />
    </Stack>
    <Stack direction="column" gap={5}>
      <Stack direction="column" gap={2}>
        <Shimmer height="20px" width="22px" />
        <Shimmer height="20px" width="184px" />
      </Stack>
      <Shimmer height="336px" />
    </Stack>
    <Stack direction="column" gap={5}>
      <Stack direction="column" gap={2}>
        <Shimmer height="20px" width="56px" />
        <Shimmer height="20px" width="435px" />
      </Stack>
      <Shimmer height="288px" />
    </Stack>
  </Stack>
);

export default Loading;
