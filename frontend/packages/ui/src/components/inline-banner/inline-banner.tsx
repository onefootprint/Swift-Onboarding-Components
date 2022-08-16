import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { InlineBannerVariant } from './inline-banner.types';
import { createVariantStyles, getIconForVariant } from './inline-banner.utils';

export type InlineBannerProps = {
  children: React.ReactNode;
  variant: InlineBannerVariant;
};

const InlineBanner = ({ children, variant }: InlineBannerProps) => {
  const IconComponent = getIconForVariant(variant);
  return (
    <InlineBannerContainer role="alert" variant={variant}>
      <IconComponent color={variant} />
      {children}
    </InlineBannerContainer>
  );
};

const InlineBannerContainer = styled.div<{ variant: InlineBannerVariant }>`
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

export default InlineBanner;
