import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { InlineAlertVariant } from './inline-alert.types';
import { createVariantStyles, getIconForVariant } from './inline-alert.utils';

export type InlineAlertProps = {
  children: React.ReactNode;
  variant: InlineAlertVariant;
};

const InlineAlert = ({ children, variant }: InlineAlertProps) => {
  const IconComponent = getIconForVariant(variant);
  return (
    <InlineAlertContainer role="alert" variant={variant}>
      <IconComponent color={variant} />
      {children}
    </InlineAlertContainer>
  );
};

const InlineAlertContainer = styled.div<{ variant: InlineAlertVariant }>`
  ${({ theme, variant }) => css`
    ${createFontStyles('body-2')};
    ${createVariantStyles(variant)};
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    text-align: center;
    display: flex;
    align-items: center;
    width: 100%;
    border-radius: ${theme.borderRadius[2]}px;

    > :first-child {
      margin-right: ${theme.spacing[3]}px;
    }
  `};
`;

export default InlineAlert;
