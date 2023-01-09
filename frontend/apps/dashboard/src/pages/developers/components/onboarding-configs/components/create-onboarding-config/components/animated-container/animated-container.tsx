import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Box } from '@onefootprint/ui';
import React from 'react';

type AnimatedContainerProps = {
  isExpanded: boolean;
  children: React.ReactNode;
};

const AnimatedContainer = ({
  isExpanded,
  children,
}: AnimatedContainerProps) => {
  const [animate] = useAutoAnimate<HTMLDivElement>();
  return (
    <Box ref={animate}>
      {isExpanded && (
        <Box sx={{ marginLeft: 5, marginTop: 3, marginBottom: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default AnimatedContainer;
