import { IcoSparkles24 } from '@onefootprint/icons';
import { Container, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const IntroCard = ({ children }: { children: React.ReactNode }) => (
  <SectionContainer>
    <CardContainer>
      <IcoSparkles24 />
      <Text variant="body-1" maxWidth="600px">
        {children}
      </Text>
    </CardContainer>
  </SectionContainer>
);

const CardContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};
    align-items: center;
    justify-content: center;
    text-align: center;
    padd
  `}
`;

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${theme.spacing[3]} 0 ${theme.spacing[11]} 0;
  `}
`;

export default IntroCard;
