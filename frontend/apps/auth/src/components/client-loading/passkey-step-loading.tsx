import { Box, Shimmer } from '@onefootprint/ui';
import styled from 'styled-components';

const PasskeyStepLoading = (): JSX.Element => (
  <Box testID="identify-passkey-shimmer">
    <NavHeader />
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" marginBottom={2}>
      <Shimmer height="40px" width="40px" marginBottom={3} />
      <Shimmer height="24px" width="110px" marginBottom={3} />
    </Box>
    <Box display="flex" flexDirection="column" alignItems="center" marginBottom={3}>
      <Shimmer height="20px" width="243px" marginBottom={3} />
      <Shimmer height="20px" width="137px" marginBottom={7} />
      <Shimmer height="20px" width="241px" />
    </Box>
  </Box>
);

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

export default PasskeyStepLoading;
