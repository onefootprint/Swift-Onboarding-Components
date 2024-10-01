import { IcoClose24 } from '@onefootprint/icons';
import * as Dialog from '@radix-ui/react-dialog';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import Box from '../../../../box';
import IconButton from '../../../../icon-button';
import Overlay from '../../../../overlay';
import SearchInput from '../../../../search-input';
import Text from '../../../../text';
import type { BaseSelectOption } from '../../base-select.types';
import type { ItemProps } from './components/item';
import Item from './components/item';

type PickerProps = {
  open: boolean;
  onClose: () => void;
  height: number;
  id?: string;
  placeholder?: string;
  options?: BaseSelectOption[];
  value?: BaseSelectOption;
  renderEmptyState: () => JSX.Element;
  onChange: (newValue: BaseSelectOption) => void;
  OptionComponent?: React.ComponentType<ItemProps>;
};

const Picker = ({
  open,
  onClose,
  height,
  id,
  placeholder,
  value,
  options,
  renderEmptyState,
  onChange,
  OptionComponent = Item,
}: PickerProps) => {
  const [search, setSearch] = useState('');
  const [hasScroll, setHasScroll] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    setHasScroll(target.scrollTop > 0);
  };

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options?.filter(option => option?.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, options]);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <Overlay isVisible={open} />
        </Dialog.Overlay>
        <DialogContent height={height}>
          <Header>
            <Dialog.Close asChild>
              <IconAligner>
                <IconButton aria-label="close" variant="ghost" onClick={handleClose}>
                  <IcoClose24 />
                </IconButton>
              </IconAligner>
            </Dialog.Close>
            <Text variant="label-2">Search...</Text>
          </Header>
          <Content>
            <SearchContainer $hasScroll={hasScroll}>
              <Input
                placeholder={placeholder}
                id={id}
                onChangeText={setSearch}
                onReset={() => setSearch('')}
                tabIndex={0}
                value={search}
                data-dd-privacy="mask"
              />
            </SearchContainer>
            <OptionsContainer maxHeight={height - 100} onScroll={handleScroll}>
              {filteredOptions?.length
                ? filteredOptions.map(option => (
                    <OptionComponent
                      key={option.value}
                      option={option}
                      value={value}
                      onSelect={() => onChange(option)}
                    />
                  ))
                : renderEmptyState()}
            </OptionsContainer>
          </Content>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const IconAligner = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: ${theme.spacing[3]};
    right: ${theme.spacing[3]};
  `}
`;

const DialogContent = styled(Dialog.Content)<{ height: number }>`
  ${({ theme, height }) => css`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
    z-index: ${theme.zIndex.bottomSheet};
    height: ${height}px;
    animation: slideUp 150ms cubic-bezier(0.16, 1, 0.3, 1);

    &[data-state="closed"] {
      animation: slideDown 150ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @keyframes slideDown {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    height: 40px;
    padding-top: ${theme.spacing[5]};
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
  `}
`;

const OptionsContainer = styled.div<{ maxHeight: number }>`
  ${({ maxHeight }) => css`
    overflow-y: auto;
    max-height: ${maxHeight}px;
  `}
`;

const Input = styled(SearchInput)`
  min-height: 40px;
`;

const SearchContainer = styled.div<{ $hasScroll: boolean }>`
  ${({ theme, $hasScroll }) => css`
    padding-bottom: ${theme.spacing[5]};
    ${
      $hasScroll &&
      css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    `
    }
  `}
`;

export default Picker;
