import React from 'react';
import styled from 'styled';

const HighlightsGradient = () => (
  <>
    <TopPurple />
    <TopGreen />
    <BottomGreen />
    <BottomPurple />
  </>
);

const BaseGradient = styled.div`
  pointer-events: none;
  position: absolute;
  filter: blur(154px);
`;

const TopPurple = styled(BaseGradient)`
  background: #cec6ff;
  height: 348px;
  left: 157px;
  top: 427px;
  width: 722px;
`;

const TopGreen = styled(BaseGradient)`
  background: #d0ffd9;
  height: 318px;
  left: 767px;
  top: 277px;
  width: 569px;
`;

const BottomGreen = styled(BaseGradient)`
  background: #d0ffd9;
  height: 263px;
  left: 325px;
  top: 1152px;
  width: 471px;
`;

const BottomPurple = styled(BaseGradient)`
  background: #cec6ff;
  height: 236px;
  left: 788px;
  top: 1057px;
  width: 420px;
`;

export default HighlightsGradient;
