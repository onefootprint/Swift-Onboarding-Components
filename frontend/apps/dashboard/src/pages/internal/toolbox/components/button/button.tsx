import type { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type ButtonProps = {
  onClick?: () => void;
  title: string;
  subtitle: string;
  icon: Icon;
};

const Button = ({ onClick, title, subtitle, icon: Icon }: ButtonProps) => (
  <Container onClick={onClick}>
    <IconContainer align="center" justify="center">
      <Icon />
    </IconContainer>
    <Stack direction="column" gap={2}>
      <Text variant="heading-3" color="primary" tag="h2">
        {title}
      </Text>
      <Text variant="body-3" color="secondary" tag="p">
        {subtitle}
      </Text>
    </Stack>
  </Container>
);

const Container = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: ${theme.spacing[3]};
    cursor: pointer;
    max-width: 320px;
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]};
    transition: all 0.2s ease-in-out;

    &:hover {
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
      background-color: ${theme.backgroundColor.secondary};

      ${IconContainer} {
        background-color: ${theme.backgroundColor.senary};
      }
    }
  `}
`;

const IconContainer = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]};
    width: ${theme.spacing[9]};
    height: ${theme.spacing[9]};
    border-radius: 50%;
    background-color: ${theme.backgroundColor.secondary};
    transition: all 0.2s ease-in-out;
  `}
`;
export default Button;
