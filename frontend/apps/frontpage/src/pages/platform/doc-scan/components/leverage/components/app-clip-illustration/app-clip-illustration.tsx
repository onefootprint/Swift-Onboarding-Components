import { Stack } from '@onefootprint/ui';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import styled from 'styled-components';

const AppClipIllustration = () => {
  return (
    <Container>
      <StyledImage src="/doc-scan/app-clip.png" alt="App Clip Illustration" width={377} height={420} />
    </Container>
  );
};

const Container = styled(Stack)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
  ${media.greaterThan('md')`
    justify-content: flex-end;
    align-items: center;
  `}
`;

const StyledImage = styled(Image)`
    object-fit: contain;
    position: relative;
    border-radius: 25px;
    max-width: 100%;
    object-position: center;
`;

export default AppClipIllustration;
