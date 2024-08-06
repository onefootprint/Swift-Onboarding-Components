import { IcoCheck16 } from '@onefootprint/icons';
import Highlighter from 'react-highlight-words';
import type { CommonPropsAndClassName, GroupBase } from 'react-select';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../../utils/mixins';
import Text from '../../../../text';
import type { BaseSelectOption } from '../../base-select.types';

export type OptionProps<
  Option extends BaseSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = CommonPropsAndClassName<Option, IsMulti, Group> & {
  innerProps: JSX.IntrinsicElements['div'];
  label: string;
  data: Option;
  isFocused: boolean;
  isSelected: boolean;
};

const Option = <Option extends BaseSelectOption, IsMulti extends boolean, Group extends GroupBase<Option>>({
  isSelected,
  selectProps,
  isFocused,
  innerProps,
  label,
  data,
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
        {data.description && (
          <Text variant="caption-2" color="tertiary">
            {data.description}
          </Text>
        )}
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
  ${({ theme }) => css`
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[1]};
  `}
`;

export default Option;
