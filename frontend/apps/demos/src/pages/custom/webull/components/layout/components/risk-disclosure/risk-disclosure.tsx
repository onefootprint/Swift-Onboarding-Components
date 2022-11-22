import { Box } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

type RiskDisclosureProps = {
  label: string;
};

const RiskDisclosure = ({ label }: RiskDisclosureProps) => (
  <Container>
    <Box sx={{ width: '50px', height: '50px' }}>
      <Image
        alt="Icon disclosure"
        height={50}
        src="/webull/icon-disclosure.png"
        width={50}
      />
    </Box>
    <Label>{label}</Label>
  </Container>
);

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Label = styled.div`
  color: #717273;
  margin-top: 8px;
`;

export default RiskDisclosure;
