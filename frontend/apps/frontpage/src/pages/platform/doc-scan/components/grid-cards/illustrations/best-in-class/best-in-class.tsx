import React from 'react';

import { media } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

const BestInClass = () => {
  return (
    <>
      <StyledImage src="/doc-scan/grid-cards/id-capture.png" alt="ID capture" width={300} height={600} />
    </>
  );
};

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    left: 50%;
    transform: translate(-50%, -10%) scale(.8);
    width: 300px;
    height: 600px;

    ${media.greaterThan('md')`
    top: ${theme.spacing[5]};
    transform: translate(-50%, 0) scale(1);
    `}
  `}
`;

export default BestInClass;
