import React from 'react';
import styled from 'styled-components';

import IllustrationContainer from '../illustration-container';
import BackgroundScreen from './components/background-screen';
import Cursor from './components/cursor/cursor';
import FrontModal from './components/front-modal';

const ChargebackDisputes = () => (
  <StyledIllustrationContainer>
    <StyledBackgroundScreen />
    <StyledFrontModal />
    <StyledCursor />
  </StyledIllustrationContainer>
);

const StyledFrontModal = styled(FrontModal)`
  transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  left: 50%;
`;

const StyledBackgroundScreen = styled(BackgroundScreen)`
  top: 32px;
  left: 32px;
  position: absolute;
`;

const StyledCursor = styled(Cursor)`
  position: absolute;
  top: 80%;
  left: 52%;
  transform: translate(-50%, -50%);
`;

const StyledIllustrationContainer = styled(IllustrationContainer)`
  mask: linear-gradient(180deg, black 0%, black 80%, transparent 100%);
  mask-type: alpha;
`;

export default ChargebackDisputes;
