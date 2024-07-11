import { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SubsectionProps = {
  icon: Icon;
  title: string;
  children: React.ReactNode;
};

const Subsection = ({ icon: Icon, title, children }: SubsectionProps) => (
  <Container>
    <Stack gap={3} align="center">
      <Icon />
      <Text variant="label-3">{title}</Text>
    </Stack>
    {children}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
  padding: ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default Subsection;
