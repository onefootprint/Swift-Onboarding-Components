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
  background: #e2defa;
  height: 348px;
  left: 157px;
  top: 427px;
  width: 722px;
`;

const TopGreen = styled(BaseGradient)`
  background: rgba(118, 251, 143, 0.17);
  height: 318px;
  left: 767px;
  top: 277px;
  width: 569px;
`;

const BottomGreen = styled(BaseGradient)`
  background: rgba(118, 251, 143, 0.17);
  height: 263px;
  left: 325px;
  top: 1152px;
  width: 471px;
`;

const BottomPurple = styled(BaseGradient)`
  background: #e2defa;
  height: 236px;
  left: 788px;
  top: 1057px;
  width: 420px;
`;

export default HighlightsGradient;
