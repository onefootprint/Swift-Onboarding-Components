import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { BoxProps } from '@onefootprint/ui';
import { Box } from '@onefootprint/ui';
import React from 'react';

type AnimatedContainerProps = BoxProps & {
  isExpanded: boolean;
  children: React.ReactNode;
};

const AnimatedContainer = ({ isExpanded, children, marginLeft, marginTop }: AnimatedContainerProps) => {
  const [animate] = useAutoAnimate<HTMLDivElement>();
  return (
    <Box ref={animate} display={isExpanded ? 'flex' : 'none'} flexDirection="column">
      {isExpanded && (
        <Box marginLeft={marginLeft} marginTop={marginTop}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default AnimatedContainer;
