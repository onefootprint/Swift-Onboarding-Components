import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled, { css } from 'styled-components';

const ManualReview = () => (
  <StyledBaseIllustration>
    <FrontImage
      src="/home/more-than-expect/manual-review.png"
      height={258}
      width={262}
      alt=""
    />
  </StyledBaseIllustration>
);

const StyledBaseIllustration = styled(BaseIllustration)`
  height: 256px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
`;

const FrontImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

export default ManualReview;
