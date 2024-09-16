import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { styled } from 'styled-components';
import { css } from 'styled-components';
import BaseItemContainer from '../base-item-container';
import type { RadioItemProps } from '../dropdown.types';
import RadioIndicator from '../item-indicator';

const RadioItem = ({ value, children, height, onSelect }: RadioItemProps) => {
  return (
    <RadixDropdown.RadioItem value={value} onSelect={onSelect} asChild>
      <BaseItemContainer layout="radio-item" $height={height}>
        <Content>{children}</Content>
        <IndicatorWrapper>
          <RadioIndicator />
        </IndicatorWrapper>
      </BaseItemContainer>
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
