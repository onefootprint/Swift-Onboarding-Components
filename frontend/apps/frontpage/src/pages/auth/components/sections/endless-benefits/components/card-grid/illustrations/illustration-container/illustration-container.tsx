import styled from 'styled-components';

const IllustrationContainer = styled.div<{ className?: string }>`
  position: relative;
  pointer-events: none;
  width: 100%;
  user-select: none;
  overflow: hidden;

  && {
    height: calc(240px + 48px);
  }
`;

export default IllustrationContainer;
