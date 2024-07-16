import { IcoClose24, IcoClose32, IcoSearch24 } from '@onefootprint/icons';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useMemo, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Modal } from 'react-native';
import styled, { css } from 'styled-components/native';

import Box from '../../box';
import IconButton from '../../icon-button';
import Pressable from '../../pressable';
import TextInput from '../../text-input';
import Typography from '../../typography';
import type { BaseOption, SelectOption } from '../select.types';
import EmptyState from './empty-state';
import Item from './item';

export type PickerProps<T extends BaseOption = BaseOption<string>> = {
  emptyStateResetText: string;
  emptyStateText: string;
  onChange?: (newValue: SelectOption<T>) => void;
  onClose: () => void;
  open: boolean;
  options: SelectOption<T>[];
  searchInputProps?: TextInputProps;
  title: string;
  value?: SelectOption<T>;
};

const Picker = <T extends BaseOption = BaseOption<string>>({
  emptyStateResetText,
  emptyStateText,
  onChange,
  onClose,
  open,
  options,
  title,
  searchInputProps = {},
  value,
}: PickerProps<T>) => {
  const [search, setSearch] = useState('');
  const selectedIndex = useMemo(() => {
    if (!value) return undefined;
    const index = options.findIndex(option => option.value === value?.value);
    if (index === -1 || index < 15) return undefined;
    // we want to show the item above the selected item, to make
    // clear users can scroll up
    return index - 2;
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(option => {
      return option.label.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, options]);

  useEffect(() => {
    if (!open) resetSearch();
  }, [open]);

  const resetSearch = () => {
    setSearch('');
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="formSheet" visible={open}>
      <PickerContainer>
        <Box flexDirection="row" margin={5} center position="relative">
          <Typography variant="label-2">{title}</Typography>
          <Box position="absolute" right={0}>
            <IconButton aria-label="Close" onPress={onClose}>
              <IcoClose32 />
            </IconButton>
          </Box>
        </Box>
        <Box borderBottomColor="tertiary" borderBottomWidth={1} paddingHorizontal={4} paddingVertical={5}>
          <SearchInput
            autoCorrect={false}
            autoFocus
            onChangeText={setSearch}
            blurOnSubmit
            returnKeyType="search"
            {...searchInputProps}
            value={search}
            prefixComponent={
              <Box marginLeft={4} marginVertical={5}>
                <IcoSearch24 />
              </Box>
            }
            suffixComponent={
              <Pressable onPress={resetSearch}>
                <Box marginRight={4} marginVertical={5}>
                  <IcoClose24 color="tertiary" />
                </Box>
              </Pressable>
            }
          />
        </Box>
        <FlashList
          contentContainerStyle={contentContainerStyle}
          data={filteredOptions}
          estimatedItemSize={48}
          initialScrollIndex={selectedIndex}
          keyboardShouldPersistTaps="always"
          ListEmptyComponent={
            <EmptyState
              title={emptyStateText}
              cta={{
                label: emptyStateResetText,
                onPress: resetSearch,
              }}
            />
          }
          keyExtractor={item => item.value.toString()}
          renderItem={({ item }) => {
            return <Item label={item.label} onPress={() => onChange?.(item)} selected={value?.value === item.value} />;
          }}
        />
      </PickerContainer>
    </Modal>
  );
};

const PickerContainer = styled(Box)`
  ${({ theme }) => {
    const { dropdown } = theme.components;
    return css`
      background-color: ${dropdown.bg};
      height: 100%;
    `;
  }}
`;

const SearchInput = styled(TextInput)`
  ${({ theme }) => {
    return css`
      padding-left: ${theme.spacing[9]};
    `;
  }}
`;

const contentContainerStyle = {
  paddingVertical: 16,
};

export default Picker;
