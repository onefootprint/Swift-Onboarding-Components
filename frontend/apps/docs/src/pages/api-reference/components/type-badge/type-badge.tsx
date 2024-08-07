import { UIStates } from '@onefootprint/design-tokens';
import { Badge, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import { HttpMethod } from '../../api-reference.types';

type TypeBadgeProps = {
  type: HttpMethod;
  skinny?: boolean;
};

export const COLOR_FOR_METHOD: Record<HttpMethod, keyof UIStates> = {
  post: 'success',
  get: 'neutral',
  delete: 'error',
  patch: 'warning',
  put: 'warning',
  options: 'neutral',
  head: 'neutral',
  trace: 'neutral',
};

const TypeBadge = ({ type, skinny = false }: TypeBadgeProps) => {
  return (
    <StyledBadge variant={COLOR_FOR_METHOD[type]} skinny={skinny}>
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
