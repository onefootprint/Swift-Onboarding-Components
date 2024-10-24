import { Box, Shimmer } from '@onefootprint/ui';

const Loading = () => (
  <>
    <Box width="100%" height="var(--navigation-header-height)" />
    <Box center>
      <Shimmer height="28px" width="190px" marginBottom={3} />
    </Box>
    <Box center>
      <Shimmer height="96px" width="358px" marginBottom={6} />
    </Box>
    <Shimmer height="110px" width="415px" borderRadius="default" marginBottom={6} />
    <Shimmer height="495px" width="415px" borderRadius="default" />
    <Shimmer height="60px" width="415px" borderRadius="default" marginTop={5} />
    <Shimmer height="24px" width="415px" borderRadius="default" marginTop={5} />
  </>
);

export default Loading;
