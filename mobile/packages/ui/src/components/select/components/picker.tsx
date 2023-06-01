import { IcoClose32, IcoSearch24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-native';

import { Box } from '../../box';
import { IconButton } from '../../icon-button';
import { TextInput } from '../../text-input';
import { Typography } from '../../typography';
import type { SelectOption } from '../select.types';
import EmptyState from './empty-state';
import Item from './item';

export type PickerProps = {
  emptyStateResetText: string;
  emptyStateTitle: string;
  onChange?: (newValue: SelectOption) => void;
  onClose: () => void;
  open: boolean;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  value?: SelectOption;
};

const Picker = ({
  emptyStateResetText,
  emptyStateTitle,
  onChange,
  onClose,
  open,
  options,
  placeholder,
  searchPlaceholder,
  value,
}: PickerProps) => {
  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(option => {
      return option.label.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, options]);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
      visible={open}
    >
      <PickerContainer>
        <Box flexDirection="row" margin={5} center position="relative">
          <Typography variant="label-2">{placeholder}</Typography>
          <Box position="absolute" right={0}>
            <IconButton aria-label="Close" onPress={onClose}>
              <IcoClose32 />
            </IconButton>
          </Box>
        </Box>
        <Box
          borderBottomColor="tertiary"
          borderBottomWidth={1}
          paddingHorizontal={4}
          paddingVertical={5}
        >
          <StyledTextInput
            autoCorrect={false}
            autoFocus
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            value={search}
            prefixComponent={
              <Box marginLeft={4} marginVertical={5}>
                <IcoSearch24 />
              </Box>
            }
          />
        </Box>
        <FlashList
          contentContainerStyle={contentContainerStyle}
          data={filteredOptions}
          estimatedItemSize={options.length}
          keyboardShouldPersistTaps="always"
          ListEmptyComponent={
            <EmptyState
              title={emptyStateTitle}
              cta={{
                label: emptyStateResetText,
                onPress: () => setSearch(''),
              }}
            />
          }
          keyExtractor={item => item.value}
          renderItem={({ item }) => {
            return (
              <Item
                label={item.label}
                value={item.value}
                selected={value?.value === item.value}
                onPress={() => onChange?.(item)}
              />
            );
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

const StyledTextInput = styled(TextInput)`
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
