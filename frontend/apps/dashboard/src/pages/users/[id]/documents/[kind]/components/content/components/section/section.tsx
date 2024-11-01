import type { Icon } from '@onefootprint/icons';
import { Box, Divider, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

type SectionProps = {
  title: string;
  children: React.ReactNode;
  IconComponent: Icon;
  id?: string;
  actions?: React.ReactNode;
};

const Section = ({ children, IconComponent, title, id, actions }: SectionProps) => (
  // biome-ignore lint/a11y/useSemanticElements: TODO: change to <fieldset />
  <Box aria-label={title} id={id} role="group">
    <Header>
      <Text tag="h2" variant="label-1" gap={3} display="flex">
        <IconComponent />
        {title}
      </Text>
      {actions}
    </Header>
    <Divider marginBottom={7} />
    <Box position="relative">{children}</Box>
  </Box>
);

const Header = styled.header`
  ${({ theme }) => css`
    align-items: flex-end;
    display: flex;
    flex-direction: column wrap;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

export default Section;
