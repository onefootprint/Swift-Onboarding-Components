import { Container, Grid, Stack } from '@onefootprint/ui';
import Image from 'next/image';
import type React from 'react';
import styled, { css } from 'styled-components';

type TimelineLayoutProps = {
  iconSrc?: string;
  children: React.ReactNode;
};

const TimelineLayout = ({ iconSrc, children }: TimelineLayoutProps) => (
  <Container>
    <Grid.Container columns={['48px', '1fr']} gap={9} paddingBottom={7} templateAreas={['line content']}>
      <Line gridArea="line" align="flex-start" justify="center">
        <Stack backgroundColor="primary" borderRadius="full">
          {iconSrc && <Image src={iconSrc} alt="" width={80} height={80} />}
        </Stack>
      </Line>
      <Grid.Item gridArea="content" direction="column" gap={9} maxWidth="100%">
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
