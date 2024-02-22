import type { Icon } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils';
import Stack from '../../../stack';

type Size = 'compact' | 'default';
type ContentProps = {
  title: string;
  description?: string;
  IconComponent: Icon;
  selected: boolean;
  hovered: boolean;
  disabled?: boolean;
  size?: Size;
};

const getIconColor = (disabled: boolean | undefined, selected: boolean) => {
  if (disabled) return 'quaternary';
  return selected ? 'quinary' : 'primary';
};

const Content = ({
  size,
  hovered,
  selected,
  disabled,
  IconComponent,
  title,
  description,
}: ContentProps) => (
  <Container
    direction="row"
    gap={4}
    align="center"
    justify="left"
    hovered={hovered}
    selected={selected}
    disabled={disabled}
    size={size}
  >
    <IconContainer
      hovered={hovered}
      selected={selected}
      disabled={disabled}
      size={size}
      align="center"
      justify="center"
    >
      <IconComponent color={getIconColor(disabled, selected)} />
    </IconContainer>
    <OptionLabel>
      <Title
        disabled={disabled}
        hovered={hovered}
        selected={selected}
        size={size}
      >
        {title}
      </Title>
      {size === 'default' && (
        <Subtitle selected={selected} hovered={hovered} disabled={disabled}>
          {description}
        </Subtitle>
      )}
    </OptionLabel>
  </Container>
);

const Container = styled(Stack)<{
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  size?: Size;
}>`
  ${({ theme, selected, hovered, disabled, size }) => {
    const {
      components: { radioSelect },
    } = theme;
    return css`
      width: 100%;
      text-align: left;
      border-radius: ${theme.borderRadius.default};
      overflow: hidden;
      padding: ${size === 'compact' ? theme.spacing[4] : theme.spacing[5]};
      margin: 0;
      color: ${radioSelect.color};
      border: ${theme.borderWidth[1]} solid ${radioSelect.borderColor};

      ${selected &&
      css`
        background-color: ${radioSelect.selected.bg};
        border-color: ${radioSelect.selected.borderColor};
      `}

      ${hovered &&
      !selected &&
      css`
        background-color: ${radioSelect.hover.default.bg};
        border-color: ${radioSelect.hover.default.borderColor};
      `}
  
    ${disabled &&
      css`
        background-color: ${radioSelect.disabled.bg};
        border-color: ${radioSelect.disabled.borderColor};
        cursor: default;
        pointer-events: none;
        user-select: none;
      `}
    `;
  }}
`;

const Title = styled.h2<{
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  size?: Size;
}>`
  ${({ theme, selected, hovered, disabled, size }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      ${size === 'compact'
        ? createFontStyles('label-3')
        : createFontStyles('label-2')};

      color: ${radioSelect.color};

      ${selected &&
      css`
        color: ${radioSelect.selected.color};
      `};

      ${!selected &&
      hovered &&
      css`
        color: ${radioSelect.hover.default.color};
      `};

      ${disabled &&
      css`
        color: ${radioSelect.disabled.color};
      `};
    `;
  }}
`;

const Subtitle = styled.p<{
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
}>`
  ${({ theme, selected, hovered, disabled }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      ${createFontStyles('body-4')}
      color: ${radioSelect.color};

      ${selected &&
      css`
        color: ${radioSelect.color};
      `};

      ${!selected &&
      hovered &&
      css`
        color: ${radioSelect.hover.default.color};
      `};

      ${disabled &&
      css`
        color: ${radioSelect.disabled.color};
      `};
    `;
  }}
`;

const IconContainer = styled(Stack)<{
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  size?: Size;
}>`
  ${({ disabled, hovered, selected, size, theme }) => {
    const {
      components: { radioSelect },
    } = theme;
    return css`
      padding: ${theme.spacing[3]};
      border-radius: ${theme.borderRadius.full};
      transition: all 0.2s ease-out;
      margin-top: ${size === 'compact' ? 0 : theme.spacing[1]};
      background-color: ${radioSelect.components.icon.bg};

      ${hovered &&
      css`
        background-color: ${radioSelect.components.icon.hover.bg};
      `}

      ${selected &&
      css`
        background-color: ${radioSelect.components.icon.selected.bg};
      `}

      ${disabled &&
      css`
        background-color: ${radioSelect.components.icon.disabled.bg};
      `}
    `;
  }}
`;

const OptionLabel = styled.div`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[1]};
  `}
`;

export default Content;
