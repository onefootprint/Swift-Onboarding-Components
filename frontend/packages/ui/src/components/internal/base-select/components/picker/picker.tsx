import { IcoClose24 } from '@onefootprint/icons';
import FocusTrap from 'focus-trap-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useOnClickOutside } from '../../../../../hooks';
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

enum State {
  open = 'open',
  opening = 'opening',
  closed = 'closed',
  closing = 'closing',
}

const OPEN_CLOSE_DELAY = 200;

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
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [hasScroll, setHasScroll] = useState(false);
  const [visibleState, setVisibleState] = useState<State>(State.closed);
  useOnClickOutside(bottomSheetRef, () => {
    if (open) {
      onClose?.();
    }
  });

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.scrollTop > 0 && !hasScroll) {
      setHasScroll(true);
    }
    if (target.scrollTop <= 0 && hasScroll) {
      setHasScroll(false);
    }
  };

  useEffectOnce(() => {
    setVisibleState(open ? State.open : State.closed);
  });

  useEffect(() => {
    if (visibleState === State.opening || visibleState === State.closing) {
      return;
    }

    if (visibleState === State.open && !open) {
      setVisibleState(State.closing);
      setTimeout(() => {
        setVisibleState(State.closed);
      }, OPEN_CLOSE_DELAY);
      return;
    }

    if (visibleState === State.closed && open) {
      setVisibleState(State.opening);
      setTimeout(() => {
        setVisibleState(State.open);
      }, OPEN_CLOSE_DELAY);
    }
  }, [open, visibleState]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options?.filter(option => option?.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, options]);

  useEffect(() => {
    if (!open) resetSearch();
  }, [open]);

  const resetSearch = () => {
    setSearch('');
  };

  return visibleState === State.closed ? null : (
    <FocusTrap active={open}>
      <span>
        <Sheet className={visibleState} role="dialog" ref={bottomSheetRef} height={height}>
          <Header>
            <CloseContainer onClick={onClose}>
              <IconButton aria-label="close" onClick={onClose}>
                <IcoClose24 />
              </IconButton>
            </CloseContainer>
            <Text variant="label-2">Search...</Text>
          </Header>
          <Content>
            <SearchContainer $hasScroll={hasScroll}>
              <Input
                placeholder={placeholder}
                id={id}
                onChangeText={setSearch}
                onReset={resetSearch}
                tabIndex={0}
                value={search}
                data-dd-privacy="mask"
              />
            </SearchContainer>
            <OptionsContainer maxHeight={height - 100} onScroll={handleScroll}>
              {filteredOptions?.length
                ? filteredOptions.map(option => (
                    <OptionComponent option={option} value={value} onSelect={() => onChange(option)} />
                  ))
                : renderEmptyState()}
            </OptionsContainer>
          </Content>
        </Sheet>
        <Overlay aria-modal isVisible={open} />
      </span>
    </FocusTrap>
  );
};

const Sheet = styled.div<{ height: number }>`
  ${({ theme, height }) => css`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
    z-index: ${theme.zIndex.bottomSheet};
    align-self: end;
    transition: all 0.2s linear;
    height: ${height}px;
    &.open {
      translateY(0%);
    }
    &.opening,
    &.closing {
      transform: translateY(100%);
    }
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[3]};
    left: ${theme.spacing[3]};
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
