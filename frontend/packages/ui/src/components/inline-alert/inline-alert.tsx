import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps } from '../box';
import Box from '../box';
import Stack from '../stack';
import Text from '../text';
import type { InlineAlertVariant } from './inline-alert.types';
import { createBackgroundStyles, createTextStyles, getIconForVariant } from './inline-alert.utils';

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
      <Stack flex={0} marginTop={1}>
        <IconComponent color={variant} />
      </Stack>
      <StyledText type={variant} variant="body-3">
        {children}
        {cta && <Action onClick={cta.onClick}>{cta.label}</Action>}
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
    ${createBackgroundStyles($variant)};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]};
    width: 100%;
  `};
`;

const Action = styled.button`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('label-3')};
    color: currentColor;
    background: unset;
    border: unset;
    cursor: pointer;
    text-decoration: underline;
    display: inline;
    margin-left: ${theme.spacing[2]};

    &:active {
      color: currentColor;
      opacity: 0.85;
    }

    @media (hover: hover) {
      &:hover {
        color: currentColor;
        opacity: 0.7;
      }
    }
  `}
`;

export default InlineAlert;
