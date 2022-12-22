import styled from 'styled-components';

type Line = {
  color: string;
  width: number;
  height: number;
  left?: number;
  top?: number;
  index?: number;
  position?: string | 'absolute';
};

const LineDraw = styled.div<Line>`
  position: ${props => (props.position ? props.position : 'absolute')};
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  background: ${props =>
    `radial-gradient(50% 50% at 50% 50%, ${props.color} 0%, rgba(74, 36, 219, 0) 100%)`};
  height: ${props => props.height}%;
  width: ${props => props.width}%;
  transform: translate(-50%, -50%);
`;

export default LineDraw;
