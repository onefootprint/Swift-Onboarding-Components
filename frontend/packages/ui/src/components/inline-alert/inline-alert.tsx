/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps } from '../box';
import Box from '../box';
import Stack from '../stack';
import type { InlineAlertVariant } from './inline-alert.types';
import { createVariantStyles, getIconForVariant } from './inline-alert.utils';

export type InlineAlertProps = BoxProps & {
  variant: InlineAlertVariant;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

const InlineAlert = ({
  cta,
  children,
  variant = 'info',
  ...props
}: InlineAlertProps) => {
  const IconComponent = getIconForVariant(variant);

  return (
    <InlineAlertContainer role="alert" $variant={variant} {...props}>
      <Stack marginRight={3}>
        <IconComponent color={variant} />
      </Stack>
      <ContentContainer $variant={variant}>
        <Box>{children}</Box>
        {cta && (
          <button onClick={cta.onClick} type="button">
            {cta.label}
          </button>
        )}
      </ContentContainer>
    </InlineAlertContainer>
  );
};

const InlineAlertContainer = styled(Box)<{
  $variant: InlineAlertVariant;
}>`
  ${({ theme, $variant }) => css`
    ${createFontStyles('body-3')};
    ${createVariantStyles($variant)};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    width: 100%;

    a,
    button {
      ${createFontStyles('label-3')};
      color: currentColor;
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: underline;

      @media (hover: hover) {
        &:hover {
          color: currentColor;
          opacity: 0.7;
        }
      }

      &:active {
        color: currentColor;
        opacity: 0.85;
      }
    }
  `};
`;

const ContentContainer = styled.div<{
  $variant: InlineAlertVariant;
}>`
  ${({ $variant }) => css`
    ${createVariantStyles($variant)};
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
  `};
`;

export default InlineAlert;
