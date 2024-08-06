/* eslint-disable @next/next/no-img-element */
import type * as CSS from 'csstype';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import type { AnimatedLoadingSpinnerProps } from '../animated-loading-spinner';
import AnimatedLoadingSpinner from '../animated-loading-spinner';
import type { AvatarSize } from './avatar.types';

export type AvatarProps = {
  loading?: boolean;
  name: string;
  size?: AvatarSize;
  src?: string | null;
};

const Avatar = ({ loading = false, name, size = 'default', src }: AvatarProps) => {
  if (loading) {
    return (
      <Fallback data-size={size} data-variant={src ? 'secondary' : 'primary'}>
        <AnimatedLoadingSpinner animationStart size={loadingIndicatorSize[size]} />
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

const sizes: Record<AvatarSize, CSS.Property.Width | CSS.Property.Height> = {
  compact: '24px',
  default: '32px',
  large: '40px',
  xlarge: '72px',
};

export const loadingIndicatorSize: Record<AvatarSize, AnimatedLoadingSpinnerProps['size']> = {
  compact: 20,
  default: 24,
  large: 32,
  xlarge: 32,
};

const ImageContainer = styled.div<{
  height: CSS.Property.Height;
  width: CSS.Property.Width;
}>`
  ${({ theme, height, width }) => css`
    background: ${theme.backgroundColor.primary};
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    padding: ${theme.spacing[2]};
    height: ${height};
    width: ${width};
    img {
      width: ${width};
      height: ${height};
      object-fit: contain;
    }

    &[data-size='xlarge'] {
      padding: ${theme.spacing[4]};
    }
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
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
