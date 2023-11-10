import styled from '@onefootprint/styled';
import { Button, Container, media, Stack, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

type PenguinBannerProps = {
  title: string;
  subtitle: string;
  primaryButton?: string;
  secondaryButton?: string;
  onClickPrimaryButton?: () => void;
  onClickSecondaryButton?: () => void;
};

const PenguinBanner = ({
  title,
  subtitle,
  primaryButton = 'Get Started',
  secondaryButton = 'Learn More',
  onClickPrimaryButton,
  onClickSecondaryButton,
}: PenguinBannerProps) => (
  <Container>
    <Stack
      direction="column"
      align="center"
      gap={10}
      marginTop={11}
      marginBottom={12}
    >
      <Image
        src="/pricing/banner.png"
        alt="Illustration"
        width={320}
        height={320}
      />
      <Stack direction="column" align="center" textAlign="center" gap={9}>
        <Stack
          direction="column"
          align="center"
          textAlign="center"
          maxWidth="600px"
          gap={3}
        >
          <Typography variant="display-3" color="primary">
            {title}
          </Typography>
          <Typography variant="display-4" color="tertiary">
            {subtitle}
          </Typography>
        </Stack>
        <ResponsiveStack gap={3}>
          <Button variant="primary" onClick={onClickPrimaryButton}>
            {primaryButton}
          </Button>
          <Button variant="secondary" onClick={onClickSecondaryButton}>
            {secondaryButton}
          </Button>
        </ResponsiveStack>
      </Stack>
    </Stack>
  </Container>
);

const ResponsiveStack = styled(Stack)`
  flex-direction: column;
  width: 100%;

  ${media.greaterThan('sm')`
    flex-direction: row;
    width: auto;
  `}
`;

export default PenguinBanner;
