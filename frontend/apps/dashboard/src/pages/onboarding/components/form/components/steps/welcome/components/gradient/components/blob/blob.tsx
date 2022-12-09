import styled from 'styled-components';

type BlobProps = {
  color: string;
  width: number;
  height: number;
  left: number;
  top: number;
};

const Blob = styled.div<BlobProps>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  background-color: ${props => props.color};
  border-radius: ${props => props.theme.borderRadius.full};
  height: ${props => props.height}%;
  width: ${props => props.width}%;
  transform: translate(-50%, -50%);
  filter: blur(100px);
`;

export default Blob;
