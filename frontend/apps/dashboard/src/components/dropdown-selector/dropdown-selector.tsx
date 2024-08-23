import { IcoCheck16, IcoChevronDown16 } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import * as Select from '@radix-ui/react-select';
import type React from 'react';
import styled, { css } from 'styled-components';

export type Option<T> = {
  id: string;
  name: string;
  customData?: T;
};

export type DropdownSelectorProps<T> = {
  onValueChange: (value: string) => void;
  triggerAriaLabel: string;
  value: Option<T>;
  options?: Option<T>[];
  renderCustomData?: (option: Option<T>) => React.ReactNode;
};

const DropdownSelector = <T,>({
  onValueChange,
  triggerAriaLabel,
  value,
  options,
  renderCustomData,
}: DropdownSelectorProps<T>) => (
  <Select.Root value={value.id} onValueChange={onValueChange}>
    <Trigger aria-label={triggerAriaLabel}>
      <Select.Value asChild>
        <Value>{value.name}</Value>
      </Select.Value>
      <IcoChevronDown16 />
    </Trigger>
    <Content position="popper" sideOffset={5}>
      <Select.Viewport>
        {options?.map(option => (
          <Item value={option.id} textValue={option.name} key={option.id}>
            <Select.ItemText asChild>
              <ItemText>
                <Name>{option.name}</Name>
                {renderCustomData?.(option)}
              </ItemText>
            </Select.ItemText>
            <Select.ItemIndicator>
              <IcoCheck16 />
            </Select.ItemIndicator>
          </Item>
        ))}
      </Select.Viewport>
      <Select.ScrollDownButton />
    </Content>
  </Select.Root>
);

const Trigger = styled(Select.Trigger)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    background: unset;
    border: unset;
    cursor: pointer;
    display: flex;
    gap: ${theme.spacing[2]};
    padding: unset;
    overflow: hidden;
    max-width: 100%;
    white-space: nowrap;
  `}
`;

const ItemText = styled.div`
  ${({ theme }) => css`
    width: calc(100% - ${theme.spacing[7]});
    white-space: pre-line;
  `}
`;

const Value = styled.span`
  ${({ theme }) => css`
    text-overflow: ellipsis;
    overflow: hidden;
    width: calc(100% - ${theme.spacing[5]});
    white-space: nowrap;
  `}
`;

const Content = styled(Select.Content)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      background: ${dropdown.bg};
      border-radius: ${dropdown.borderRadius};
      border: ${dropdown.borderWidth} solid ${dropdown.borderColor}};
      box-shadow: ${dropdown.elevation};
      max-height: 380px;
      overflow: hidden;
      width: 360px;
      z-index: ${theme.zIndex.dropdown};
      padding: ${theme.spacing[2]};
    `;
  }}
`;

export const Item = styled(Select.Item)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      align-items: center;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      outline: none;
      padding: ${theme.spacing[3]} ${theme.spacing[5]};
      border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});

      &[data-highlighted] {
        background: ${dropdown.hover.bg};
      }

      @media (hover: hover) {
        &:hover {
          background: ${dropdown.hover.bg};
        }
      }

      > span:first-of-type {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[1]};
      }
    `;
  }}
`;

export const Name = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.primary};
  `}
`;

export default DropdownSelector;
