import { IcoCheckSmall16 } from '@onefootprint/icons';
import * as RadixSelect from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { css, styled } from 'styled-components';
import { createFontStyles } from '../../../../utils/mixins';
import Text from '../../../text';

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
          <RadixSelect.ItemText asChild>
            <Text variant="body-3" width="100%" truncate>
              {children}
            </Text>
          </RadixSelect.ItemText>
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
    display: flex;
    align-items: center;
    width: 100%;
    height: ${HEIGHT[$size || 'default']};
    padding-left: ${$size === 'compact' ? theme.spacing[3] : theme.spacing[4]};
    padding-right: ${theme.spacing[4]};
    position: relative;
    cursor: pointer;
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
    background-color: ${theme.backgroundColor.transparent};
    transition: background-color 0.05s ease-in-out;
    overflow: hidden;

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
    padding-left: ${theme.spacing[2]};
    flex-shrink: 0;
  `}
`;

export default Item;
