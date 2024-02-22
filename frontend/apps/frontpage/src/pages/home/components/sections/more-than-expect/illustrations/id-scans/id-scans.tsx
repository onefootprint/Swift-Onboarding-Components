import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled from 'styled-components';

const IdScans = () => (
  <Container>
    <StyledBaseIllustration>
      <LeftImage
        src="/home/more-than-expect/id-scan-left.png"
        height={308}
        width={150}
        alt="Fraud Risk"
        priority
      />
      <RightImage
        src="/home/more-than-expect/id-scan-right.png"
        height={308}
        width={150}
        alt="Fraud Risk"
        priority
      />
    </StyledBaseIllustration>
  </Container>
);

const Container = styled.div`
  height: 256px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
`;

const LeftImage = styled(Image)`
  position: absolute;
  top: 56px;
  left: 40%;
  transform: translateX(-50%);
  z-index: 0;
`;

const RightImage = styled(Image)`
  position: absolute;
  top: 80px;
  left: 60%;
  transform: translateX(-50%);
  z-index: 1;
`;

const StyledBaseIllustration = styled(BaseIllustration)`
  height: 100%;
`;

export default IdScans;
