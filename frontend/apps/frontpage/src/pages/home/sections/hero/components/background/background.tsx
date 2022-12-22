import styled from 'styled-components';

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 0;
  width: 100%;
  overflow: hidden;
  background-size: cover;
  background: radial-gradient(
      at 20% 40%,
      rgba(229, 246, 193, 1) 8%,
      rgba(255, 255, 255, 0) 30%
    ),
    radial-gradient(
      at 0% 0%,
      rgba(203, 193, 246, 0.5) 0%,
      rgba(255, 255, 255, 0) 80%
    ),
    radial-gradient(
      at 70% 0%,
      rgba(246, 209, 193, 1) 0%,
      rgba(255, 255, 255, 0) 48%
    ),
    radial-gradient(
      at 60% 10%,
      rgba(200, 228, 255, 1) 0%,
      rgba(200, 228, 255, 0) 100%
    ),
    linear-gradient(to bottom, #cbc1f6, rgba(200, 228, 255, 0) 100%);
  -webkit-mask-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  );
`;

export default HeroBackground;
