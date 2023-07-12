import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import useMeasure from 'react-use-measure';

const SHIMMER_HEIGHT = '296px';

export const IDV_BODY_CONTENT_CONTAINER_ID = 'idv-body-content-container';

type BodyProps = {
  children: React.ReactNode;
};

const Body = ({ children }: BodyProps) => {
  const [refBody, { height: bodyHeight }] = useMeasure();

  return (
    <Container
      animate={{ height: bodyHeight || SHIMMER_HEIGHT }}
      transition={{
        duration: 0.15,
        type: 'spring',
      }}
      id={IDV_BODY_CONTENT_CONTAINER_ID}
    >
      <BodyContent ref={refBody}>{children}</BodyContent>
    </Container>
  );
};

const Container = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const BodyContent = styled.span`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    box-sizing: content-box;
    padding: ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[8]}; 
    `}
  `}
`;

export default Body;
