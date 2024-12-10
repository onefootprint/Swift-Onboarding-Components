import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { IcoArrowTopRight16 } from '@onefootprint/icons';

import type { ItemProps } from '../dropdown.types';

import Stack from '../../stack';
import BaseItem from '../base-item';

const Item = forwardRef<HTMLDivElement, ItemProps>(
  ({ iconLeft: IconLeft, iconRight, children, asLink, size, variant, height, onSelect, ...props }, ref) => {
    const IconRight = asLink ? StyledIcoArrowTopRight16 : iconRight;

    return (
      <RadixDropdown.Item {...props} onSelect={onSelect} asChild>
        <BaseItem ref={ref} size={size} variant={variant} $height={height} $layout="default">
          {IconLeft && <IconLeft color={variant === 'destructive' ? 'error' : undefined} />}
          <Stack direction="column" gap={1} flex={1} textDecoration="none">
            {children}
          </Stack>
          {IconRight && <IconRight />}
        </BaseItem>
      </RadixDropdown.Item>
    );
  },
);

const StyledIcoArrowTopRight16 = styled(IcoArrowTopRight16)`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

export default Item;
