import { Property } from 'csstype';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';
import type { AvatarSize } from './avatar.types';

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: AvatarSize;
};

const Avatar = ({ name, src, size = 'default' }: AvatarProps) =>
  src ? (
    <Image src={src} alt={name} height={sizes[size]} width={sizes[size]} />
  ) : (
    <Fallback role="img" aria-label={name} data-size={size}>
      {name.charAt(0)}
    </Fallback>
  );

const sizes: Record<AvatarSize, Property.Width | Property.Height> = {
  compact: '24px',
  default: '32px',
  large: '40px',
};

const Image = styled.img`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
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
    user-select: none;
    text-transform: uppercase;

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
  `}
`;

export default Avatar;
