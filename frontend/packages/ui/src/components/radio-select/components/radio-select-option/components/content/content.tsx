import type { Icon } from '@onefootprint/icons';
import type React from 'react';
import { useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

import { createFontStyles } from '../../../../../../utils';
import Stack from '../../../../../stack';

type Size = 'compact' | 'default';

type ContentProps = {
  title: string | JSX.Element;
  description?: string;
  IconComponent: Icon;
  selected: boolean;
  disabled?: boolean;
  size?: Size;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const getIconColor = (disabled: boolean | undefined, selected: boolean) => {
  if (disabled) return 'quaternary';
  return selected ? 'quinary' : 'primary';
};

const Content = ({ size, selected, disabled, IconComponent, title, description, onClick }: ContentProps) => {
  const optionRef = useRef(null);
  const hovered = useHover(optionRef);

  return (
    <Container
      $hovered={hovered}
      $selected={selected}
      aria-label={typeof title === 'string' ? title : 'option'}
      aria-selected={selected}
      disabled={disabled}
      onClick={onClick}
      ref={optionRef}
      type="button"
    >
      <Stack padding={size === 'compact' ? 4 : 5} gap={4} alignItems="center" justify="left">
        <IconContainer $disabled={disabled} $hovered={hovered} $selected={selected} $size={size}>
          <IconComponent color={getIconColor(disabled, selected)} />
        </IconContainer>
        <OptionLabel>
          <Title $disabled={disabled} $hovered={hovered} $selected={selected} $size={size}>
            {title}
          </Title>
          {size === 'default' && <Description $disabled={disabled}>{description}</Description>}
        </OptionLabel>
      </Stack>
    </Container>
  );
};

const Container = styled.button<{
  $selected?: boolean;
  $hovered?: boolean;
}>`
  ${({ theme, $selected, $hovered }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      all: unset;
      border-radius: ${theme.borderRadius.default};
      border: ${theme.borderWidth[1]} solid ${radioSelect.borderColor};
      display: flex;
      margin: 0;
      overflow: hidden;
      transition: all 0.2s ease-out;
      width: 100%;

      &:not(:disabled) {
        cursor: pointer;
        pointer-events: auto;

        ${
          $selected &&
          css`
            background-color: ${radioSelect.selected.bg};
            border-color: ${radioSelect.selected.borderColor};
          `
        }

        ${
          $hovered &&
          !$selected &&
          css`
            background-color: ${radioSelect.hover.initial.bg};
            border-color: ${radioSelect.hover.initial.borderColor};
        `
        }

      &:focus {
          border-color: ${radioSelect.selected.borderColor};
        }
      }

      &:disabled {
        background-color: ${radioSelect.disabled.bg};
        border-color: ${radioSelect.disabled.borderColor};
        cursor: default;
        pointer-events: none;
        user-select: none;
      }
    `;
  }}
`;

const Title = styled.div<{
  $selected?: boolean;
  $hovered?: boolean;
  $disabled?: boolean;
  $size?: Size;
}>`
  ${({ theme, $selected, $hovered, $disabled, $size }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      ${$size === 'compact' ? createFontStyles('label-3') : createFontStyles('label-2')};
      color: ${radioSelect.color};

      ${
        $selected &&
        css`
        color: ${radioSelect.selected.color};
      `
      };

      ${
        !$selected &&
        $hovered &&
        css`
          color: ${radioSelect.hover.initial.color};
        `
      };

      ${
        $disabled &&
        css`
        color: ${radioSelect.disabled.color};
      `
      };
    `;
  }}
`;

const Description = styled.p<{
  $selected?: boolean;
  $hovered?: boolean;
  $disabled?: boolean;
}>`
  ${({ theme, $disabled }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      ${createFontStyles('body-3')}
      color: ${radioSelect.color};

      ${
        $disabled &&
        css`
        color: ${radioSelect.disabled.color};
      `
      };
    `;
  }}
`;

const IconContainer = styled(Stack)<{
  $selected?: boolean;
  $hovered?: boolean;
  $disabled?: boolean;
  $size?: Size;
}>`
  ${({ $disabled, $hovered, $selected, $size, theme }) => {
    const {
      components: { radioSelect },
    } = theme;
    return css`
      align-items: center;
      justify-content: center;
      padding: ${theme.spacing[3]};
      border-radius: ${theme.borderRadius.full};
      transition: all 0.2s ease-out;
      margin-top: ${$size === 'compact' ? 0 : theme.spacing[1]};
      background-color: ${radioSelect.components.icon.bg};

      ${
        $hovered &&
        css`
        background-color: ${radioSelect.components.icon.hover.bg};
      `
      }

      ${
        $selected &&
        css`
        background-color: ${radioSelect.components.icon.selected.bg};
      `
      }

      ${
        $disabled &&
        css`
        background-color: ${radioSelect.components.icon.disabled.bg};
      `
      }
    `;
  }}
`;

const OptionLabel = styled.div`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[1]};
  `}
`;

export default Content;
