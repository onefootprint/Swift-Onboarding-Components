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
  width: 95%;
  height: 348px;
  background: rgba(255, 255, 255, 0.25);
  top: 364px;

  ${media.greaterThan('md')`
    height: 488px;
    width: 488px;
    top: 386px;
  `}

  ${media.greaterThan('lg')`
    top: 346px;
  `}
`;

const MiddleCircle = styled(Circle)`
  position: absolute;
  width: 97.5%;
  height: 378px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  top: 334px;

  ${media.greaterThan('md')`
    height: 488px;
    top: 356px;
    width: 488px;
  `}

  ${media.greaterThan('lg')`
    top: 316px;
  `}
`;

const OuterCircle = styled(Circle)`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  height: 378px;
  position: absolute;
  top: 304px;
  width: 100%;

  ${media.greaterThan('md')`
    height: 508px;
    top: 326px;
    width: 508px;
  `}

  ${media.greaterThan('lg')`
    top: 286px;
  `}
`;

export default CircleBackground;
