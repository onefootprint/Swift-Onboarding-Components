import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Box, SXStyleProps } from '@onefootprint/ui';
import React from 'react';

type AnimatedContainerProps = {
  isExpanded: boolean;
  children: React.ReactNode;
  sx?: SXStyleProps;
};

const AnimatedContainer = ({
  isExpanded,
  children,
  sx,
}: AnimatedContainerProps) => {
  const [animate] = useAutoAnimate<HTMLDivElement>();
  return (
    <Box
      ref={animate}
      sx={{ display: isExpanded ? 'flex' : 'none', flexDirection: 'column' }}
    >
      {isExpanded && <Box sx={sx}>{children}</Box>}
    </Box>
  );
};

export default AnimatedContainer;
