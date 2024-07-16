import { IcoClose24, IcoClose32, IcoSearch24 } from '@onefootprint/icons';
import type { CountryCode } from '@onefootprint/types';
import { FlashList } from '@shopify/flash-list';
import take from 'lodash/take';
import React, { useEffect, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Modal } from 'react-native';
import styled, { css } from 'styled-components/native';

import Box from '../../box';
import IconButton from '../../icon-button';
import LoadingIndicator from '../../loading-indicator';
import Pressable from '../../pressable';
import TextInput from '../../text-input';
import Typography from '../../typography';
import type { AddressPrediction } from '../address-input.types';
import useGoogleMapsPredictions from '../hooks/use-google-maps-predictions';
import EmptyState from './empty-state';
import Item from './item';

const MAX_OF_RESULTS = 5;

export type PickerProps = {
  country: CountryCode;
  emptyStateResetText: string;
  emptyStateText: string;
  onChange?: (newValue: AddressPrediction) => void;
  onChangeText?: (text: string) => void;
  onClose: () => void;
  open: boolean;
  searchInputProps?: TextInputProps;
  title: string;
};

const Picker = ({
  onChangeText,
  country,
  emptyStateResetText,
  emptyStateText,
  onChange,
  onClose,
  open,
  title,
  searchInputProps = {
    placeholder: 'Search...',
  },
}: PickerProps) => {
  const [search, setSearch] = useState('');
  const { data, isLoading, mutate, reset } = useGoogleMapsPredictions(country);
  const options = take(data, MAX_OF_RESULTS);

  useEffect(() => {
    if (!open) {
      resetSearch();
      reset();
    }
  }, [open]);

  const handleChangeText = (text: string) => {
    setSearch(text);
    mutate(text);
    onChangeText?.(text);
  };

  const resetSearch = () => {
    setSearch('');
    reset();
  };

  const handleChange = (prediction: AddressPrediction) => {
    onChange?.(prediction);
    onClose();
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <Box gap={3} center marginTop={12}>
          <LoadingIndicator />
        </Box>
      );
    }
    return search.length > 2 ? (
      <EmptyState
        title={emptyStateText}
        cta={{
          label: emptyStateResetText,
          onPress: resetSearch,
        }}
      />
    ) : (
      <EmptyState title="Type at least 2 letters to start" />
    );
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
            onChangeText={handleChangeText}
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
          data={options}
          estimatedItemSize={48}
          keyboardShouldPersistTaps="always"
          ListEmptyComponent={renderEmptyState}
          keyExtractor={item => item.place_id.toString()}
          renderItem={({ item }) => {
            return (
              <Item
                onPress={() => handleChange(item)}
                subtitle={item.structured_formatting.secondary_text}
                title={item.structured_formatting.main_text}
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
