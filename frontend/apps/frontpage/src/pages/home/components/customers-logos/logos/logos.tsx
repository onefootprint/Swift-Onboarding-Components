import styled, { css, useTheme } from '@onefootprint/styled';
import { media, Stack } from '@onefootprint/ui';
import React from 'react';

import CobaLogo from './companies/coba/coba';
import ComposerLogo from './companies/composer';
import FindigsLogo from './companies/findigs';
import FlexcarLogo from './companies/flexcar';
import GridLogo from './companies/grid';

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
        <CobaLogo color={theme.color.tertiary} />
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
