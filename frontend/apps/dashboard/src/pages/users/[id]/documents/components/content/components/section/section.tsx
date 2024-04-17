import type { Icon } from '@onefootprint/icons';
import { Box, Divider, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionProps = {
  title: string;
  children: React.ReactNode;
  IconComponent: Icon;
  id?: string;
  actions?: React.ReactNode;
};

const Section = ({
  children,
  IconComponent,
  title,
  id,
  actions,
}: SectionProps) => (
  <Box aria-label={title} id={id} data-testid={id}>
    <Header>
      <Text tag="h2" variant="label-1" gap={3} display="flex">
        <IconComponent />
        {title}
      </Text>
      {actions}
    </Header>
    <Divider marginBottom={7} />
    {children}
  </Box>
);

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-end;
    flex-direction: column wrap;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

export default Section;
