import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps } from '../box';
import Box from '../box';
import Stack from '../stack';
import Text from '../text';
import { createBackgroundStyles, createTextStyles, getIconForVariant } from './inline-alert.utils';

export type InlineAlertVariant = 'error' | 'warning' | 'info' | 'neutral';

export type InlineAlertProps = BoxProps & {
  variant: InlineAlertVariant;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

const InlineAlert = ({ cta, children, variant = 'info', ...props }: InlineAlertProps) => {
  const IconComponent = getIconForVariant(variant);

  return (
    <InlineAlertContainer role="alert" $variant={variant} {...props}>
      <IconContainer>
        <IconComponent color={variant} />
      </IconContainer>
      <StyledText type={variant} variant="body-3">
        {children}
        {cta && (
          <Action onClick={cta.onClick} $variant={variant}>
            {cta.label}
          </Action>
        )}
      </StyledText>
    </InlineAlertContainer>
  );
};

const StyledText = styled(Text)<{
  type: InlineAlertVariant;
}>`
  ${({ type }) => css`
    ${createTextStyles(type)};
    vertical-align: middle;
  `}
`;

const InlineAlertContainer = styled(Box)<{
  $variant: InlineAlertVariant;
}>`
  ${({ theme, $variant }) => css`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: ${theme.spacing[3]};
    gap: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
    ${createBackgroundStyles($variant)};

    ${
      $variant === 'neutral' &&
      css`
        border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      `
    }
  `};
`;

const IconContainer = styled(Stack)`
  ${({ theme }) => css`   
    height: ${theme.typography['body-3'].lineHeight};
    align-items: center;
    flex: 0;
  `}
`;

const Action = styled.button<{
  $variant: InlineAlertVariant;
}>`
  ${({ theme, $variant }) => css`
    all: unset;
    display: inline;
    margin-left: ${theme.spacing[2]};
    color: currentColor;
    background: unset;
    border: unset;
    cursor: pointer;
    text-decoration: underline;
    ${createFontStyles('label-3')};

    &:active {
      opacity: 0.85;
    }

    @media (hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }

    &:active,
    &:hover {
      color: currentColor;
    }

    ${
      $variant === 'neutral' &&
      css`
        color: ${theme.color.accent};
      `
    }
  `}
`;

export default InlineAlert;
