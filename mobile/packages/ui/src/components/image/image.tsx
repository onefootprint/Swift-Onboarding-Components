import type { Ref } from 'react';
import React, { forwardRef, useState } from 'react';
import type { ImageProps as RNImageProps } from 'react-native';
import { Image as RNImage } from 'react-native';
import styled, { css } from 'styled-components/native';

import Box from '../box';
import LoadingIndicator from '../loading-indicator';

export type ImageProps = RNImageProps & {
  ref?: Ref<RNImage>;
};

const Image = forwardRef<RNImage, ImageProps>((props, ref) => {
  const [loaded, setLoaded] = useState(false);

  const onLoad = () => {
    setLoaded(true);
  };

  return (
    <Box center position="relative">
      {!loaded && (
        <Box position="absolute" zIndex={1} top="50%">
          <LoadingIndicator />
        </Box>
      )}
      <StyledImage {...props} onLoad={onLoad} loaded={loaded} ref={ref} />
    </Box>
  );
});

const StyledImage = styled(RNImage)<{ loaded: boolean }>`
  ${({ theme, loaded }) => css`
    background-color: ${loaded ? theme.backgroundColor.tertiary : theme.backgroundColor.secondary};
  `}
`;

export default Image;
