import { IcoCheckSmall16 } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import * as RadixSelect from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { css, styled } from 'styled-components';

type Size = 'default' | 'compact';

const HEIGHT = {
  default: '36px',
  compact: '32px',
};

type ItemProps = RadixSelect.SelectItemProps & {
  size?: Size;
  showChecked?: boolean;
  value: string;
};

const Item = forwardRef<HTMLDivElement, ItemProps>(
  ({ children, size = 'default', showChecked, value, ...props }, ref) => {
    return (
      <RadixSelect.Item {...props} value={value} asChild>
        <Container $size={size} ref={ref}>
          <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
          {showChecked && (
            <RadixSelect.ItemIndicator>
              <CheckContainer>
                <IcoCheckSmall16 />
              </CheckContainer>
            </RadixSelect.ItemIndicator>
          )}
        </Container>
      </RadixSelect.Item>
    );
  },
);

const Container = styled.div<{ $size?: Size }>`
  ${({ theme, $size }) => css`
    ${createFontStyles('body-3')}
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: ${HEIGHT[$size || 'default']};
    padding-left: ${$size === 'compact' ? theme.spacing[3] : theme.spacing[4]};
    padding-right: ${theme.spacing[4]}; 
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
    background-color: ${theme.backgroundColor.primary};
    transition: background-color 0.05s ease-in-out;
    position: relative; 

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[data-highlighted] {
      background-color: ${theme.backgroundColor.secondary};
      outline: none;
    }

    &:focus-visible:not(:hover) {
      outline: ${theme.borderWidth[2]} solid ${theme.color.accent};
      outline-offset: ${theme.borderWidth[1]};
    }

    &[data-disabled] {
      color: ${theme.color.quaternary};
      cursor: initial;
    }
  `}
`;

const CheckContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: ${theme.spacing[4]};
    top: 0;
    height: 100%;
  `}
`;

export default Item;
