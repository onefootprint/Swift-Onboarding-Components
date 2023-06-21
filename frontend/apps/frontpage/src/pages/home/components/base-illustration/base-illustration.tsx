import styled from '@onefootprint/styled';
import React from 'react';

type BaseIllustrationProps = {
  className?: string;
  children?: React.ReactNode;
};

const BaseIllustration = ({
  className = 'base-illustration',
  children,
}: BaseIllustrationProps) => (
  <Container className={className}>{children}</Container>
);

const Container = styled.div<{ invertedGradient?: boolean; className: string }>`
  width: 100%;
  overflow: hidden;
  position: relative;
  mask: linear-gradient(180deg, #fff 85%, transparent 100%);
  mask-mode: alpha;
  pointer-events: none;
  user-select: none;
`;

export default BaseIllustration;
