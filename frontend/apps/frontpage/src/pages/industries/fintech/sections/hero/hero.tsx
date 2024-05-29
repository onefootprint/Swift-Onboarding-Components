import { Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type HeroProps = {
  title: string;
  subtitle?: string;
  illustration: string;
};

const Hero = ({ title, subtitle, illustration }: HeroProps) => (
  <HeroContainer>
    <IllustrationContainer>
      <Image
        src={illustration}
        alt={`${title} illustration`}
        width={770}
        height={500}
        priority
      />
    </IllustrationContainer>
    <TextContainer direction="column" align="center">
      <Text variant="display-2" maxWidth="770px" textAlign="center" tag="h1">
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="display-4"
          color="secondary"
          maxWidth="660px"
          textAlign="center"
          tag="h4"
        >
          {subtitle}
        </Text>
      )}
    </TextContainer>
  </HeroContainer>
);

const HeroContainer = styled(Stack)`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[11]};
    flex-direction: column;
    gap: ${theme.spacing[9]};
  `}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
  `}
`;

const IllustrationContainer = styled(Stack)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
  max-width: 100%;
  overflow: hidden;
`;

export default Hero;
