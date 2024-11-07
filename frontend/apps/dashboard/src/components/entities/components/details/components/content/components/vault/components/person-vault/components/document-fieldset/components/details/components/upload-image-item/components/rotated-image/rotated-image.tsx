import { Box } from '@onefootprint/ui';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import StyledImage from '../styled-image';

type RotatedImageProps = {
  alt: string;
  src: string;
  rotateIndex: number;
};

const RotatedImage = forwardRef<HTMLDivElement, RotatedImageProps>(({ alt, src, rotateIndex }, ref) => (
  <Container $index={rotateIndex} ref={ref} position="absolute" top={0} left={0} width="100%">
    <StyledImage alt={alt} src={src} />
  </Container>
));

const Container = styled(Box)<{ $index: number }>`
  ${({ theme, $index }) => css`
    transform: ${
      $index === 0
        ? 'none'
        : `translate(${$index % 2 === 0 ? -2 : 2}px, ${$index * 3}px) 
              rotate(${$index % 2 === 0 ? -2 : 2}deg)`
    };
    z-index: ${theme.zIndex.popover - $index};
  `};
`;

export default RotatedImage;
