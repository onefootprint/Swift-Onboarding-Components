import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, Grid } from '@onefootprint/ui';
import React from 'react';
import SectionIcon from 'src/components/section-icon';

type TimelineLayoutProps = {
  icon: Icon;
  children: React.ReactNode;
};

const TimelineLayout = ({ icon, children }: TimelineLayoutProps) => (
  <Container>
    <Grid.Container
      columns={['40px', '1fr']}
      gap={7}
      paddingBottom={7}
      templateAreas={['line content']}
    >
      <Line gridArea="line" align="flex-start" justify="center">
        <SectionIcon icon={icon} />
      </Line>
      <Grid.Item gridArea="content" direction="column" gap={7} maxWidth="100%">
        {children}
      </Grid.Item>
    </Grid.Container>
  </Container>
);

const Line = styled(Grid.Item)`
  ${({ theme }) => css`
    position: relative;

    &::after {
      content: '';
      position: absolute;
      z-index: 0;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      background: radial-gradient(
        100% 100% at 50% 50%,
        ${theme.borderColor.primary} 0%,
        transparent 50%
      );
    }
  `}
`;

export default TimelineLayout;
