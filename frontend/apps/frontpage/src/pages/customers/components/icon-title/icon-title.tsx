import type { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

export type IconTitleProps = {
  icon: Icon;
  children: React.ReactNode;
};

const IconTitle = ({ icon: Icon, children }: IconTitleProps) => (
  <Container gap={3} align="center" justify="start">
    <Icon />
    <StyledText variant="label-2">{children}</StyledText>
  </Container>
);

const StyledText = styled(Text)`
  ${({ theme }) => css`
    && {
      margin: 0;
      margin-top: ${theme.spacing[1]};
    }
  `}
`;

const Container = styled(Stack)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
    &:not(:first-child) {
      margin-top: ${theme.spacing[3]};
    }
  `}
`;

export default IconTitle;
