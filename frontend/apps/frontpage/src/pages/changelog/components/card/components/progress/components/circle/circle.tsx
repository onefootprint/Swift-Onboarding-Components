import React from 'react';

type CircleProps = {
  circleHeight: number;
  circleWidth: number;
};

const Circle = ({ circleHeight, circleWidth }: CircleProps) => (
  <svg
    width={circleWidth}
    height={circleHeight}
    viewBox={`0 0 ${circleWidth} ${circleHeight}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx={circleWidth / 2}
      cy={circleHeight / 2}
      r={circleHeight / 2}
      fill="unset"
    />
  </svg>
);

export default Circle;
