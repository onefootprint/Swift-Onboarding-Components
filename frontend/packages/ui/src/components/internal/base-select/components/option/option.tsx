import { IcoCheck16 } from '@onefootprint/icons';
import React from 'react';
import Highlighter from 'react-highlight-words';
import type { CommonPropsAndClassName, GroupBase } from 'react-select';
import styled, { css, useTheme } from 'styled-components';

import {
  createFontStyles,
  createOverlayBackground,
} from '../../../../../utils/mixins';

export type OptionProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = CommonPropsAndClassName<Option, IsMulti, Group> & {
  innerProps: JSX.IntrinsicElements['div'];
  label: string;
  isFocused: boolean;
  isSelected: boolean;
};

const Option = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({
  isSelected,
  selectProps,
  isFocused,
  innerProps,
  label,
}: OptionProps<Option, IsMulti, Group>) => {
  const theme = useTheme();
  const { inputValue } = selectProps;

  return (
    <OptionContainer
      highlighted={isFocused}
      id={innerProps.id}
      onClick={innerProps.onClick}
      onMouseMove={innerProps.onMouseMove}
      onMouseOver={innerProps.onMouseOver}
      role="option"
      tabIndex={innerProps.tabIndex}
    >
      <Content>
        <Highlighter
          searchWords={inputValue.split(' ')}
          textToHighlight={label}
          highlightStyle={{
            background: 'none',
            color: theme.color.primary,
            fontWeight: 600,
          }}
        >
          {label}
        </Highlighter>
      </Content>
      {isSelected && <IcoCheck16 color="primary" />}
    </OptionContainer>
  );
};

const OptionContainer = styled.div<{
  highlighted: boolean;
}>`
  ${({ theme, highlighted }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    background: ${theme.backgroundColor.primary};
    color: ${theme.color.secondary};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    left: 0;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
    position: absolute;
    top: 0;
    width: 100%;

    ${highlighted &&
    css`
      ${createOverlayBackground('darken-1', 'primary')};
    `}
  `}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
`;

export default Option;
