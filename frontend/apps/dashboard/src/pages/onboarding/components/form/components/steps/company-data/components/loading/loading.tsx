import { Box, Portal, Shimmer } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Container aria-busy data-testid="onboarding-company-data-loading">
    <Box id="company-name-shimmer">
      <Shimmer height="20px" width="105px" marginBottom={3} />
      <Shimmer height="40px" />
    </Box>
    <Box id="company-website-shimmer">
      <Shimmer height="20px" width="120px" marginBottom={3} />
      <Shimmer height="40px" />
    </Box>
    <Box id="company-size-shimmer">
      <Shimmer height="20px" width="94px" marginBottom={3} />
      <Shimmer height="40px" />
    </Box>
    <Portal selector="#onboarding-cta-portal">
      <Shimmer height="40px" width="83px" />
    </Portal>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default Loading;
