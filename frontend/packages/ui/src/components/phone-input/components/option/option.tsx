import { IcoCheck16 } from '@onefootprint/icons';
import type React from 'react';
import Highlighter from 'react-highlight-words';
import type { CommonPropsAndClassName, GroupBase } from 'react-select';
import styled, { css, useTheme } from 'styled-components';

import { createFontStyles, createOverlayBackground } from '../../../../utils/mixins';
import Flag from '../../../flag';
import type { PhoneSelectOption } from '../../phone-input.types';

export interface OptionProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends CommonPropsAndClassName<Option, IsMulti, Group> {
  innerRef: React.RefCallback<HTMLDivElement>;
  innerProps: JSX.IntrinsicElements['div'];
  data: Option;
  isFocused: boolean;
  isSelected: boolean;
}

const Option = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>({
  innerRef,
  isFocused,
  isSelected,
  innerProps,
  data,
  selectProps,
}: OptionProps<Option, IsMulti, Group>) => {
  const theme = useTheme();
  const { inputValue } = selectProps;
  const { label, value } = data as unknown as PhoneSelectOption;

  return (
    <OptionContainer
      ref={innerRef}
      highlighted={isFocused}
      id={innerProps.id}
      onClick={innerProps.onClick}
      onMouseMove={innerProps.onMouseMove}
      onMouseOver={innerProps.onMouseOver}
      role="option"
      tabIndex={innerProps.tabIndex}
    >
      <Content>
        <StyledFlag code={value} />
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
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    position: absolute;
    top: 0;
    width: 100%;

    ${
      highlighted &&
      css`
      ${createOverlayBackground('darken-1', 'primary')};
    `
    }
  `}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFlag = styled(Flag)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
  `}
`;

export default Option;
