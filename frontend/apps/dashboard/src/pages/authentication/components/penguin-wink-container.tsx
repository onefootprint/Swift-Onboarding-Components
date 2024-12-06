import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, media } from '@onefootprint/ui';
import styled from 'styled-components';
import ContainerBox from './container-box';
import Layout from './layout';
import PenguinWink from './penguin-wink';

type PenguinWinkContainerProps = {
  children: React.ReactNode;
};

const PenguinWinkContainer = ({ children }: PenguinWinkContainerProps) => (
  <Layout>
    <Container>
      <ContainerBox>
        <ThemedLogoFpCompact color="primary" />
        {children}
      </ContainerBox>
      <PenguinImageContainer>
        <PenguinWink />
      </PenguinImageContainer>
    </Container>
  </Layout>
);

const Container = styled(Box)`
  position: relative;
  width: 100%;

  ${media.greaterThan('sm')`
    width: 410px;
  `}
`;

const PenguinImageContainer = styled(Box)`
  width: 140px;
  height: fit-content;
  position: absolute;
  transform: translateY(-100%);
  right: 30px;
  top: 2px;
  z-index: 0;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`;

export default PenguinWinkContainer;
