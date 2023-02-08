/* eslint-disable @next/next/no-img-element */
import { Property } from 'csstype';
import * as CSS from 'csstype';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import LoadingIndicator, { LoadingIndicatorProps } from '../loading-indicator';
import type { AvatarSize } from './avatar.types';

export type AvatarProps = {
  loading?: boolean;
  name: string;
  size?: AvatarSize;
  src?: string | null;
};

const Avatar = ({
  loading = false,
  name,
  size = 'default',
  src,
}: AvatarProps) => {
  if (loading) {
    return (
      <Fallback data-size={size} data-variant={src ? 'secondary' : 'primary'}>
        <LoadingIndicator size={loadingIndicatorSize[size]} />
      </Fallback>
    );
  }

  return src ? (
    <ImageContainer height={sizes[size]} width={sizes[size]} data-size={size}>
      <img src={src} alt={name} />
    </ImageContainer>
  ) : (
    <Fallback role="img" aria-label={name} data-size={size}>
      {name.charAt(0)}
    </Fallback>
  );
};

const sizes: Record<AvatarSize, Property.Width | Property.Height> = {
  compact: '24px',
  default: '32px',
  large: '40px',
  xlarge: '72px',
};

export const loadingIndicatorSize: Record<
  AvatarSize,
  LoadingIndicatorProps['size']
> = {
  compact: 'compact',
  default: 'compact',
  large: 'default',
  xlarge: 'default',
};

const ImageContainer = styled.div<{
  height: CSS.Property.Height;
  width: CSS.Property.Width;
}>`
  ${({ theme, height, width }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: fit-content;
    padding: ${theme.spacing[2]};
    height: ${height};
    width: ${width};
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &[data-size='xlarge'] {
      padding: ${theme.spacing[4]};
    }
  `}
`;

const Fallback = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.quaternary};
    border-radius: ${theme.borderRadius.full};
    color: ${theme.color.primary};
    display: flex;
    justify-content: center;
    text-transform: uppercase;
    user-select: none;

    &[data-variant='secondary'] {
      background: ${theme.backgroundColor.primary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }

    &[data-size='compact'] {
      ${createFontStyles('label-3')};
      height: ${sizes.compact};
      width: ${sizes.compact};
    }

    &[data-size='default'] {
      ${createFontStyles('label-2')};
      height: ${sizes.default};
      width: ${sizes.default};
    }

    &[data-size='large'] {
      ${createFontStyles('label-1')};
      height: ${sizes.large};
      width: ${sizes.large};
    }

    &[data-size='xlarge'] {
      ${createFontStyles('display-3')};
      height: ${sizes.xlarge};
      width: ${sizes.xlarge};
    }
  `}
`;

export default Avatar;
