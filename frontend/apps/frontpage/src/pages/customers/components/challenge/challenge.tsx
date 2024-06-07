import { IcoMountain24 } from '@onefootprint/icons';
import { Stack, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { IconTitle } from '../icon-title';

export type ChallengeProps = {
  children: React.ReactNode;
  type?: 'challenge' | 'solution';
};

const ChallengeSolution = ({ children, type }: ChallengeProps) => (
  <Container backgroundColor="secondary" direction="column" borderRadius="default" data-type={type}>
    <Stack gap={3} direction="column">
      <IconTitle icon={IcoMountain24}>Challenge</IconTitle>
      {children}
    </Stack>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
    margin-bottom: ${theme.spacing[9]};
    padding: ${theme.spacing[6]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[6]} ${theme.spacing[7]} ${theme.spacing[3]}
        ${theme.spacing[7]};
    `};
  `}
`;
export default ChallengeSolution;
