import React from 'react';
import styled from 'styled';
import { media } from 'ui';

const CircleBackground = () => (
  <Container>
    <InnerCircle />
    <MiddleCircle />
    <OuterCircle />
  </Container>
);

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

const Circle = styled.div`
  position: absolute;
  border-radius: 50%;
`;

const InnerCircle = styled(Circle)`
  width: 418px;
  height: 418px;
  background: rgba(255, 255, 255, 0.25);
  top: 364px;

  ${media.greaterThan('md')`
    height: 468px;
    top: 296px;
    width: 468px;
  `}
`;

const MiddleCircle = styled(Circle)`
  position: absolute;
  width: 458px;
  height: 458px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  top: 334px;

  ${media.greaterThan('md')`
    height: 488px;
    top: 254px;
    width: 488px;
  `}
`;

const OuterCircle = styled(Circle)`
  position: absolute;
  width: 458px;
  height: 458px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  top: 304px;

  ${media.greaterThan('md')`
    height: 488px;
    top: 224px;
    width: 488px;
  `}
`;

export default CircleBackground;
