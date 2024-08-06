import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import styled from 'styled-components';

const Illustration = () => (
  <Container>
    <Sky src="/home/banner/sky.svg" alt="sky" width={600} height={600} className="sky" />
    <Penguin src="/home/banner/penguin.svg" alt="penguin" width={600} height={400} />
    <Cloud2 src="/home/banner/cloud-2.svg" alt="cloud" width={158} height={52} />
    <Cloud src="/home/banner/cloud.svg" alt="cloud" width={70} height={20} />
    <Sun src="/home/banner/sun.svg" alt="sun" width={50} height={50} />
  </Container>
);

const Container = styled(Box)`
  width: 400px;
  max-width: 90%;
  height: 300px;
  position: relative;
  isolation: isolate;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 auto;
`;

const Sky = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
`;

const Penguin = styled(Image)`
  position: absolute;
  bottom: 1px;
  z-index: 1;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: auto;
`;

const Cloud2 = styled(Image)`
  position: absolute;
  top: 32px;
  left: 0;
  z-index: 1;
`;

const Cloud = styled(Image)`
  position: absolute;
  top: 40px;
  left: 20%;
  z-index: 1;
`;

const Sun = styled(Image)`
  position: absolute;
  top: 40px;
  right: 20%;
  z-index: 1;
`;

export default Illustration;
