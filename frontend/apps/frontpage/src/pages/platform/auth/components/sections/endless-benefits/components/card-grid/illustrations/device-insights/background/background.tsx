import styled from 'styled-components';

const Background = styled.div`
  background-image: url('/auth/grid/map.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  position: absolute;
  mask: radial-gradient(
    100% 70% at 50% 50%,
    rgba(0, 0, 0, 0.8) 0%,
    transparent 80%
  );
`;

export default Background;
