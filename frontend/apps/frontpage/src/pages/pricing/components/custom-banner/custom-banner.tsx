import { Stack, Text, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Ctas from 'src/components/ctas';
import Illustration from './components/illustration';

type CustomBannerProps = {
  title: string;
  subtitle: string;
  primaryButton?: string;
  secondaryButton?: string;
  onClickPrimaryButton?: () => void;
  onClickSecondaryButton?: () => void;
};

const CustomBanner = ({
  title,
  subtitle,
  primaryButton = 'Get Started',
  secondaryButton = 'Learn More',
}: CustomBannerProps) => {
  return (
    <Container direction="column" align="center" gap={2} paddingTop={11} paddingBottom={12} width="100%">
      <Illustration />
      <Stack direction="column" align="center" textAlign="center" gap={8}>
        <Stack direction="column" align="center" textAlign="center" gap={3}>
          <Text variant="display-3" color="primary">
            {title}
          </Text>
          <Text variant="display-4" color="tertiary" maxWidth="600px">
            {subtitle}
          </Text>
        </Stack>
        <ResponsiveStack gap={4}>
          <Ctas labels={{ primary: primaryButton, secondary: secondaryButton }} />
        </ResponsiveStack>
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      opacity: 0.5;
      position: absolute;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      top: 0;
      left: 50%;
      z-index: -1;
      border-radius: 100%;
      background: radial-gradient(
        100% 50% at 50% 50%,
        ${theme.backgroundColor.quaternary} 0%,
        ${theme.backgroundColor.primary} 50%
      );
      background-blend-mode: overlay;
    }
  `}
`;

const ResponsiveStack = styled(Stack)`
  flex-direction: column;
  width: 100%;

  ${media.greaterThan('sm')`
    flex-direction: row;
    width: auto;
  `}
`;

export default CustomBanner;
