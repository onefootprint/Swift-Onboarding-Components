import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { styled } from 'styled-components';
import { css } from 'styled-components';
import BaseItem from '../base-item';
import type { RadioItemProps } from '../dropdown.types';
import ItemIndicator from '../item-indicator';

const RadioItem = ({ value, children, height, onSelect }: RadioItemProps) => {
  return (
    <RadixDropdown.RadioItem value={value} onSelect={onSelect} asChild>
      <BaseItem $layout="radio-item" $height={height}>
        <Content>{children}</Content>
        <IndicatorWrapper>
          <ItemIndicator />
        </IndicatorWrapper>
      </BaseItem>
    </RadixDropdown.RadioItem>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[3]};
    flex-wrap: nowrap;
    flex: 1;
  `}; 
`;

const IndicatorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default RadioItem;
