import { IcoLightBulb24, IcoMountain24 } from '@onefootprint/icons';
import { media, Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { IconTitle } from '../icon-title';

export type ChallengeSolutionProps = {
  children: React.ReactNode;
  type?: 'challenge' | 'solution';
};

const ChallengeSolution = ({ children, type }: ChallengeSolutionProps) => (
  <Container
    backgroundColor="secondary"
    direction="column"
    borderRadius="default"
    data-type={type}
  >
    <Stack gap={3} direction="column">
      <IconTitle icon={type === 'challenge' ? IcoMountain24 : IcoLightBulb24}>
        {type === 'challenge' ? 'Challenge' : 'Solution'}
      </IconTitle>
      {children}
    </Stack>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};

    &[data-type='challenge'] {
      padding: ${theme.spacing[5]} ${theme.spacing[3]} ${theme.spacing[3]}
        ${theme.spacing[3]};
      border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default}
        0 0;
    }

    &[data-type='solution'] {
      padding: 0 ${theme.spacing[3]} 0 ${theme.spacing[3]};
      border-radius: 0 0 ${theme.borderRadius.default}
        ${theme.borderRadius.default};
      margin-bottom: ${theme.spacing[9]};
    }

    ${media.greaterThan('md')`
      &[data-type='challenge'] {
        padding: ${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[3]}
        ${theme.spacing[7]};
      }

      &[data-type='solution'] {
        padding: 0 ${theme.spacing[7]} ${theme.spacing[3]} ${theme.spacing[7]};
      }
    `}
  `}
`;
export default ChallengeSolution;
