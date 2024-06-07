import { Stack, media } from '@onefootprint/ui';
import React from 'react';
import ApitureLogo from 'src/components/company-logos/themed/apiture';
import BloomLogo from 'src/components/company-logos/themed/bloom/bloom';
import ComposerLogo from 'src/components/company-logos/themed/composer';
import FindigsLogo from 'src/components/company-logos/themed/findigs';
import FlexcarLogo from 'src/components/company-logos/themed/flexcar';
import GridLogo from 'src/components/company-logos/themed/grid';
import YieldstreetLogo from 'src/components/company-logos/themed/yieldstreet';
import styled, { css, useTheme } from 'styled-components';

const Logos = () => {
  const theme = useTheme();
  return (
    <Container direction="row" flexWrap="wrap" align="center" justify="center">
      <Stack justify="center" align="center" padding={2}>
        <ComposerLogo color={theme.color.tertiary} />
      </Stack>
      <Stack justify="center" align="center" padding={2}>
        <GridLogo color={theme.color.tertiary} />
      </Stack>
      <Stack justify="center" align="center" padding={2}>
        <FlexcarLogo color={theme.color.tertiary} />
      </Stack>
      <Stack justify="center" align="center" padding={2}>
        <FindigsLogo color={theme.color.tertiary} />
      </Stack>
      <Stack justify="center" align="center" padding={2}>
        <ApitureLogo color={theme.color.tertiary} />
      </Stack>
      <Stack justify="center" align="center" padding={2}>
        <BloomLogo color={theme.color.tertiary} />
      </Stack>
      <Stack justify="center" align="center" padding={2}>
        <YieldstreetLogo color={theme.color.tertiary} />
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};

    ${media.greaterThan('md')`
      gap: ${theme.spacing[8]};
    `}
  `}
`;

export default Logos;
