import { IcoCheck16 } from '@onefootprint/icons';
import React from 'react';
import Highlighter from 'react-highlight-words';
import type { CommonPropsAndClassName, GroupBase } from 'react-select';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../../utils/mixins';

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
  const { inputValue } = selectProps;

  return (
    <OptionContainer
      data-highlighted={isFocused}
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

const OptionContainer = styled.div`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      ${createFontStyles('body-3')};
      align-items: center;
      background: ${dropdown.bg};
      color: ${dropdown.colorPrimary};
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      left: 0;
      padding: ${theme.spacing[3]} ${theme.spacing[5]};
      position: absolute;
      top: 0;
      width: 100%;

      @media (hover: hover) {
        &[data-highlighted='true'],
        &:hover {
          background: ${dropdown.hover.bg};
        }
      }
    `;
  }}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
`;

export default Option;
