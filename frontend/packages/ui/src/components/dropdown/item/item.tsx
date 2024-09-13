import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { IcoArrowTopRight16 } from '@onefootprint/icons';

import type { ItemProps } from '../dropdown.types';

import Stack from '../../stack';
import BaseItemContainer from '../base-item-container';

const Item = ({
  iconLeft: IconLeft,
  iconRight,
  children,
  checked,
  asLink,
  size,
  variant,
  height,
  ...props
}: ItemProps) => {
  const IconRight = asLink ? StyledIcoArrowTopRight16 : iconRight;
  return (
    <RadixDropdown.Item {...props} asChild>
      <BaseItemContainer size={size} variant={variant} $height={height} layout="default">
        {IconLeft && <IconLeft color={variant === 'destructive' ? 'error' : undefined} />}
        <Stack direction="column" gap={1} flex={1} textDecoration="none">
          {children}
        </Stack>
        {IconRight && <IconRight />}
      </BaseItemContainer>
    </RadixDropdown.Item>
  );
};

const StyledIcoArrowTopRight16 = styled(IcoArrowTopRight16)`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

export default Item;
