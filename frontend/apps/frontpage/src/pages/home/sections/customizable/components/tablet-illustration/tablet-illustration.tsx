import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration';

const TabletIllustration = () => (
  <IllustrationWrapper>
    <ImageWrapper data-position="center">
      <Image
        src="/new-home/customizable/1.png"
        height={288}
        width={390}
        alt="illustration"
      />
    </ImageWrapper>
    <ImageWrapper data-position="top-right">
      <Image
        src="/new-home/customizable/2.png"
        height={200}
        width={250}
        alt="illustration"
      />
    </ImageWrapper>

    <ImageWrapper data-position="bottom-right">
      <Image
        src="/new-home/customizable/3.png"
        height={200}
        width={250}
        alt="illustration"
      />
    </ImageWrapper>

    <ImageWrapper data-position="top-left">
      <Image
        src="/new-home/customizable/4.png"
        height={200}
        width={250}
        alt="illustration"
      />
    </ImageWrapper>

    <ImageWrapper data-position="bottom-left">
      <Image
        src="/new-home/customizable/5.png"
        height={200}
        width={250}
        alt="illustration"
      />
    </ImageWrapper>
  </IllustrationWrapper>
);

const IllustrationWrapper = styled(BaseIllustration)`
  position: relative;
  display: none;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  ${media.greaterThan('sm')`
    display: block; 
   `}

  ${media.greaterThan('md')`
    display: none;
    `}
`;

const ImageWrapper = styled.div`
  position: relative;

  & > * {
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 0;
  }

  &[data-position='center'] {
    z-index: 1;
    top: 50%;
    left: 0%;
  }

  &[data-position='top-right'] {
    filter: blur(4px);
    top: 0%;
    left: 50%;
  }

  &[data-position='top-left'] {
    filter: blur(4px);
    top: 0%;
    left: -50%;
  }
  &[data-position='bottom-left'] {
    filter: blur(4px);
    top: 80%;
    left: -50%;
  }
  &[data-position='bottom-right'] {
    filter: blur(4px);
    top: 80%;
    left: 50%;
  }
`;

export default TabletIllustration;
