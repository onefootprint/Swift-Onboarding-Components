import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import RuleTag from '../rule-tag';

const GrabbedChip = ({ className }: { className?: string }) => (
  <Container className={className}>
    <RuleTag signal="ip" op="is" list="@blocked_ips" $elevated />
    <GrabHand src="/home/verify-cards/hand.svg" height={42} width={42} alt="grab" />
  </Container>
);

const Container = styled(Box)`
  position: relative;
  z-index: 3;
  width: fit-content;
`;

const GrabHand = styled(Image)`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
`;

export default GrabbedChip;
