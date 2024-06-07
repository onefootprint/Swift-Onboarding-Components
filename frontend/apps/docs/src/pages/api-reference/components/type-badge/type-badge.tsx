import { Badge, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type TypeBadgeProps = {
  type: string;
  skinny?: boolean;
};

const TypeBadge = ({ type, skinny = false }: TypeBadgeProps) => {
  const assignVariant = () => {
    switch (type) {
      case 'post':
        return 'success';
      case 'get':
        return 'neutral';
      case 'delete':
        return 'error';
      case 'patch':
        return 'warning';
      default:
        return 'neutral';
    }
  };
  return (
    <StyledBadge variant={assignVariant()} skinny={skinny}>
      {type}
    </StyledBadge>
  );
};

const StyledBadge = styled(Badge)<{ skinny: boolean }>`
  ${({ theme, skinny }) => css`
    ${createFontStyles(skinny ? 'snippet-3' : 'caption-3')}
    padding: ${skinny ? theme.spacing[2] : `${theme.spacing[2]} ${theme.spacing[3]}`};
    border-radius: ${theme.borderRadius.sm};
    width: fit-content;
    text-transform: uppercase;
  `}
`;

export default TypeBadge;
