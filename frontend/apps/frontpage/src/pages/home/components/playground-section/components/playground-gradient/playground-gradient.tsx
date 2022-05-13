import styled from 'styled';

const PlaygroundGradient = styled.div`
  pointer-events: none;
  background: linear-gradient(
    0deg,
    rgba(118, 251, 143, 0.6) 0%,
    rgba(118, 251, 143, 0) 100%
  );
  filter: blur(240px);
  position: absolute;
  width: 1128px;
  height: 323px;
  left: 0;
  top: 0px;
`;

export default PlaygroundGradient;
